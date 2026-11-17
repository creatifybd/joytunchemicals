import imageManifest from './optimized-image-manifest.js'

const SITE_HOST = 'www.joytunchemicals.com'

export function optimizedProductImageProps(originalUrl, sizes = '(max-width: 650px) 45vw, 270px') {
  if (typeof originalUrl !== 'string') return {}
  let pathname
  try {
    const parsed = new URL(originalUrl, `https://${SITE_HOST}`)
    if (!['joytunchemicals.com', SITE_HOST].includes(parsed.hostname) || parsed.protocol !== 'https:') return {}
    pathname = parsed.pathname
  } catch { return {} }

  const image = imageManifest[pathname]
  if (!image) return {}

  const candidates = [360, 720].filter(width => width < image.width).map(width => `${image.base}-${width}.webp ${width}w`)
  candidates.push(`${image.base}-full.webp ${image.width}w`)
  return {
    srcSet: candidates.join(', '),
    sizes,
    onError(event) {
      const img = event.currentTarget
      if (img.dataset.optimizedFallback === 'true') return
      img.dataset.optimizedFallback = 'true'
      img.removeAttribute('srcset')
      img.removeAttribute('sizes')
      // Preserve the exact original source for browsers without WebP support.
    },
  }
}
