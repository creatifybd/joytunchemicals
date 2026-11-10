import test from 'node:test'
import assert from 'node:assert/strict'
import {getCategoryBanners} from '../src/data/heroBanners.js'
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
