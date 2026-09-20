import { useState } from 'react'
import { Plus, Trash2, GripVertical, Loader, Upload } from 'lucide-react'
import { uploadImage } from '../../lib/imgbb'
import ImageCropper from './ImageCropper'

export default function MultiImageUploader({ images = [], onChange, label = 'Product Images' }) {
  const [cropSrc, setCropSrc] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [dragIdx, setDragIdx] = useState(null)
  const [overIdx, setOverIdx] = useState(null)

  // Pick file → open cropper
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setCropSrc(URL.createObjectURL(file))
  }

  // Crop confirmed → upload
  const handleCropConfirm = async (_, croppedFile) => {
    setCropSrc(null)
    setUploading(true)
    try {
      const url = await uploadImage(croppedFile)
      onChange([...images, url])
    } catch {
      alert('Upload failed. Try again.')
    } finally {
      setUploading(false)
    }
  }

  const removeImage = (idx) => onChange(images.filter((_, i) => i !== idx))

  // Drag-to-reorder
  const onDragStart = (i) => setDragIdx(i)
  const onDragOver = (e, i) => { e.preventDefault(); setOverIdx(i) }
  const onDrop = (i) => {
    if (dragIdx === null || dragIdx === i) { setDragIdx(null); setOverIdx(null); return }
    const arr = [...images]
    const [moved] = arr.splice(dragIdx, 1)
    arr.splice(i, 0, moved)
    onChange(arr)
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider">{label}</label>
        <span className="text-[10px] text-gray-400">{images.length} / 8 images · drag to reorder</span>
      </div>

      {/* Cropper */}
      {cropSrc && (
        <ImageCropper src={cropSrc} onConfirm={handleCropConfirm} onCancel={() => setCropSrc(null)} />
      )}

      {!cropSrc && (
        <div className="grid grid-cols-4 gap-2">
          {/* Existing images */}
          {images.map((url, i) => (
            <div
              key={i}
              draggable
              onDragStart={() => onDragStart(i)}
              onDragOver={e => onDragOver(e, i)}
              onDrop={() => onDrop(i)}
              onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
              className={`relative group aspect-square rounded-xl overflow-hidden border-2 transition-all cursor-grab active:cursor-grabbing ${
                overIdx === i ? 'border-primary scale-105 shadow-lg' : 'border-gray-200'
              } ${dragIdx === i ? 'opacity-40' : ''}`}
              style={{ backgroundColor: '#f5f6f8' }}
            >
              <img src={url} alt={`Image ${i + 1}`} className="w-full h-full object-contain p-1" />

              {/* Order badge */}
              <div className="absolute top-1 left-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-black text-white shadow"
                style={{ backgroundColor: i === 0 ? 'var(--color-primary)' : 'rgba(0,0,0,0.45)' }}>
                {i + 1}
              </div>

              {/* Drag handle */}
              <div className="absolute top-1 right-6 opacity-0 group-hover:opacity-100 transition-opacity text-white">
                <GripVertical size={14} />
              </div>

              {/* Delete */}
              <button
                type="button"
                onClick={() => removeImage(i)}
                className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
              >
                <Trash2 size={10} className="text-white" />
              </button>

              {/* Main badge */}
              {i === 0 && (
                <div className="absolute bottom-1 left-1 right-1 text-center text-[8px] font-black uppercase tracking-wider text-white rounded px-1 py-0.5"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  Main
                </div>
              )}
            </div>
          ))}

          {/* Add button */}
          {images.length < 8 && (
            <label
              className={`aspect-square rounded-xl border-2 border-dashed flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                uploading ? 'border-primary/40 bg-blue-50/30' : 'border-gray-200 hover:border-primary hover:bg-blue-50/20'
              }`}
            >
              {uploading
                ? <Loader size={18} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                : <Plus size={18} className="text-gray-400" />
              }
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">
                {uploading ? 'Uploading…' : 'Add'}
              </span>
              <input type="file" accept="image/*" className="hidden"
                onChange={e => handleFile(e.target.files[0])} />
            </label>
          )}
        </div>
      )}

      {images.length > 1 && !cropSrc && (
        <p className="text-[10px] text-gray-400 flex items-center gap-1">
          <GripVertical size={11} /> Drag images to change display order. First image is shown on product card.
        </p>
      )}
    </div>
  )
}
