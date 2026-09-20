import { useRef, useState } from 'react'
import { Upload, Link, X, Loader, CheckCircle } from 'lucide-react'
import { uploadImage } from '../../lib/imgbb'
import ImageCropper from './ImageCropper'

// No compression — upload at full original quality
// ImgBB supports up to 32MB, so compression is unnecessary
// For cropped images (from canvas), output at maximum quality
function fileFromCanvas(canvas, originalFile) {
  return new Promise((resolve, reject) => {
    const isPng = originalFile?.type === 'image/png'
    // Check for transparency
    const ctx = canvas.getContext('2d')
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data
    let hasAlpha = false
    for (let i = 3; i < data.length; i += 4) {
      if (data[i] < 255) { hasAlpha = true; break }
    }
    if (isPng && hasAlpha) {
      // PNG with transparency — keep as PNG, lossless
      canvas.toBlob(blob => blob
        ? resolve(new File([blob], 'cropped.png', { type: 'image/png' }))
        : reject(new Error('Failed')), 'image/png')
    } else {
      // JPEG at maximum quality (1.0)
      canvas.toBlob(blob => blob
        ? resolve(new File([blob], 'cropped.jpg', { type: 'image/jpeg' }))
        : reject(new Error('Failed')), 'image/jpeg', 1.0)
    }
  })
}

export default function ImageUploader({ value, onChange, label = 'Image' }) {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState('')
  const [dragOver, setDragOver] = useState(false)
  // Cropper state
  const [cropSrc, setCropSrc] = useState(null)       // raw local URL for cropper preview
  const [pendingFile, setPendingFile] = useState(null) // original file reference
  const inputRef = useRef()

  // Step 1: User picks a file → open cropper
  const handleFile = (file) => {
    if (!file || !file.type.startsWith('image/')) return
    setError('')
    const localUrl = URL.createObjectURL(file)
    setCropSrc(localUrl)
    setPendingFile(file)
  }

  // Step 2: User confirms crop → upload at full quality
  const handleCropConfirm = async (croppedUrl, croppedFile) => {
    setCropSrc(null)
    setPendingFile(null)
    setUploading(true)
    try {
      setProgress('Uploading…')
      const url = await uploadImage(croppedFile)
      onChange(url)
      setProgress('')
    } catch {
      setError('Upload failed. Try again or paste a URL.')
      setProgress('')
    } finally {
      setUploading(false)
    }
  }

  const handleCropCancel = () => {
    setCropSrc(null)
    setPendingFile(null)
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFile(e.dataTransfer.files[0])
  }

  return (
    <div className="space-y-3">
      <label className="text-[10px] font-black uppercase text-gray-400 tracking-wider block">{label}</label>

      {/* Cropper — shown after file is picked, before upload */}
      {cropSrc && (
        <ImageCropper
          src={cropSrc}
          onConfirm={handleCropConfirm}
          onCancel={handleCropCancel}
        />
      )}

      {/* Normal uploader UI — hidden while cropper is open */}
      {!cropSrc && (
        <div className="grid grid-cols-2 gap-3">
          {/* Drop zone */}
          <div
            onDragOver={e => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => !uploading && inputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-4 flex flex-col items-center justify-center gap-2 transition-all min-h-[90px] ${
              uploading ? 'border-primary/40 bg-blue-50/30 cursor-default'
              : dragOver ? 'border-primary bg-blue-50/50 scale-[1.02] cursor-copy'
              : 'border-gray-200 hover:border-primary hover:bg-blue-50/20 cursor-pointer'
            }`}
          >
            {uploading ? (
              <>
                <Loader size={22} className="animate-spin" style={{ color: 'var(--color-primary)' }} />
                <span className="text-[10px] font-bold uppercase tracking-wider text-center" style={{ color: 'var(--color-primary)' }}>
                  {progress}
                </span>
                <div className="w-full h-1 bg-gray-100 rounded-full overflow-hidden mt-1">
                  <div className="h-full rounded-full animate-pulse"
                    style={{ width: '75%', backgroundColor: 'var(--color-primary)', transition: 'width 0.4s ease' }} />
                </div>
              </>
            ) : value ? (
              <>
                <CheckCircle size={20} style={{ color: 'var(--color-accent)' }} />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Change Image</span>
              </>
            ) : (
              <>
                <Upload size={20} className="text-gray-400" />
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center">
                  {dragOver ? 'Drop here!' : 'Drag & Drop or Click'}
                </span>
              </>
            )}
            <input ref={inputRef} type="file" accept="image/*" className="hidden"
              onChange={e => handleFile(e.target.files[0])} />
          </div>

          {/* URL input + preview */}
          <div className="space-y-2">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 border border-transparent">
              <Link size={13} className="text-gray-400 shrink-0" />
              <input type="text" placeholder="Or paste image URL…"
                value={value && !value.startsWith('blob:') ? value : ''}
                onChange={e => onChange(e.target.value)}
                disabled={uploading}
                className="flex-1 bg-transparent py-3 text-sm outline-none placeholder:text-gray-300" />
            </div>
            {value && (
              <div className="relative group w-20 h-20 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                <img src={value} alt="Preview" className="w-full h-full object-cover" />
                <button type="button" onClick={() => onChange('')}
                  className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <X size={16} className="text-white" />
                </button>
              </div>
            )}
            {error && <p className="text-red-500 text-[11px]">{error}</p>}
          </div>
        </div>
      )}
    </div>
  )
}
