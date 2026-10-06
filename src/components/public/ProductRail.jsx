import { useEffect, useRef, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { useReducedMotion } from 'framer-motion'
import { useData } from '../../hooks/useData'
import { ProductCard } from '../../site/Product'

export default function ProductRail({ products }) {
  const rail = useRef(null)
  const hovering = useRef(false)
  const touching = useRef(false)
  const focused = useRef(false)
  const [paused, setPaused] = useState(false)
  const reduced = useReducedMotion()
  const { site } = useData()
  const animate = !reduced && site.appearance.motion && products.length > 1
  useEffect(() => {
    if (!animate) return
    const element = rail.current
    let frame, previous = 0, position = element.scrollLeft, loopWidth = 0, visible = true
    const measure = () => {
      const first = element.children[0], copy = element.children[products.length]
      loopWidth = copy && first ? copy.offsetLeft - first.offsetLeft : 0
    }
    const resize = new ResizeObserver(measure)
    resize.observe(element)
    const intersection = new IntersectionObserver(entries => { visible = entries[0].isIntersecting })
    intersection.observe(element)
    measure()
    function tick(time) {
      const elapsed = previous ? Math.min(time - previous, 64) : 0
      previous = time
      if (!paused && !hovering.current && !touching.current && !focused.current && !document.hidden && visible && loopWidth > 0) {
        position = (position + elapsed * 0.035) % loopWidth
        element.scrollLeft = position
      } else position = element.scrollLeft
      frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => { cancelAnimationFrame(frame); resize.disconnect(); intersection.disconnect() }
  }, [animate, paused, products.length])
  return <div className="product-presentation" onMouseEnter={() => { hovering.current = true }} onMouseLeave={() => { hovering.current = false }}>
    {animate && <div className="product-rail-controls"><button className="icon-button" onClick={() => setPaused(value => !value)} aria-label={paused ? 'Play product presentation' : 'Pause product presentation'} aria-pressed={paused}>{paused ? <Play size={20}/> : <Pause size={20}/>}</button></div>}
    <div className={`product-rail ${animate ? 'product-marquee' : ''}`} ref={rail} role="region" aria-label="All products" tabIndex={0}
      onFocusCapture={() => { focused.current = true }} onBlurCapture={event => { if (!event.currentTarget.contains(event.relatedTarget)) focused.current = false }}
      onTouchStart={() => { touching.current = true }} onTouchEnd={() => { touching.current = false }} onTouchCancel={() => { touching.current = false }}>
      {products.map(product => <ProductCard key={product.id} product={product}/>)}
      {animate && products.map(product => <ProductCard key={`loop-${product.id}`} product={product} presentationClone/>)}
    </div>
  </div>
}
