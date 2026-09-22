import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowLeft, ArrowRight } from 'lucide-react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ActionLink } from './Layout'

const collections = [
  { name: 'The n’Olive collection', category: 'hand', caption: 'A refreshing moment, just for you.', color: '#e8eed8', word: 'feel good.', images: ['nolive-lavender-pump', 'nolive-apple-green-pump', 'nolive-ocean-blue-pump'], labels: ['n’Olive Lavender hand wash', 'n’Olive Apple Green hand wash', 'n’Olive Ocean Blue hand wash'] },
  { name: 'The Vix collection', category: 'kitchen', caption: 'Fresh care for the heart of your home.', color: '#f5ead1', word: 'shine on.', images: ['vix-lemon-refill', 'vix-orange-bottle', 'vix-lemon-bottle'], labels: ['Vix Lemon refill', 'Vix Orange dish wash liquid', 'Vix Lemon dish wash liquid'] },
  { name: 'The laundry collection', category: 'laundry', caption: 'A fresh start for the clothes you love.', color: '#e5e8f3', word: 'fresh start.', images: ['sharo-detergent', 'aro-detergent', 'rio-detergent'], labels: ['Sharo detergent powder', 'Aro detergent powder', 'Rio detergent powder'] },
]

export default function Hero() {
  const [index, setIndex] = useState(0)
  const collection = collections[index]
  const reduced = useReducedMotion()
  return <section className="hero-section shell">
    <div className="hero-copy"><p className="eyebrow"><span className="small-dot"/> HOME & PERSONAL CARE</p><h1>A little care.<br/>A better<br/><span>everyday.</span></h1><p className="hero-description">From freshly washed hands to a home that feels like you. Discover everyday essentials from Joytun, made in Bangladesh.</p><div className="hero-links"><ActionLink to="/products">Find your everyday essentials</ActionLink><Link className="text-link" to="/about">Meet Joytun <ArrowUpRight size={18}/></Link></div><div className="hero-note"><span className="line"/><span>YOUR HOME. YOUR PEOPLE. OUR CARE.</span></div></div>
    <div className="hero-display" style={{ backgroundColor: collection.color }}>
      <div className="display-heading"><span>THE EVERYDAY EDIT</span><span>JOYTUN / PURE CARE</span></div>
      <div className="product-stage"><div className="stage-orbit"/><div className="stage-word" aria-hidden="true">{collection.word}</div><div className="stage-plinth"/>
        <AnimatePresence mode="wait"><motion.div key={index} className={`hero-products scene-${index}`} initial={reduced ? false : { opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.35 }}>
          {collection.images.map((slug, i) => <img className={`hero-product hero-product-${i}`} key={slug} src={`/images/products/${slug}.png`} alt={collection.labels[i]} fetchPriority={index === 0 ? 'high' : 'auto'} decoding="async"/>)}</motion.div></AnimatePresence>
      </div>
      <div className="collection-caption"><Link to={`/products?category=${collection.category}`}><span className="eyebrow">{collection.name}</span><p>{collection.caption}</p></Link><Link className="round-arrow" to={`/products?category=${collection.category}`} aria-label={`Explore ${collection.name}`}><ArrowUpRight size={23}/></Link></div>
      <div className="hero-slider-controls"><div className="slide-dots" aria-label="Featured collections">{collections.map((c,i) => <button key={c.name} aria-label={`Show ${c.name}`} aria-pressed={i===index} onClick={()=>setIndex(i)}/>)}</div><div><span aria-live="polite">0{index+1} / 03</span><button aria-label="Previous collection" onClick={()=>setIndex((index+2)%3)}><ArrowLeft size={17}/></button><button aria-label="Next collection" onClick={()=>setIndex((index+1)%3)}><ArrowRight size={17}/></button></div></div>
    </div>
  </section>
}
