import { IMGBB_API_KEY } from './firebase'

/**
 * Upload image to ImgBB and return the URL.
 * Accepts File object or base64 string.
 */
export async function uploadImage(file) {
  const formData = new FormData()

  if (typeof file === 'string' && file.startsWith('data:')) {
    // base64 string — strip the prefix
    const base64 = file.split(',')[1]
    formData.append('image', base64)
  } else {
    // File object
    formData.append('image', file)
  }

  const res = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
    method: 'POST',
    body: formData,
  })

  if (!res.ok) throw new Error('Image upload failed')

  const json = await res.json()
  if (!json.success) throw new Error(json.error?.message || 'Upload failed')

  return json.data.url // direct image URL
}
