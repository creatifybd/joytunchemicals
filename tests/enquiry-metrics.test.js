import test from 'node:test'
import assert from 'node:assert/strict'
import {summarizeEnquiryRecords,enquiryTimestampMs} from '../src/lib/enquiryMetrics.js'

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
