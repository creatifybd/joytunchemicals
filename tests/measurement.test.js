import test from 'node:test'
import assert from 'node:assert/strict'
import {sanitizeEvent,cleanLocation,trackingAllowed,setMeasurement,track,meetsSectionExposure,productMeasurement,sanitizeItems} from '../src/lib/measurement.js'
import {defaultSite,mergeSite,validateSite} from '../src/data/site.js'
import {getSeo} from '../src/data/seo.js'
import {approvedProducts} from '../src/data/catalogue.js'
test('enquiry payload cannot forward visitor form values',()=>{
 assert.deepEqual(sanitizeEvent('generate_lead',{form_id:'contact',name:'Private name',email:'private@example.com',phone:'123',message:'Private message'}),{form_id:'contact'})
 assert.equal(sanitizeEvent('unknown_event',{email:'private@example.com'}),null)
})
test('page URLs keep approved campaign labels and strip free text, identifiers and fragments',()=>{
 assert.equal(cleanLocation('https://www.joytunchemicals.com/products?q=private%40example.com&email=private%40example.com&utm_source=facebook&utm_campaign=rio_launch#private'),'https://www.joytunchemicals.com/products?utm_source=facebook&utm_campaign=rio_launch')
 assert.equal(cleanLocation('https://www.joytunchemicals.com/?utm_campaign=private%40example.com'),'https://www.joytunchemicals.com/')
})
test('consent, preview, admin and internal-browser exclusions fail closed',()=>{
 const base={enabled:true,consent:'accepted',pathname:'/'}
 assert.equal(trackingAllowed(base),true)
 for(const patch of [{enabled:false},{consent:'declined'},{consent:''},{pathname:'/admin/marketing'},{search:'?preview=1'},{isAdmin:true},{internal:true}])assert.equal(trackingAllowed({...base,...patch}),false)
})
test('unconfigured analytics cannot be enabled, defaults send nothing',()=>{
 assert.equal(defaultSite.analytics.enabled,false)
 assert.equal(validateSite(mergeSite({analytics:{enabled:true}})),'Add the tracking ID before enabling analytics.')
 assert.match(validateSite(mergeSite({analytics:{measurementId:'javascript:alert(1)'}})),/measurement ID/)
 assert.equal(track('generate_lead',{form_id:'contact'}),false)
})
test('delivery uses one destination and strips PII',()=>{
 const calls=[],dataLayer=[];globalThis.window={location:{pathname:'/',href:'https://www.joytunchemicals.com/?email=private'},dispatchEvent(){},gtag:(...args)=>calls.push(args),dataLayer}
 try{setMeasurement(true,{mode:'direct',measurementId:'G-TEST123'});track('generate_lead',{form_id:'contact',email:'private'});assert.equal(calls.length,1);assert.equal(dataLayer.length,0);assert.equal(calls[0][2].email,undefined);assert.equal(calls[0][2].page_location,'https://www.joytunchemicals.com/');setMeasurement(true,{mode:'gtm'});track('video_start',{video_id:'wigDoKBu8HQ'});assert.equal(calls.length,1);assert.equal(dataLayer.length,1)}finally{setMeasurement(false);delete globalThis.window}
})
test('brand pages have indexable canonical metadata and real product links',()=>{
 for(const slug of ['nolive','rio']){const seo=getSeo(defaultSite,approvedProducts,`/brands/${slug}`);assert.equal(seo.missing,false);assert.equal(seo.url,`https://www.joytunchemicals.com/brands/${slug}`);assert.match(seo.robots,/^index/);assert(seo.schema['@graph'].find(v=>v['@type']==='CollectionPage').hasPart.length>0)}
 assert.equal(getSeo(defaultSite,approvedProducts,'/brands/missing').missing,true)
})

test('section exposure requires at least 10 percent visible for its one-second timer',()=>{
 assert.equal(meetsSectionExposure({isIntersecting:true,intersectionRatio:0.099},false),false)
 assert.equal(meetsSectionExposure({isIntersecting:true,intersectionRatio:0.1},false),true)
 assert.equal(meetsSectionExposure({isIntersecting:true,intersectionRatio:1},true),false)
 assert.equal(meetsSectionExposure({isIntersecting:false,intersectionRatio:0.4},false),false)
 assert.equal(meetsSectionExposure(null,false),false)
})

test('tracking never claims delivery before GA4 or GTM destination is ready',()=>{
 const calls=[]
 globalThis.window={location:{pathname:'/products/rio-detergent',href:'https://www.joytunchemicals.com/products/rio-detergent'},dispatchEvent(){}}
 try{
   setMeasurement(true,{mode:'direct',measurementId:'G-TEST'})
   assert.equal(track('view_item',{item_id:'rio-detergent'}),false)
   assert.equal(track('generate_lead',{form_id:'contact'}),false)
   window.gtag=(...args)=>calls.push(args)
   assert.equal(track('view_item',{item_id:'rio-detergent'}),true)
   assert.equal(calls.length,1)
   setMeasurement(true,{mode:'gtm'})
   delete window.dataLayer
   assert.equal(track('generate_lead',{form_id:'contact'}),false)
   window.dataLayer=[]
   assert.equal(track('generate_lead',{form_id:'contact'}),true)
   assert.equal(window.dataLayer.length,1)
 }finally{setMeasurement(false);delete globalThis.window}
})

test('GA4 item payloads use approved product names and drop unknown data',()=>{
 const p=approvedProducts.find(v=>v.slug==='nolive-lavender-pump')||approvedProducts[0]
 const payload=productMeasurement(p)
 const view=sanitizeEvent('view_item',payload)
 assert.equal(view.item_id,p.slug||p.id)
 assert.deepEqual(view.items,[{
  item_id:p.slug||p.id,
  item_name:p.name,
  item_brand:p.brand,
  item_category:p.category,
  item_variant:p.variant
 }])
 const click=sanitizeEvent('select_item',{...payload,section_id:'featured',item_list_name:'featured',email:'secret@example.com',phone:'12345'})
 assert.equal(click.items[0].item_id,p.slug||p.id)
 assert.equal(click.section_id,'featured')
 assert.equal(click.item_list_name,'featured')
 assert.equal(click.email,undefined)
 assert.equal(click.phone,undefined)
 assert.equal(sanitizeEvent('select_item',{items:'[object Object]'}),null)
 assert.equal(sanitizeItems([{item_id:'123',item_name:'Good'},{item_id:'456'}]),null)
 assert.equal(sanitizeItems([{item_id:'bad@example.com',item_name:'Product'}]),null)
 assert.deepEqual(sanitizeItems([{item_id:'valid-product',item_name:'Product',email:'secret@example.com',website:'https://example.com'}]),[{item_id:'valid-product',item_name:'Product'}])
})

test('GA4 direct sends structured items; GTM clears stale ecommerce and sends fresh items',()=>{
 const direct=[],layer=[]
 globalThis.window={
  location:{pathname:'/products',href:'https://www.joytunchemicals.com/products?email=private'},
  dispatchEvent(){},gtag:(...args)=>direct.push(args),dataLayer:layer
 }
 try{
  const p=approvedProducts[0],params=productMeasurement(p)
  setMeasurement(true,{mode:'direct',measurementId:'G-TEST'})
  assert.equal(track('view_item',params),true)
  assert.equal(direct.length,1)
  assert.equal(direct[0][0],'event')
  assert.equal(direct[0][1],'view_item')
  assert.equal(direct[0][2].items[0].item_id,p.slug||p.id)
  assert.equal(direct[0][2].page_location,'https://www.joytunchemicals.com/products')
  setMeasurement(true,{mode:'gtm'})
  assert.equal(track('select_item',{...params,section_id:'featured',item_list_name:'featured'}),true)
  assert.equal(layer.length,2)
  assert.deepEqual(layer[0],{ecommerce:null})
  assert.equal(layer[1].event,'select_item')
  assert.equal(layer[1].ecommerce.items[0].item_id,p.slug||p.id)
  assert.equal(layer[1].items,undefined)
 }finally{setMeasurement(false);delete globalThis.window}
})
