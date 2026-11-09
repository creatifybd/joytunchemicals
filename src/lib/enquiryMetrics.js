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

// Counts genuine saved product-enquiry records, not views, sales or GA4 attribution.
// Only records with usable server timestamps are included in the recent ranking.
export function topEnquiredProducts(orders=[], products=[], now=Date.now(), limit=5) {
  const productNames = new Map((Array.isArray(products)?products:[]).map(p=>[p.id,
    [p.name,p.variant,p.format].filter(Boolean).join(' — ')]))
  const counts=new Map()
  const cutoff=now-28*DAY_MS
  for(const record of Array.isArray(orders)?orders:[]){
    if(record?.type!=='product-enquiry'||typeof record.productId!=='string'||!record.productId)continue
    const ms=enquiryTimestampMs(record.createdAt)
    if(ms===null||ms<cutoff||ms>now)continue
    counts.set(record.productId,(counts.get(record.productId)||0)+1)
  }
  return [...counts].map(([productId,count])=>({
    productId,
    name:productNames.get(productId)||'Archived or unavailable product',
    count
  })).sort((a,b)=>b.count-a.count||a.productId.localeCompare(b.productId)).slice(0,Math.max(0,limit))
}
