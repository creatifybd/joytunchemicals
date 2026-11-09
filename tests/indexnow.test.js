import test from 'node:test'
import assert from 'node:assert/strict'
import {affectsIndexableContent,indexNowPayload} from '../scripts/submit-indexnow.js'
const key='4d7c1ece067c8c62437433bb57e31e8a'
test('only meaningful published content changes notify IndexNow, not analytics/build noise',()=>{
 assert.equal(affectsIndexableContent(['src/site/Measurement.jsx','tests/measurement.test.js']),false)
 assert.equal(affectsIndexableContent(['src/data/catalogue.js']),true)
 assert.equal(affectsIndexableContent(['src/data/searchLanding.js']),true)
 assert.equal(affectsIndexableContent(['public/index.php']),true)
 assert.equal(affectsIndexableContent(['public/robots.txt']),true)
 assert.equal(affectsIndexableContent(['src/site/Product.jsx']),true)
 assert.equal(affectsIndexableContent(['public/images/products/rio-detergent.png']),true)
})
test('IndexNow batch accepts only same-origin canonical URLs and limits the batch',()=>{
 const domain='https://www.joytunchemicals.com'
 const actual=indexNowPayload({urls:[domain+'/',domain+'/products',domain+'/products'],key})
 assert.equal(actual.urlList.length,2)
 assert.equal(actual.host,'www.joytunchemicals.com')
 assert.equal(actual.keyLocation,domain+'/'+key+'.txt')
 assert.throws(()=>indexNowPayload({urls:[domain+'/', 'https://other.example/fake'],key}),/Unexpected URL host/)
 assert.throws(()=>indexNowPayload({urls:[],key}),/Invalid IndexNow URL list/)
 assert.throws(()=>indexNowPayload({urls:[domain+'/'],key:'x'}),/Invalid IndexNow key/)
})
