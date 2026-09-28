import {useEffect,useRef,useState} from 'react'
import {AnimatePresence,motion,useReducedMotion} from 'framer-motion'
import './hero-campaign.css'
import {Link} from 'react-router-dom'
import {ArrowUpRight,ArrowLeft,ArrowRight,Pause,Play} from 'lucide-react'
import {useData} from '../hooks/useData'
import {safeUrl,resolveProductImage} from '../data/site'
import {ActionLink} from './Layout'
export function EditorialTitle({text,as:Tag='h2',className=''}){const lines=text.split('\n');return <Tag className={`editorial-title ${className}`}>{lines.map((line,i)=><span className={i===lines.length-1&&lines.length>1?'script-line':''} key={i}>{line}</span>)}</Tag>}
export default function Hero(){
 const {site,products}=useData(), reduce=useReducedMotion()
 const slides=site.heroSlides.filter(s=>s.enabled&&s.images.some(v=>resolveProductImage(v,products)))
 const [index,setIndex]=useState(0),[paused,setPaused]=useState(false),[hover,setHover]=useState(false),[focused,setFocused]=useState(false),[visible,setVisible]=useState(true)
 const touch=useRef(null),count=slides.length,current=index%Math.max(count,1),slide=slides[current]
 const animate=site.appearance.motion&&!reduce
 const playing=site.slideshow.autoplay&&animate&&!paused&&!hover&&!focused&&visible&&count>1
 const select=i=>{setIndex((i+count)%count);setPaused(true)}
 useEffect(()=>{const change=()=>setVisible(!document.hidden);change();document.addEventListener('visibilitychange',change);return()=>document.removeEventListener('visibilitychange',change)},[])
 useEffect(()=>{if(!playing)return;const timer=setTimeout(()=>setIndex(i=>(i+1)%count),Math.min(20,Math.max(5,site.slideshow.intervalSeconds))*1000);return()=>clearTimeout(timer)},[playing,current,count,site.slideshow.intervalSeconds])
 if(!slide)return <section className="shell section-space"><EditorialTitle text={site.home.title} as="h1"/><ActionLink to="/products">{site.home.button}</ActionLink></section>
 const packImages=slide.images.map(v=>({src:resolveProductImage(v,products),product:products.find(p=>p.slug===v||p.id===v)})).filter(p=>p.src).slice(0,4)
 return <><section className="campaign" role="region" aria-roledescription="carousel" aria-label="Our product collections" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)} onFocusCapture={()=>setFocused(true)} onBlurCapture={e=>{if(!e.currentTarget.contains(e.relatedTarget))setFocused(false)}}>
 <div className="campaign-scene" onTouchStart={e=>{touch.current={x:e.touches[0].clientX,y:e.touches[0].clientY}}} onTouchEnd={e=>{if(!touch.current)return;const dx=e.changedTouches[0].clientX-touch.current.x,dy=e.changedTouches[0].clientY-touch.current.y;if(Math.abs(dx)>60&&Math.abs(dx)>Math.abs(dy)*1.5)select(current+(dx<0?1:-1));touch.current=null}}>
 <AnimatePresence initial={false}><motion.img key={slide.background} className="campaign-background" src={safeUrl(slide.background)} alt="" fetchPriority={current===0?'high':'auto'} initial={{opacity:0}} animate={{opacity:1}} exit={{opacity:0}} transition={{duration:animate?.75:0}}/></AnimatePresence><div className="campaign-veil"/>
 <div className="shell campaign-content"><div className="campaign-copy"><p className="eyebrow">{site.home.eyebrow}</p><span className="campaign-number" aria-hidden="true">{String(current+1).padStart(2,'0')} / {String(count).padStart(2,'0')}</span><h1 key={slide.name} className={animate?'campaign-enter':''}>{slide.name}</h1><Link className="campaign-link" to={`/products?category=${encodeURIComponent(slide.category)}`}>{site.home.button}<ArrowUpRight size={21}/></Link></div>
 <div key={`${current}-${slide.images.join()}`} className={`campaign-packs ${animate?'campaign-enter':''}`} data-count={packImages.length}>{packImages.map(({src,product},i)=><img key={`${src}-${i}`} src={src} alt={product?`${product.name} · ${product.variant}`:slide.name} decoding="async" style={{'--pack-index':i}}/>)}</div></div>
 </div><div className="campaign-navigation shell"><div className="campaign-categories" aria-label="Choose a category">{slides.map((s,i)=><button key={i} type="button" aria-pressed={i===current} onClick={()=>select(i)}><span className="campaign-tab-number" aria-hidden="true">{String(i+1).padStart(2,'0')}</span>{s.name}<span className="campaign-track" aria-hidden="true">{i===current&&<span key={`${current}-${playing}`} style={{animationDuration:`${site.slideshow.intervalSeconds}s`,animationPlayState:playing?'running':'paused'}}/>}</span></button>)}</div><div className="campaign-controls"><button type="button" onClick={()=>select(current-1)} aria-label="Previous banner" disabled={count<2}><ArrowLeft size={19}/></button>{site.slideshow.autoplay&&animate&&<button type="button" onClick={()=>setPaused(!paused)} aria-label={paused?'Play slideshow':'Pause slideshow'}>{paused?<Play size={17}/>:<Pause size={17}/>}</button>}<button type="button" onClick={()=>select(current+1)} aria-label="Next banner" disabled={count<2}><ArrowRight size={19}/></button></div></div>
 </section><div className="hero-information"><div className="shell"><p>{site.brand.announcement}</p><span>{site.brand.location}</span><Link to="/contact">Contact us <ArrowUpRight size={17}/></Link></div></div></>
}
export function CollectionShowcase(){const {site,products}=useData();return <div className="collection-showcase">{site.slides.map((s,i)=><Link className="collection-editorial" key={i} to={`/products?category=${s.category}`} style={{background:s.color}}><div><h3>{s.name}</h3><p>{s.caption}</p><ArrowUpRight size={21}/></div><div className="collection-products">{s.images.slice(0,3).filter(v=>resolveProductImage(v,products)).map((v,j)=><img key={j} src={resolveProductImage(v,products)} alt={products.find(p=>p.slug===v)?.name||s.name} loading="lazy"/>)}</div></Link>)}</div>}
