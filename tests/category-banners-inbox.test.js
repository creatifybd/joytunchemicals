import test from 'node:test'
import assert from 'node:assert/strict'
import {getCategoryBanners,CATEGORY_BANNER_AUTOPLAY_MS,canAutoplayCategoryBanners} from '../src/data/heroBanners.js'
import {readFileSync} from 'node:fs'
import {defaultSite,mergeSite} from '../src/data/site.js'
import {approvedProducts} from '../src/data/catalogue.js'
import {inboxLoadStatus} from '../src/lib/enquiryMetrics.js'

test('six categories each have a distinct live banner using the existing approved catalogue',()=>{
 const banners=getCategoryBanners(defaultSite,approvedProducts)
 assert.equal(banners.length,6)
 assert.equal(new Set(banners.map(v=>v.category.id)).size,6)
 for(const {category,primary,secondary} of banners){
   assert.equal(primary.status,'active')
   assert.equal(primary.category,category.id)
   assert(approvedProducts.includes(primary),'Banner must use the unchanged approved original asset')
   assert(primary.img.startsWith('/images/'))
   if(secondary){assert(approvedProducts.includes(secondary));assert.notEqual(secondary.id,primary.id)}
 }
})

test('category banners skip unpublished collections and missing products without invented images',()=>{
 const disabled=mergeSite({categories:defaultSite.categories.map(c=>({...c,status:c.id==='hand'?'draft':'active'}))})
 assert.equal(getCategoryBanners(disabled,approvedProducts).length,5)
 assert.deepEqual(getCategoryBanners(disabled,[]),[])
 assert.equal(mergeSite({home:{showCategoryHero:false}}).home.showCategoryHero,false)
 assert.equal(mergeSite({}).home.showCategoryHero,true)
})

test('inbox errors and loading states cannot be represented as confirmed zero enquiries',()=>{
 assert.equal(inboxLoadStatus({orders:false,messages:false},'','messages'),'loading')
 assert.equal(inboxLoadStatus({orders:true,messages:false},'','orders'),'ready')
 assert.equal(inboxLoadStatus({orders:true,messages:false},'Permission denied','orders'),'error')
 assert.equal(inboxLoadStatus({orders:true,messages:true},'','messages'),'ready')
})

test('category banner automatically advances every three seconds unless visibility or accessible motion requires pause',()=>{
 assert.equal(CATEGORY_BANNER_AUTOPLAY_MS,3000)
 const base={count:6,keyboardPaused:false,visible:true,tabVisible:true,reducedMotion:false,motionEnabled:true}
 assert.equal(canAutoplayCategoryBanners(base),true)
 for(const patch of [{count:1},{keyboardPaused:true},{visible:false},{tabVisible:false},{reducedMotion:true},{motionEnabled:false}]){
  assert.equal(canAutoplayCategoryBanners({...base,...patch}),false)
 }
})

test('the carousel uses identical product slots and has no unequal primary/secondary sizing',()=>{
 const component=readFileSync('src/site/CategoryHero.jsx','utf8')
 const css=readFileSync('src/premium.css','utf8')
 assert.match(component,/care-banner-product-slot/)
 assert.match(component,/care-banner-product-image/)
 assert(!component.includes('care-banner-primary'))
 assert(!component.includes('care-banner-secondary'))
 assert(!css.includes('.public-site .care-banner-primary{'))
 assert(!css.includes('.public-site .care-banner-secondary{'))
 assert.match(css,/grid-template-columns:repeat\(2,minmax\(0,1fr\)\)/)
 assert.match(css,/object-fit:contain/)
})
