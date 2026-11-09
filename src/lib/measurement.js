// Strict event allowlist: never forward form values, arbitrary URLs or search text.
export const eventFields={
 page_view:['page_path','page_location','page_title','page_referrer'],
 section_view:['section_id'],select_content:['content_type','item_id','section_id'],
 view_item:['item_id','item_brand','item_category'],category_select:['category_id'],
 contact_click:['contact_method','section_id'],form_start:['form_id'],
 generate_lead:['form_id','item_id'],form_error:['form_id','error_type'],
 video_open:['video_id'],video_start:['video_id'],video_progress:['video_id','video_percent'],video_complete:['video_id']
}
export function sanitizeEvent(name,params={}){
 if(!eventFields[name])return null
 return Object.fromEntries(eventFields[name].filter(k=>params[k]!==undefined).map(k=>[k,typeof params[k]==='number'?params[k]:String(params[k]).slice(0,200)]))
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
export function setMeasurement(activeNow,settings={}){active=activeNow;mode=settings.mode;id=settings.measurementId;if(active&&typeof window!=='undefined')window.dispatchEvent(new Event('joytun-measurement-ready'))}
export const measurementEnabled=()=>active
export function track(name,params={}){
 const clean=sanitizeEvent(name,params)
 if(!active||!clean||typeof window==='undefined')return false
 const fields={...clean,page_path:window.location.pathname,page_location:cleanLocation(window.location.href)}
 if(mode==='gtm')window.dataLayer?.push({...Object.fromEntries([...new Set(Object.values(eventFields).flat())].map(k=>[k,null])),event:name,...fields})
 else window.gtag?.('event',name,{...fields,send_to:id})
 return true
}
export const productMeasurement=p=>({item_id:p.slug||p.id,item_brand:p.brand||'',item_category:p.category||p.cat||''})
