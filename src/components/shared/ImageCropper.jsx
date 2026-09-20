import { useState, useRef, useCallback, useEffect } from 'react'
import { ZoomIn, ZoomOut, Move, Check, RotateCcw } from 'lucide-react'
import { motion } from 'framer-motion'

/**
 * ImageCropper
 * Shows a 1:1 preview box. User can drag to reposition and use
 * zoom slider to scale the image. On confirm, renders to canvas
 * and returns a cropped blob URL (and optionally a File).
 */
export default function ImageCropper({ src, onConfirm, onCancel, aspectRatio = 1 }) {
  const containerRef = useRef(null)
  const [zoom, setZoom] = useState(1)
  const [pos, setPos] = useState({ x: 0, y: 0 })
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(null)
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 })

  // When image loads, auto-fit it to fill the preview box
  const handleImageLoad = useCallback((e) => {
    const { naturalWidth: w, naturalHeight: h } = e.target
    setImgNaturalSize({ w, h })
    // Auto zoom to fill the 1:1 box
    const containerSize = containerRef.current?.offsetWidth || 300
    const scale = Math.max(containerSize / w, containerSize / h)
    setZoom(scale)
    setPos({ x: 0, y: 0 })
  }, [])

  // Drag to reposition
  const onMouseDown = (e) => {
    e.preventDefault()
    setDragging(true)
    dragStart.current = {
      x: (e.clientX || e.touches?.[0]?.clientX) - pos.x,
      y: (e.clientY || e.touches?.[0]?.clientY) - pos.y,
    }
  }

  const onMouseMove = useCallback((e) => {
    if (!dragging || !dragStart.current) return
    const clientX = e.clientX || e.touches?.[0]?.clientX
    const clientY = e.clientY || e.touches?.[0]?.clientY
    setPos({
      x: clientX - dragStart.current.x,
      y: clientY - dragStart.current.y,
    })
  }, [dragging])

  const onMouseUp = useCallback(() => {
    setDragging(false)
    dragStart.current = null
  }, [])

  useEffect(() => {
    window.addEventListener('mousemove', onMouseMove)
    window.addEventListener('mouseup', onMouseUp)
    window.addEventListener('touchmove', onMouseMove, { passive: true })
    window.addEventListener('touchend', onMouseUp)
    return () => {
      window.removeEventListener('mousemove', onMouseMove)
      window.removeEventListener('mouseup', onMouseUp)
      window.removeEventListener('touchmove', onMouseMove)
      window.removeEventListener('touchend', onMouseUp)
    }
  }, [onMouseMove, onMouseUp])

  // Reset to auto-fit
  const handleReset = () => {
    if (!containerRef.current || !imgNaturalSize.w) return
    const containerSize = containerRef.current.offsetWidth
    const scale = Math.max(containerSize / imgNaturalSize.w, containerSize / imgNaturalSize.h)
    setZoom(scale)
    setPos({ x: 0, y: 0 })
  }

  // Render final cropped image to canvas → blob → File
  const handleConfirm = useCallback(() => {
    const container = containerRef.current
    if (!container || !imgNaturalSize.w) return

    const size = container.offsetWidth
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size

    const ctx = canvas.getContext('2d')
    const img = new Image()
    img.crossOrigin = 'anonymous'
    img.onload = () => {
      // Calculate rendered image dimensions
      const renderedW = imgNaturalSize.w * zoom
      const renderedH = imgNaturalSize.h * zoom

      // Center offset + user drag offset
      const drawX = (size - renderedW) / 2 + pos.x
      const drawY = (size - renderedH) / 2 + pos.y

      // Check if image has transparency (PNG)
      ctx.clearRect(0, 0, size, size)
      ctx.drawImage(img, drawX, drawY, renderedW, renderedH)

      // Check alpha
      const pixels = ctx.getImageData(0, 0, size, size).data
      let hasAlpha = false
      for (let i = 3; i < pixels.length; i += 4) {
        if (pixels[i] < 255) { hasAlpha = true; break }
      }

      if (hasAlpha) {
        canvas.toBlob((blob) => {
          if (blob) onConfirm(URL.createObjectURL(blob), new File([blob], 'cropped.png', { type: 'image/png' }))
        }, 'image/png')
      } else {
        canvas.toBlob((blob) => {
          if (blob) onConfirm(URL.createObjectURL(blob), new File([blob], 'cropped.jpg', { type: 'image/jpeg' }))
        }, 'image/jpeg', 1.0)
      }
    }
    img.src = src
  }, [src, zoom, pos, imgNaturalSize, onConfirm])

  const containerSize = 300

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xl space-y-4"
    >
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase text-gray-500 tracking-wider flex items-center gap-2">
          <Move size={13} /> Drag to reposition
        </p>
        <button onClick={handleReset} className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-primary transition-colors font-bold">
          <RotateCcw size={12} /> Reset
        </button>
      </div>

      {/* Preview box */}
      <div
        ref={containerRef}
        className="relative overflow-hidden rounded-xl border-2 border-dashed mx-auto select-none"
        style={{
          width: containerSize,
          height: containerSize,
          cursor: dragging ? 'grabbing' : 'grab',
          borderColor: 'var(--color-primary)',
          backgroundColor: '#f9fafb',
          // Checkerboard pattern to show transparency
          backgroundImage: 'linear-gradient(45deg, #e5e7eb 25%, transparent 25%), linear-gradient(-45deg, #e5e7eb 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #e5e7eb 75%), linear-gradient(-45deg, transparent 75%, #e5e7eb 75%)',
          backgroundSize: '12px 12px',
          backgroundPosition: '0 0, 0 6px, 6px -6px, -6px 0px',
        }}
        onMouseDown={onMouseDown}
        onTouchStart={onMouseDown}
      >
        {src && (
          <img
            src={src}
            alt="Crop preview"
            onLoad={handleImageLoad}
            draggable={false}
            style={{
              position: 'absolute',
              left: '50%',
              top: '50%',
              transform: `translate(calc(-50% + ${pos.x}px), calc(-50% + ${pos.y}px)) scale(${zoom})`,
              transformOrigin: 'center center',
              maxWidth: 'none',
              userSelect: 'none',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* Corner guides */}
        {['top-0 left-0', 'top-0 right-0', 'bottom-0 left-0', 'bottom-0 right-0'].map((pos, i) => (
          <div key={i} className={`absolute ${pos} w-5 h-5 border-2 rounded-sm`}
            style={{ borderColor: 'var(--color-primary)', opacity: 0.7,
              borderRight: pos.includes('left') ? '2px solid' : 'none',
              borderLeft: pos.includes('right') ? '2px solid' : 'none',
              borderBottom: pos.includes('top') ? '2px solid' : 'none',
              borderTop: pos.includes('bottom') ? '2px solid' : 'none',
            }} />
        ))}
      </div>

      {/* Zoom slider */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 uppercase tracking-wider">
          <span>Zoom</span>
          <span>{Math.round(zoom * 100)}%</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setZoom(z => Math.max(0.1, z - 0.05))}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
            <ZoomOut size={14} />
          </button>
          <input
            type="range"
            min="0.1"
            max="3"
            step="0.01"
            value={zoom}
            onChange={e => setZoom(parseFloat(e.target.value))}
            className="flex-1 accent-primary h-1.5 rounded-full cursor-pointer"
            style={{ accentColor: 'var(--color-primary)' }}
          />
          <button onClick={() => setZoom(z => Math.min(3, z + 0.05))}
            className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500 hover:bg-gray-200 transition-colors shrink-0">
            <ZoomIn size={14} />
          </button>
        </div>
        <p className="text-[10px] text-gray-400 text-center">Drag the image to reposition</p>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-1">
        <button onClick={onCancel}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
          Cancel
        </button>
        <button onClick={handleConfirm}
          className="flex-1 py-2.5 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <Check size={15} /> Apply
        </button>
      </div>
    </motion.div>
  )
}
