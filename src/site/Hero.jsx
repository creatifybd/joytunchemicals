import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ActionLink } from './Layout'

import { useData } from '../hooks/useData'
import { resolveProductImage } from '../data/site'

export default function Hero() {
  const {site, products}=useData()
  const collections=site.slides.filter(c=>c.images.some(v=>resolveProductImage(v,products)))
  const h=site.home
  const [index, setIndex] = useState(0)
  const collection = collections[index % Math.max(collections.length,1)]
  const reduced = useReducedMotion()
  if(!collection)return <section className="shell catalogue-intro"><h1 className="preserve-lines">{h.title}</h1><p>{h.description}</p></section>
  return <section className="hero-section shell">
    <div className="hero-copy"><p className="eyebrow"><span className="small-dot"/>{h.eyebrow}</p><h1 className="preserve-lines">{h.title}</h1><p className="hero-accent">{h.accent}</p><p className="hero-description">{h.description}</p><div className="hero-links"><ActionLink to={h.buttonUrl}>{h.button}</ActionLink><Link className="text-link" to="/about">Meet Joytun <ArrowUpRight size={18}/></Link></div><div className="hero-note"><span className="line"/><span>{h.note}</span></div></div>
    <div className="hero-display" style={{ backgroundColor: collection.color }}>
      <div className="display-heading"><span>THE EVERYDAY EDIT</span><span>JOYTUN / PURE CARE</span></div>
      <div className="product-stage"><div className="stage-orbit"/><div className="stage-word" aria-hidden="true">{collection.word}</div><div className="stage-plinth"/>
        <AnimatePresence mode="wait"><motion.div key={index} className={`hero-products scene-${index}`} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
          {collection.images.filter(v=>resolveProductImage(v,products)).slice(0,3).map((slug, i) => <img className={`hero-product hero-product-${i}`} key={slug} src={resolveProductImage(slug,products)} alt={products.find(p=>p.slug===slug)?.name || collection.name} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"/>)}</motion.div></AnimatePresence>
      </div>
      <div className="collection-caption"><Link to={`/products?category=${collection.category}`}><span className="eyebrow">{collection.name}</span><p>{collection.caption}</p></Link><Link className="round-arrow" to={`/products?category=${collection.category}`} aria-label={`Explore ${collection.name}`}><ArrowUpRight size={23}/></Link></div>
      <div className="hero-slider-controls"><div className="slide-dots" aria-label="Featured collections">{collections.map((c,i) => <button key={c.name} aria-label={`Show ${c.name}`} aria-pressed={i===index} onClick={()=>setIndex(i)}/>)}</div><div><span aria-live="polite">{String(index+1).padStart(2,'0')} / {String(collections.length).padStart(2,'0')}</span><button aria-label="Previous collection" onClick={()=>setIndex((index+collections.length-1)%collections.length)}><ArrowLeft size={17}/></button><button aria-label="Next collection" onClick={()=>setIndex((index+1)%collections.length)}><ArrowRight size={17}/></button></div></div>
    </div>
  </section>
}
