import test from 'node:test'
import assert from 'node:assert/strict'
import {getAnalyticsReadiness,JOYTUN_GA4} from '../src/lib/analyticsHealth.js'

test('analytics diagnostics fail safe without claiming tracking delivery',()=>{
  assert.equal(getAnalyticsReadiness({enabled:false}).status,'off')
  assert.equal(getAnalyticsReadiness({enabled:true,mode:'direct',measurementId:''}).status,'review')
  assert.equal(getAnalyticsReadiness({enabled:true,mode:'direct',measurementId:'G-OTHER'}).status,'review')
  const matched=getAnalyticsReadiness({enabled:true,mode:'direct',measurementId:JOYTUN_GA4.measurementId})
  assert.equal(matched.status,'configured')
  assert.match(matched.detail,/still required/)
  assert.equal(getAnalyticsReadiness({enabled:true,mode:'gtm',containerId:'GTM-ABC123'}).status,'review')
})
