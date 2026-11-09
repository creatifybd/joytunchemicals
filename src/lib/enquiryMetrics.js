// First-party record counts from already-authorized Admin Firestore subscriptions.
// Not GA4 events, unique visitors, qualified leads, sales, or attributed conversions.
const DAY_MS=24*60*60*1000
export const enquiryTimestampMs = value => {
  if(!value)return null
  let millis=null
  if(typeof value.toMillis==='function')millis=value.toMillis()
  else if(value instanceof Date)millis=value.getTime()
  else if(Number.isFinite(value.seconds))millis=value.seconds*1000
  return Number.isFinite(millis)?millis:null
}
export function summarizeEnquiryRecords(orders=[], messages=[], now=Date.now()){
  const product=(Array.isArray(orders)?orders:[]).filter(v=>v?.type==='product-enquiry')
  const contact=(Array.isArray(messages)?messages:[]).filter(v=>v&&typeof v==='object')
  const entries=[...product,...contact]
  const cutoff=now-28*DAY_MS
  let last28Days=0,undated=0
  for(const record of entries){
    const ms=enquiryTimestampMs(record.createdAt)
    if(ms===null)undated++
    else if(ms>=cutoff&&ms<=now)last28Days++
  }
  return {contactMessages:contact.length,productEnquiries:product.length,totalRecords:entries.length,last28Days,undated}
}
