import {useEffect,useRef,useState} from 'react'
import {Link} from 'react-router-dom'
import {ArrowRight,ChevronLeft,ChevronRight} from 'lucide-react'
import {useData} from '../hooks/useData'
import {getCategoryBanners} from '../data/heroBanners'
import {safeUrl} from '../data/site'

// Original product artwork remains unchanged; only CSS positions existing files.
export default function CategoryHero(){
 const {site,products}=useData()
 const slides=getCategoryBanners(site,products)
 const [current,setCurrent]=useState(0)
 const [paused,setPaused]=useState(false)
 const [visible,setVisible]=useState(true)
 const [tabVisible,setTabVisible]=useState(true)
 const [reducedMotion,setReducedMotion]=useState(false)
 const ref=useRef(null)
 useEffect(()=>{setCurrent(value=>slides.length?value%slides.length:0)},[slides.length])
 useEffect(()=>{
  const mq=window.matchMedia('(prefers-reduced-motion: reduce)')
  const changed=()=>setReducedMotion(mq.matches)
  changed();mq.addEventListener?.('change',changed)
  return()=>mq.removeEventListener?.('change',changed)
 },[])
 useEffect(()=>{
  const update=()=>setTabVisible(!document.hidden)
  update();document.addEventListener('visibilitychange',update)
  return()=>document.removeEventListener('visibilitychange',update)
 },[])
 useEffect(()=>{
  if(!ref.current||typeof IntersectionObserver==='undefined')return
  const observer=new IntersectionObserver(entries=>setVisible(entries[0]?.isIntersecting??false),{threshold:.1})
  observer.observe(ref.current)
  return()=>observer.disconnect()
 },[])
 useEffect(()=>{
  if(slides.length<2||paused||!visible||!tabVisible||reducedMotion||site.appearance.motion===false)return
  const timer=window.setInterval(()=>setCurrent(value=>(value+1)%slides.length),5000)
  return()=>window.clearInterval(timer)
 },[slides.length,paused,visible,tabVisible,reducedMotion,site.appearance.motion])
 if(!site.home.showCategoryHero||!slides.length)return null
 const slide=slides[current%slides.length]
 const {category,primary,secondary}=slide
 const image=p=>safeUrl(p?.images?.[0]||p?.img,'')
 return <section ref={ref} className="care-hero-banners" style={{'--care-banner-bg':category.color||'#edf1dd'}} aria-label="Explore Joytun care categories" aria-roledescription="carousel" onMouseEnter={()=>setPaused(true)} onMouseLeave={()=>setPaused(false)} onFocusCapture={()=>setPaused(true)} onBlurCapture={event=>{if(!event.currentTarget.contains(event.relatedTarget))setPaused(false)}}>
   <div className="shell care-banner-inner" key={category.id}>
     <div className="care-banner-copy"><span className="care-banner-eyebrow">THE JOYTUN COLLECTION <span aria-hidden="true">/</span> {String(current+1).padStart(2,'0')} OF {String(slides.length).padStart(2,'0')}</span><h2>{category.title}</h2><p>{category.description}</p><Link className="care-banner-link" to={`/products?category=${encodeURIComponent(category.id)}`}>Explore {category.name}<ArrowRight size={19}/></Link></div>
     <div className="care-banner-art" aria-label={`${primary.name} product photography`}><span className="care-banner-orbit" aria-hidden="true"/>{secondary&&<img className="care-banner-secondary" src={image(secondary)} alt={`${secondary.name} — ${secondary.variant}`} loading="lazy" decoding="async"/>}<img className="care-banner-primary" src={image(primary)} alt={`${primary.name} — ${primary.variant}`} loading="lazy" decoding="async"/></div>
   </div>
   {slides.length>1&&<div className="shell care-banner-controls"><div className="care-banner-dots" aria-label="Select a care category">{slides.map(({category:item},index)=><button key={item.id} type="button" className={current===index?'selected':''} aria-label={`Show ${item.name} banner`} aria-current={current===index?'true':undefined} onClick={()=>setCurrent(index)}><span/></button>)}</div><div className="care-banner-arrows"><button type="button" aria-label="Previous care category" onClick={()=>setCurrent(value=>(value-1+slides.length)%slides.length)}><ChevronLeft size={21}/></button><button type="button" aria-label="Next care category" onClick={()=>setCurrent(value=>(value+1)%slides.length)}><ChevronRight size={21}/></button></div></div>}
 </section>
}
