import test from 'node:test'
import assert from 'node:assert/strict'
import {createEnquirySubmitter} from '../src/lib/enquirySubmission.js'

test('contact lead event follows confirmed successful Firestore save only once',async()=>{
  let resolve
  const deferred=new Promise(done=>{resolve=done})
  let writes=0
  const events=[]
  const save=async payload=>{writes++;assert.equal(payload.name,'Private Visitor');await deferred}
  const submit=createEnquirySubmitter({save,emit:(...args)=>events.push(args),formId:'contact'})
  const lead={name:'Private Visitor',phone:'017...',email:'private@example.com',msg:'secret enquiry'}
  const inFlight=submit(lead)
  assert.equal(await submit(lead),'ignored')
  assert.equal(writes,1)
  assert.deepEqual(events,[])
  resolve()
  assert.equal(await inFlight,'success')
  assert.equal(await submit(lead),'ignored')
  assert.deepEqual(events,[['generate_lead',{form_id:'contact'}]])
  assert.equal(JSON.stringify(events).includes('Private Visitor'),false)
  assert.equal(JSON.stringify(events).includes('private@example.com'),false)
})
test('failed product enquiry can retry, but never generates a lead on failure',async()=>{
  let writes=0
  const events=[]
  const submit=createEnquirySubmitter({
    save:async()=>{writes++;if(writes===1)throw new Error('Firestore connection failed')},
    emit:(name,fields)=>events.push({name,fields}),
    formId:'product_enquiry',
    itemId:'vix-lemon-bar'
  })
  assert.equal(await submit({phone:'private'}),'error')
  assert.deepEqual(events,[{name:'form_error',fields:{form_id:'product_enquiry',error_type:'submission_failed'}}])
  assert.equal(await submit({phone:'private'}),'success')
  assert.equal(await submit({phone:'private'}),'ignored')
  assert.equal(writes,2)
  assert.deepEqual(events[1],{name:'generate_lead',fields:{form_id:'product_enquiry',item_id:'vix-lemon-bar'}})
})
test('analytics delivery errors cannot turn a saved enquiry into a failure',async()=>{
  let writes=0
  const submit=createEnquirySubmitter({
    save:async()=>{writes++},
    emit:()=>{throw new Error('Tracking blocked')},
    formId:'contact'
  })
  assert.equal(await submit({name:'private'}),'success')
  assert.equal(writes,1)
})
test('submitter rejects unexpected form identifiers and missing capabilities',()=>{
  assert.throws(()=>createEnquirySubmitter({save:()=>{},emit:()=>{},formId:'payment'}),/Unrecognized/)
  assert.throws(()=>createEnquirySubmitter({save:null,emit:()=>{},formId:'contact'}),/required/)
})
