import {useEffect,useRef,useState} from 'react'
import {Link,useLocation} from 'react-router-dom'
import {useData} from '../hooks/useData'
import {useAuth} from '../hooks/useAuth'
import {cleanLocation,setMeasurement,track,trackingAllowed,meetsSectionExposure} from '../lib/measurement'
const key='joytun-analytics-consent-v1'
const read=()=>{try{return localStorage.getItem(key)||''}catch{return ''}}
function inject(id,src){if(document.getElementById(id))return;const s=document.createElement('script');s.id=id;s.src=src;s.async=true;document.head.append(s)}
export default function Measurement(){
 const {site}=useData(),{isAdmin,loading}=useAuth(),{pathname,search}=useLocation()
 const a=site.analytics,[consent,setConsent]=useState(read),[open,setOpen]=useState(false)
 const lastPage=useRef(''),previousPage=useRef('')
 let internal=false;try{internal=localStorage.getItem('joytun-internal-traffic')==='1'}catch{}
 const configured=a.mode==='gtm'?/^GTM-[A-Z0-9]+$/.test(a.containerId):/^G-[A-Z0-9]+$/.test(a.measurementId)
 const allowed=!loading&&configured&&trackingAllowed({enabled:a.enabled,consent,pathname,search,isAdmin,internal})
 useEffect(()=>{const open=()=>setOpen(true);window.addEventListener('joytun-cookie-settings',open);return()=>window.removeEventListener('joytun-cookie-settings',open)},[])
 useEffect(()=>{
  if(!allowed){setMeasurement(false,a);return}
  window.dataLayer=window.dataLayer||[]
  window.gtag=window.gtag||function(){window.dataLayer.push(arguments)}
  window.gtag('consent','default',{analytics_storage:'granted',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'})
  if(a.mode==='gtm'){
   if(!document.getElementById('joytun-gtm'))window.dataLayer.push({'gtm.start':Date.now(),event:'gtm.js'})
   inject('joytun-gtm',`https://www.googletagmanager.com/gtm.js?id=${a.containerId}`)
  }else{
   if(!document.getElementById('joytun-ga')){window.gtag('js',new Date());window.gtag('config',a.measurementId,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:cleanLocation(location.href),page_referrer:document.referrer?new URL(document.referrer).origin:''})}
   inject('joytun-ga',`https://www.googletagmanager.com/gtag/js?id=${a.measurementId}`)
  }
  if(a.clarityEnabled&&/^[a-z0-9]+$/i.test(a.clarityId)){
   window.clarity=window.clarity||function(){(window.clarity.q=window.clarity.q||[]).push(arguments)}
   window.clarity('consentv2',{analytics_Storage:'granted',ad_Storage:'denied'})
   inject('joytun-clarity',`https://www.clarity.ms/tag/${a.clarityId}`)
  }
  // Only signal measurement-ready after the GA4 command queue or GTM dataLayer
  // actually exists. Otherwise view_item can be silently lost during hydration.
  setMeasurement(true,a)
  return()=>setMeasurement(false)
 },[allowed,a])
 useEffect(()=>{
  if(!allowed)return
  const page=cleanLocation(location.href)
  if(lastPage.current===page)return
  lastPage.current=page
  track('page_view',{page_path:pathname,page_location:page,page_title:document.title,page_referrer:previousPage.current||(document.referrer?new URL(document.referrer).origin:'')})
  previousPage.current=page
 },[allowed,pathname,search])
 useEffect(()=>{
  if(!allowed)return
  const fired=new Set(),timers=new Map()
  const observer=new IntersectionObserver(entries=>entries.forEach(entry=>{
   const el=entry.target,name=el.dataset.section
   if(meetsSectionExposure(entry,document.hidden)&&!fired.has(name)&&!timers.has(el))timers.set(el,setTimeout(()=>{if(!document.hidden){track('section_view',{section_id:name});fired.add(name)}timers.delete(el)},1000))
   else if(!meetsSectionExposure(entry,document.hidden)){clearTimeout(timers.get(el));timers.delete(el)}
  }),{threshold:0.1})
  document.querySelectorAll('[data-section]').forEach(el=>observer.observe(el))
  const visibility=()=>{if(document.hidden){timers.forEach(clearTimeout);timers.clear()}}
  document.addEventListener('visibilitychange',visibility)
  const click=e=>{const link=e.target.closest('a');if(!link||link.closest('[aria-hidden="true"]'))return;const href=link.getAttribute('href')||'',section=link.closest('[data-section]')?.dataset.section||'navigation';if(href.startsWith('tel:')||href.startsWith('mailto:'))track('contact_click',{contact_method:href.startsWith('tel:')?'phone':'email',section_id:section});if(href.startsWith('/products/'))track('select_content',{content_type:'product',item_id:href.split('/').pop(),section_id:section});if(href.startsWith('/products?category='))track('category_select',{category_id:new URL(href,location.origin).searchParams.get('category')})}
  document.addEventListener('click',click)
  return()=>{observer.disconnect();timers.forEach(clearTimeout);document.removeEventListener('click',click);document.removeEventListener('visibilitychange',visibility)}
 },[allowed,pathname])
 function choose(value){try{localStorage.setItem(key,value)}catch{}setConsent(value);setOpen(false);if(value!=='accepted'){setMeasurement(false);if(a.measurementId)window[`ga-disable-${a.measurementId}`]=true;window.gtag?.('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});window.clarity?.('consentv2',{analytics_Storage:'denied',ad_Storage:'denied'});location.reload()}}
 if(!a.enabled||!configured||isAdmin||internal||(!open&&consent))return null
 return <aside className="analytics-consent" aria-label="Analytics preferences"><div><strong>Help us improve your experience</strong><p>With your permission, we use analytics and, when enabled, masked interaction recordings to understand how our website is used. <Link to="/privacy">Privacy details</Link></p></div><div className="consent-actions"><button onClick={()=>choose('declined')}>Decline</button><button onClick={()=>choose('accepted')}>Accept analytics</button></div></aside>
}
