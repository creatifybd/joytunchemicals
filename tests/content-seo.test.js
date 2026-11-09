import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultSite,mergeSite,LOCATION,validateSite,safeUrl,resolveProductImage} from '../src/data/site.js'
import {approvedProducts,filterCatalogue} from '../src/data/catalogue.js'
import {getSeo} from '../src/data/seo.js'
import {discoveryTopics,getDiscoveryProducts,getProductDiscoveryTopic,discoveryPath} from '../src/data/searchLanding.js'
test('old office content cannot replace the single approved location',()=>{
 const site=mergeSite({brand:{location:'AHN Tower',name:'Updated company'},home:{title:'A new title'}})
 assert.equal(site.brand.location,LOCATION);assert.equal(site.brand.name,'Updated company');assert.equal(site.home.title,'A new title');assert.equal(site.home.description,defaultSite.home.description)
})
test('editorial arrays replace defaults including intentionally empty sections',()=>{
 const site=mergeSite({faqs:[],navigation:[{label:'Collection',url:'/products'}],appearance:{motion:false}})
 assert.equal(site.faqs.length,0);assert.equal(site.navigation.length,1);assert.equal(site.appearance.motion,false);assert.equal(site.appearance.ink,defaultSite.appearance.ink)
})
test('publishing rejects duplicate category IDs and invalid homepage order',()=>{
 assert.equal(validateSite(defaultSite),null)
 assert.match(validateSite({...defaultSite,categories:[defaultSite.categories[0],defaultSite.categories[0]]}),/unique/)
 assert.match(validateSite({...defaultSite,home:{...defaultSite.home,sectionOrder:['hero']}}),/section/)
})
test('managed category names and product fields drive filtering',()=>{
 const categories=[{id:'new-category',cat:'New care',name:'New care'}]
 const products=[{id:'new',name:'New cleaner',category:'new-category',cat:'New care',status:'active'}]
 assert.equal(filterCatalogue(products,'new-category','cleaner',categories).length,1)
 assert.equal(resolveProductImage(approvedProducts[0].id,approvedProducts),approvedProducts[0].img)
})
test('links reject script and protocol-relative schemes',()=>{
 assert.equal(safeUrl('javascript:alert(1)'),'/');assert.equal(safeUrl('//evil.example'),'/');assert.equal(safeUrl('/products'),'/products')
})
test('product SEO resolves stable canonical URLs, originals and breadcrumbs without fake ratings',()=>{
 const p=approvedProducts[0];const seo=getSeo(defaultSite,approvedProducts,`/products/${p.slug}`)
 assert.equal(seo.url,`https://www.joytunchemicals.com/products/${p.slug}`);assert(seo.title.includes('Aro'));assert(seo.image.endsWith(p.img));assert.equal(seo.schema['@graph'].find(v=>v['@type']==='Product').aggregateRating,undefined)
 assert.equal(getSeo(defaultSite,approvedProducts,'/products',`?product=${p.slug}`).url,seo.url)
})
test('search, draft previews and missing pages cannot be indexed',()=>{
 for(const [path,query]of [['/products','?q=lemon'],['/','?preview=1'],['/does-not-exist',''],['/products/unavailable',''],['/admin/login','']])assert.match(getSeo(defaultSite,approvedProducts,path,query).robots,/noindex/)
 assert.match(getSeo({...defaultSite,seo:{...defaultSite.seo,indexable:false}},approvedProducts,'/').robots,/noindex/)
})

test('story slideshow defaults survive existing saved sites and remain editable',()=>{
 const existing=mergeSite({home:{storyTitle:'Existing title'}})
 assert.equal(existing.storySlides.length,5)
 assert.equal(existing.home.storyTitle,'Existing title')
 assert.equal(mergeSite({storySlides:[]}).storySlides.length,0)
 const custom={image:'/custom.jpg',alt:'Custom image',title:'Custom title',subtitle:'Custom subtitle'}
 assert.deepEqual(mergeSite({storySlides:[custom]}).storySlides,[custom])
 assert.match(validateSite({...defaultSite,storySlides:[{...custom,image:'javascript:alert(1)'}]}),/story slide/)
})

test('existing homepage order gains videos without losing customised order',()=>{
 const old=['hero','categories','story','featured','ritual','brands','partner']
 const merged=mergeSite({home:{sectionOrder:old}})
 assert.deepEqual(merged.home.sectionOrder,['hero','categories','story','featured','ritual','videos','brands','partner'])
 assert.deepEqual(old,['hero','categories','story','featured','ritual','brands','partner'])
 assert.equal(validateSite(merged),null)
 assert.deepEqual(mergeSite(merged).home.sectionOrder,merged.home.sectionOrder)
 assert.equal(merged.videos.items.length,4)
 assert.equal(mergeSite({videos:{enabled:false,items:[]}}).videos.enabled,false)
 assert.equal(mergeSite({videos:{items:[]}}).videos.items.length,0)
})
test('video settings reject malformed IDs and duplicate films',()=>{
 for(const items of [[{videoId:'https://evil.test',title:'Test'}],[defaultSite.videos.items[0],defaultSite.videos.items[0]]])
 assert.match(validateSite(mergeSite({videos:{items}})),/video/)
})


test('all active SKUs have distinct search identities and accurate image relationships',()=>{
 const seen=new Set()
 for(const p of approvedProducts){
  const seo=getSeo(defaultSite,approvedProducts,`/products/${p.slug}`)
  assert(!seen.has(seo.title),`Duplicate title: ${seo.title}`);seen.add(seo.title)
  assert(seo.title.includes(p.format));assert(seo.description.includes(p.variant))
  const item=seo.schema['@graph'].find(n=>n['@type']==='Product')
  assert.equal(item.url,seo.url);assert.equal(item.mainEntityOfPage['@id'],seo.url+'#page')
  assert(item.image.includes(seo.image));assert.equal(item.offers,undefined);assert.equal(item.aggregateRating,undefined)
 }
 const p={...approvedProducts[0],seoTitle:'Approved custom title',seoDescription:'Approved custom description'}
 assert.equal(getSeo(defaultSite,[p],`/products/${p.slug}`).title,p.seoTitle)
 assert.equal(getSeo(defaultSite,[p],`/products/${p.slug}`).description,p.seoDescription)
})

test('seven distinct, relevant search discovery topics use only catalogue products',()=>{
 assert.equal(discoveryTopics.length,7)
 assert.equal(new Set(discoveryTopics.map(t=>t.slug)).size,7)
 for(const topic of discoveryTopics){
   const items=getDiscoveryProducts(topic,approvedProducts)
   assert(items.length,topic.slug+' has no products')
   const seo=getSeo(defaultSite,approvedProducts,'/care/'+topic.slug)
   assert.equal(seo.url,'https://www.joytunchemicals.com/care/'+topic.slug)
   assert.match(seo.robots,/index,follow/)
   assert.equal(seo.schema['@graph'].find(x=>x['@type']==='CollectionPage')?.hasPart?.length,items.length)
   assert(!seo.title.toLowerCase().includes('best '),'Do not make unverified superiority claims')
 }
 assert.match(getSeo(defaultSite,approvedProducts,'/care/not-real').robots,/noindex/)
})

test('all approved SKUs link to a matching topical care guide; guides carry real breadcrumbs',()=>{
 assert.equal(approvedProducts.length,24)
 for(const product of approvedProducts){
   const topic=getProductDiscoveryTopic(product)
   assert(topic,product.slug+' has no matched guide')
   assert(getDiscoveryProducts(topic,approvedProducts).some(p=>p.slug===product.slug))
   const seo=getSeo(defaultSite,approvedProducts,'/products/'+product.slug)
   const crumbs=seo.schema['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement
   assert.deepEqual(crumbs.map(v=>v.name),['Home','Our products',[product.name,product.variant,product.format].filter(Boolean).join(' — ')])
   assert.equal(crumbs[1].item,'https://www.joytunchemicals.com/products')
   assert.equal(crumbs[2].item,seo.url)
 }
 for(const topic of discoveryTopics){
   assert.equal(discoveryPath(topic),'/care/'+topic.slug)
   const seo=getSeo(defaultSite,approvedProducts,discoveryPath(topic))
   const crumbs=seo.schema['@graph'].find(n=>n['@type']==='BreadcrumbList').itemListElement
   assert.deepEqual(crumbs.map(v=>v.name),['Home','Our products',topic.name])
   assert.deepEqual(crumbs.map(v=>v.position),[1,2,3])
   assert.equal(crumbs[2].item,seo.url)
 }
})
