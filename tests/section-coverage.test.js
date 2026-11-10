import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { sanitizeEvent, trackingAllowed, meetsSectionExposure } from '../src/lib/measurement.js'

const pages=readFileSync('src/site/Pages.jsx','utf8')
const product=readFileSync('src/site/Product.jsx','utf8')
const expected=[
 'catalogue_intro','product_catalogue',
 'about_intro','about_gallery','about_story','about_brands','about_purpose',
 'contact_intro','contact_details','contact_faq'
]

test('all product, about, and contact report sections are uniquely marked for consented impressions',()=>{
 const found=[...pages.matchAll(/data-section="([a-z_]+)"/g)].map(x=>x[1])
 assert.deepEqual(found.sort(),[...expected].sort())
 assert.equal(new Set(found).size,found.length)
 assert.match(product,/data-section="product_detail"/)
 for(const id of expected)assert.match(id,/^[a-z_]{1,40}$/)
})

test('section tracking only sends a bounded section id with no form values',()=>{
 const event=sanitizeEvent('section_view',{
  section_id:'contact_details',
  name:'Private Name',email:'user@example.com',
  phone:'+8801000000000',message:'Private content'
 })
 assert.deepEqual(event,{section_id:'contact_details'})
 assert.equal(trackingAllowed({enabled:true,consent:'declined',pathname:'/contact'}),false)
 assert.equal(trackingAllowed({enabled:true,consent:'accepted',pathname:'/contact'}),true)
 assert.equal(meetsSectionExposure({isIntersecting:true,intersectionRatio:.08},false),false)
 assert.equal(meetsSectionExposure({isIntersecting:true,intersectionRatio:.12},false),true)
})
