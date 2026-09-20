import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ShoppingCart, Eye, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductCard({ product, onOrder, onView }) {
  const images = product.images?.length ? product.images : (product.img ? [product.img] : [])
  const hasMultiple = images.length > 1
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1) // 1=next, -1=prev
  const timerRef = useRef(null)

  // Auto-slideshow every 3s
  useEffect(() => {
    if (!hasMultiple) return
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrent(c => (c + 1) % images.length)
    }, 3000)
    return () => clearInterval(timerRef.current)
  }, [hasMultiple, images.length])

  const goTo = (idx, dir) => {
    clearInterval(timerRef.current)
    setDirection(dir)
    setCurrent(idx)
    // Restart timer
    timerRef.current = setInterval(() => {
      setDirection(1)
      setCurrent(c => (c + 1) % images.length)
    }, 3000)
  }

  const prev = (e) => { e.stopPropagation(); goTo((current - 1 + images.length) % images.length, -1) }
  const next = (e) => { e.stopPropagation(); goTo((current + 1) % images.length, 1) }

  // Touch/swipe support
  const touchStart = useRef(null)
  const onTouchStart = (e) => { touchStart.current = e.touches[0].clientX }
  const onTouchEnd = (e) => {
    if (touchStart.current === null) return
    const diff = touchStart.current - e.changedTouches[0].clientX
    if (Math.abs(diff) > 40) diff > 0 ? next(e) : prev(e)
    touchStart.current = null
  }

  const slideVariants = {
    enter: (dir) => ({ x: dir > 0 ? '100%' : '-100%', opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit: (dir) => ({ x: dir > 0 ? '-100%' : '100%', opacity: 0 }),
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white border border-gray-200 rounded-xl overflow-hidden group hover:shadow-lg hover:border-gray-300 transition-all duration-200"
    >
      {/* Image area */}
      <div
        className="relative overflow-hidden cursor-pointer"
        style={{ paddingBottom: '100%', backgroundColor: '#f5f6f8' }}
        onClick={() => onView(product)}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <div className="absolute inset-0">
          {images.length > 0 ? (
            <AnimatePresence custom={direction} initial={false}>
              <motion.img
                key={current}
                src={images[current]}
                alt={product.name}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.35, ease: 'easeInOut' }}
                className="absolute inset-0 w-full h-full object-contain"
                style={{ padding: '6px' }}
                draggable={false}
              />
            </AnimatePresence>
          ) : (
            <div className="w-full h-full flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300">
              {product.icon}
            </div>
          )}
        </div>

        {/* Prev/Next arrows — show on hover if multiple images */}
        {hasMultiple && (
          <>
            <button onClick={prev}
              className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/85 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
              style={{ backdropFilter: 'blur(4px)' }}>
              <ChevronLeft size={14} className="text-gray-700" />
            </button>
            <button onClick={next}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-7 h-7 bg-white/85 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-opacity z-10 hover:bg-white"
              style={{ backdropFilter: 'blur(4px)' }}>
              <ChevronRight size={14} className="text-gray-700" />
            </button>

            {/* Dot indicators */}
            <div className="absolute bottom-1.5 left-0 right-0 flex justify-center gap-1 z-10">
              {images.map((_, i) => (
                <button key={i} onClick={e => { e.stopPropagation(); goTo(i, i > current ? 1 : -1) }}
                  className="rounded-full transition-all"
                  style={{
                    width: i === current ? 14 : 5,
                    height: 5,
                    backgroundColor: i === current ? 'var(--color-primary)' : 'rgba(255,255,255,0.7)',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.2)'
                  }}
                />
              ))}
            </div>
          </>
        )}

        {/* Badge */}
        {product.badge && (
          <span className="absolute top-2 left-2 text-[10px] font-black uppercase px-2 py-0.5 rounded text-white z-10"
            style={{
              backgroundColor: product.badgeCol === 'hot' ? '#ef4444'
                : product.badgeCol === 'new' ? 'var(--color-accent)'
                : 'var(--color-primary)'
            }}>
            {product.badge}
          </span>
        )}

        {/* View overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100 z-[5]">
          <div className="bg-white/90 rounded-full p-2 shadow-lg">
            <Eye size={16} className="text-gray-700" />
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="text-[10px] font-bold uppercase tracking-wider mb-1" style={{ color: 'var(--color-accent)' }}>
          {product.cat}
        </p>
        <h3 className="text-sm font-semibold text-gray-800 mb-1 line-clamp-2 leading-snug cursor-pointer hover:text-primary"
          onClick={() => onView(product)}>
          {product.name}
        </h3>
        <p className="text-[11px] text-gray-400 line-clamp-1 mb-3">{product.desc}</p>
        <div className="flex gap-1.5">
          <button onClick={() => onView(product)}
            className="flex-1 border border-gray-200 text-gray-600 py-1.5 rounded-lg text-[11px] font-bold hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
            <Eye size={12} /> Details
          </button>
          <button onClick={() => onOrder(product)}
            className="flex-1 text-white py-1.5 rounded-lg text-[11px] font-bold transition-colors flex items-center justify-center gap-1"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            <ShoppingCart size={12} /> Order
          </button>
        </div>
      </div>
    </motion.div>
  )
}
