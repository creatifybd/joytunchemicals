import test from 'node:test'
import assert from 'node:assert/strict'
import {defaultSite,mergeSite,LOCATION,validateSite,safeUrl,resolveProductImage} from '../src/data/site.js'
import {approvedProducts,filterCatalogue} from '../src/data/catalogue.js'
import {getSeo} from '../src/data/seo.js'
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
