// Strict event allowlist: never forward form values, arbitrary URLs or search text.
export const eventFields={
 page_view:['page_path','page_location','page_title','page_referrer'],
 section_view:['section_id'],select_content:['content_type','item_id','section_id'],
 view_item:['item_id','item_brand','item_category','items'],
 select_item:['item_id','item_brand','item_category','section_id','item_list_name','items'],category_select:['category_id'],
 contact_click:['contact_method','section_id'],form_start:['form_id'],
 generate_lead:['form_id','item_id'],form_error:['form_id','error_type'],
 video_open:['video_id'],video_start:['video_id'],video_progress:['video_id','video_percent'],video_complete:['video_id']
}
// GA4 ecommerce reports require a structured items array, not a stringified object.
// Restrict every item to first-party catalogue labels; never pass arbitrary form data.
const itemText=value=>typeof value==='string'&&!/[@<>]|https?:\/\//i.test(value)?value.trim().slice(0,100):''
export function sanitizeItems(items){
 if(!Array.isArray(items)||items.length!==1||!items[0]||typeof items[0]!=='object'||Array.isArray(items[0]))return null
 const item=items[0],id=itemText(item.item_id),name=itemText(item.item_name)
 if(!id&&!name)return null
 if(id&&!/^[A-Za-z0-9_-]{1,100}$/.test(id))return null
 return [Object.fromEntries([
  ['item_id',id],['item_name',name],
  ['item_brand',itemText(item.item_brand)],
  ['item_category',itemText(item.item_category)],
  ['item_variant',itemText(item.item_variant)]
 ].filter(([,v])=>v))]
}
export function sanitizeEvent(name,params={}){
 if(!eventFields[name])return null
 if(name==='select_item'&&!sanitizeItems(params.items))return null
 const entries=[]
 for(const key of eventFields[name]){
  if(params[key]===undefined)continue
  if(key==='items'){
   const items=sanitizeItems(params.items)
   if(items)entries.push([key,items])
  }else entries.push([key,typeof params[key]==='number'?params[key]:String(params[key]).slice(0,200)])
 }
 return Object.fromEntries(entries)
}
export function cleanLocation(href){
 const u=new URL(href,'https://www.joytunchemicals.com')
 const allowed=['utm_source','utm_medium','utm_campaign','utm_content','utm_term']
 const result=new URL(u.pathname,u.origin)
 for(const key of allowed){const value=u.searchParams.get(key);if(value&&/^[a-zA-Z0-9_.-]{1,100}$/.test(value))result.searchParams.set(key,value)}
 return result.href
}
// An IntersectionObserver can report isIntersecting for a tiny sliver (<10%).
// Require the documented 10% exposure threshold before starting the 1-second timer.
export function meetsSectionExposure(entry,documentHidden=false){
 return !!entry?.isIntersecting&&Number(entry.intersectionRatio)>=0.1&&!documentHidden
}
export function trackingAllowed({enabled,consent,pathname,search='',isAdmin=false,internal=false}){
 return !!enabled&&consent==='accepted'&&!isAdmin&&!internal&&!pathname.startsWith('/admin')&&!new URLSearchParams(search).has('preview')
}
let active=false,mode='',id=''
export function setMeasurement(activeNow,settings={}){
 active=!!activeNow;mode=settings.mode;id=settings.measurementId
 if(active&&typeof window!=='undefined'&&typeof window.dispatchEvent==='function')window.dispatchEvent(new Event('joytun-measurement-ready'))
}
export const measurementEnabled=()=>active
export function track(name,params={}){
 const clean=sanitizeEvent(name,params)
 if(!active||!clean||typeof window==='undefined')return false
 // The UI may mount before an asynchronous tag is ready. Do not claim an event
 // was delivered when neither the GA4 queue nor the GTM dataLayer exists.
 if(mode==='gtm'&&!Array.isArray(window.dataLayer))return false
 if(mode!=='gtm'&&typeof window.gtag!=='function')return false
 const fields={...clean,page_path:window.location.pathname,page_location:cleanLocation(window.location.href)}
 if(mode==='gtm'){
  // Follow Google's documented ecommerce dataLayer shape for GTM. Clearing
  // stale ecommerce data avoids carrying a previous SKU into the next event.
  if(clean.items)window.dataLayer.push({ecommerce:null})
  const payload={...fields}
  if(clean.items){delete payload.items;payload.ecommerce={items:clean.items}}
  window.dataLayer.push({...Object.fromEntries([...new Set(Object.values(eventFields).flat())].filter(k=>k!=='items').map(k=>[k,null])),event:name,...payload})
 }else window.gtag?.('event',name,{...fields,send_to:id})
 return true
}
export const productMeasurement=p=>({
 item_id:p.slug||p.id,
 item_brand:p.brand||'',
 item_category:p.category||p.cat||'',
 items:[{
  item_id:p.slug||p.id,
  item_name:p.name||p.type||'',
  item_brand:p.brand||'',
  item_category:p.category||p.cat||'',
  item_variant:p.variant||''
 }]
})
