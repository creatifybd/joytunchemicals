import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Check, ChevronLeft, ChevronRight } from 'lucide-react'

export default function ProductModal({ product, onClose, onOrder }) {
  const [activeImg, setActiveImg] = useState(0)
  const images = product?.images?.length ? product.images : (product?.img ? [product.img] : [])
  if (!product) return null
  // Reset to first image when product changes
  // (handled by key prop on parent AnimatePresence)
  const features = product.feats?.split('\n').filter(Boolean) || []
  const variants = product.variants?.split('\n').filter(Boolean) || []

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark/60 backdrop-blur-sm"
          onClick={onClose}
          style={{ backgroundColor: 'rgba(6,15,46,0.6)' }}
        />
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 20 }}
          className="relative bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-y-auto z-10 shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 w-9 h-9 bg-gray-100 rounded-full flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors"
          >
            <X size={18} />
          </button>

          <div className="grid md:grid-cols-2">
            {/* Image */}
            <div className="bg-gray-50 rounded-tl-3xl rounded-bl-3xl flex flex-col min-h-[280px]">
              {/* Main image */}
              <div className="flex-1 flex items-center justify-center p-8 relative min-h-[240px]">
                {images.length > 0
                  ? <img key={activeImg} src={images[activeImg]} alt={product.name}
                      className="max-w-full max-h-64 object-contain drop-shadow-xl" style={{padding:'8px'}} />
                  : <div className="text-[100px] leading-none">{product.icon}</div>
                }
                {images.length > 1 && (
                  <>
                    <button onClick={() => setActiveImg(i => (i - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <ChevronLeft size={16} />
                    </button>
                    <button onClick={() => setActiveImg(i => (i + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center hover:bg-gray-100 transition-colors">
                      <ChevronRight size={16} />
                    </button>
                  </>
                )}
              </div>
              {/* Thumbnail strip */}
              {images.length > 1 && (
                <div className="flex gap-2 px-4 pb-4 justify-center">
                  {images.map((url, i) => (
                    <button key={i} onClick={() => setActiveImg(i)}
                      className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all shrink-0 ${activeImg === i ? 'border-primary shadow-md scale-105' : 'border-gray-200 opacity-60 hover:opacity-100'}`}
                      style={activeImg === i ? {borderColor:'var(--color-primary)'} : {}}>
                      <img src={url} alt="" className="w-full h-full object-contain p-0.5" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="p-8">
              <p className="text-xs font-black uppercase tracking-[3px] mb-3" style={{ color: 'var(--color-accent)' }}>
                {product.cat}
              </p>
              <h2 className="font-outfit text-2xl font-black text-dark mb-2">{product.name}</h2>
              <div className="w-10 h-1 rounded-full mb-6" style={{ backgroundColor: 'var(--color-primary)' }} />

              <p className="text-gray-500 text-sm leading-relaxed mb-6">{product.desc}</p>

              {features.length > 0 && (
                <div className="mb-6">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Key Features</h4>
                  <div className="space-y-2">
                    {features.map((f, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm text-gray-600 bg-gray-50 px-3 py-2 rounded-lg">
                        <Check size={13} style={{ color: 'var(--color-accent)' }} />
                        {f}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {variants.length > 0 && (
                <div className="mb-8">
                  <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">Available Sizes</h4>
                  <div className="flex flex-wrap gap-2">
                    {variants.map((v, i) => (
                      <span key={i} className="bg-gray-100 px-3 py-1.5 rounded-lg text-[11px] font-bold text-gray-600 border border-gray-200">
                        {v}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <button
                onClick={() => { onOrder(product); onClose() }}
                className="w-full text-white py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 shadow-xl hover:scale-[1.02] transition-transform"
                style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 24px rgba(10,61,143,0.25)' }}
              >
                <ShoppingCart size={17} /> Place Order
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
