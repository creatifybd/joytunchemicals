import { useEffect, useRef, useState } from 'react'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { ProductCard } from '../../site/Product'

// Native scrolling keeps keyboard, touch and trackpad navigation available.
export default function ProductRail({ products }) {
  const rail = useRef(null)
  const [edges, setEdges] = useState({ start: true, end: false })
  useEffect(() => {
    const element = rail.current
    const update = () => setEdges({ start: element.scrollLeft < 2, end: element.scrollLeft + element.clientWidth >= element.scrollWidth - 2 })
    const observer = new ResizeObserver(update)
    observer.observe(element)
    element.addEventListener('scroll', update, { passive: true })
    update()
    return () => { observer.disconnect(); element.removeEventListener('scroll', update) }
  }, [products])
  function move(direction) {
    const element = rail.current
    const card = element.firstElementChild
    const distance = card ? card.getBoundingClientRect().width + parseFloat(getComputedStyle(element).columnGap || 0) : element.clientWidth
    const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches || element.closest('.motion-off')
    element.scrollBy({ left: direction * distance, behavior: reduced ? 'instant' : 'smooth' })
  }
  return <div className="product-presentation">
    <div className="product-rail-controls" aria-label="Product presentation controls">
      <button className="icon-button" disabled={edges.start} onClick={() => move(-1)} aria-label="Previous products"><ArrowLeft size={20}/></button>
      <button className="icon-button" disabled={edges.end} onClick={() => move(1)} aria-label="Next products"><ArrowRight size={20}/></button>
    </div>
    <div className="product-rail" ref={rail} role="region" aria-label="Featured products" tabIndex={0}>
      {products.map(product => <ProductCard key={product.id} product={product}/>)}
    </div>
  </div>
}
