import test from 'node:test'
import assert from 'node:assert/strict'
import {sanitizeEvent,cleanLocation,trackingAllowed,setMeasurement,track} from '../src/lib/measurement.js'
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
