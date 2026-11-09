import test from 'node:test'
import assert from 'node:assert/strict'
import {summarizeEnquiryRecords,enquiryTimestampMs,topEnquiredProducts} from '../src/lib/enquiryMetrics.js'

test('admin enquiry summary counts only saved contact messages and product enquiries',()=>{
 const now=Date.UTC(2026,10,9)
 const current={seconds:(now-7*86400000)/1000}
 const product=[{type:'product-enquiry',createdAt:current,name:'Private name'}, {type:'product-enquiry',createdAt:null}, {type:'order',createdAt:current}, {createdAt:current}]
 const contact=[{createdAt:{toMillis:()=>now-86400000},email:'private@example.com'}, {createdAt:new Date(now-40*86400000)}, {createdAt:{seconds:(now-28*86400000)/1000}}]
 assert.deepEqual(summarizeEnquiryRecords(product,contact,now),{contactMessages:3,productEnquiries:2,totalRecords:5,last28Days:3,undated:1})
})
test('time summary is deliberately conservative for missing, future or invalid timestamps',()=>{
 const now=Date.UTC(2026,10,9)
 assert.equal(enquiryTimestampMs(null),null)
 assert.equal(enquiryTimestampMs({seconds:'invalid'}),null)
 assert.equal(enquiryTimestampMs({toMillis:()=>Number.NaN}),null)
 assert.equal(summarizeEnquiryRecords([], [{createdAt:{seconds:(now+86400000)/1000}}],now).last28Days,0)
 assert.deepEqual(Object.keys(summarizeEnquiryRecords([],[],now)).sort(),['contactMessages','last28Days','productEnquiries','totalRecords','undated'].sort())
})

test('28-day product interest uses only saved, dated product enquiry records',()=>{
 const now=Date.UTC(2026,10,9),ts=days=>({seconds:(now-days*86400000)/1000})
 const products=[{id:'joytun-vix-lemon-bar',name:'Vix Dish Wash Bar',variant:'Lemon',format:'300 g bar'},{id:'joytun-nolive-lavender-pump',name:'n’Olive Hand Wash',variant:'Lavender',format:'Pump bottle'}]
 const orders=[
  {type:'product-enquiry',productId:'joytun-vix-lemon-bar',createdAt:ts(1),phone:'private'},
  {type:'product-enquiry',productId:'joytun-vix-lemon-bar',createdAt:ts(2)},
  {type:'product-enquiry',productId:'joytun-nolive-lavender-pump',createdAt:ts(3)},
  {type:'product-enquiry',productId:'joytun-nolive-lavender-pump',createdAt:ts(40)},
  {type:'product-enquiry',productId:'joytun-vix-lemon-bar',createdAt:null},
  {type:'order',productId:'joytun-vix-lemon-bar',createdAt:ts(1)}
 ]
 const ranked=topEnquiredProducts(orders,products,now)
 assert.deepEqual(ranked.map(v=>v.count),[2,1])
 assert.deepEqual(ranked.map(v=>v.productId),['joytun-vix-lemon-bar','joytun-nolive-lavender-pump'])
 assert.equal(JSON.stringify(ranked).includes('private'),false)
 assert.deepEqual(topEnquiredProducts(orders,products,now,1).map(v=>v.count),[2])
})
