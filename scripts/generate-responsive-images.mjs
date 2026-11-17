import { mkdir, stat, writeFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import sharp from 'sharp'
import { approvedProducts } from '../src/data/catalogue.js'

// Build-time derivatives only. The approved source files are never overwritten.
const root = new URL('../', import.meta.url).pathname
const sizes = [360, 720]
const candidates = [...new Set(approvedProducts.flatMap(product => [
  product.img,
  `/images/products/${product.slug}.png`,
]))].sort()
const manifest = {}
let originalBytes = 0
let optimizedBytes = 0

for (const url of candidates) {
  const sourcePath = join(root, 'public', url)
  let sourceStat
  try { sourceStat = await stat(sourcePath) } catch (error) {
    if (error.code === 'ENOENT') continue
    throw error
  }
  const metadata = await sharp(sourcePath).metadata()
  if (!metadata.width || !metadata.height) throw new Error(`Invalid product image: ${url}`)
  const base = `/images/optimized${url.slice('/images'.length).replace(/\.(?:png|webp)$/i, '')}`
  manifest[url] = { width: metadata.width, base }
  originalBytes += sourceStat.size

  for (const target of [...sizes.filter(width => width < metadata.width), metadata.width]) {
    const suffix = target === metadata.width ? 'full' : String(target)
    const outputPath = join(root, 'public', `${base}-${suffix}.webp`)
    await mkdir(dirname(outputPath), { recursive: true })
    try {
      const previous = await stat(outputPath)
      if (previous.mtimeMs >= sourceStat.mtimeMs) {
        optimizedBytes += previous.size
        continue
      }
    } catch (error) { if (error.code !== 'ENOENT') throw error }
    const pipeline = sharp(sourcePath).keepMetadata()
    if (target < metadata.width) pipeline.resize({ width: target, withoutEnlargement: true, kernel: 'lanczos3' })
    await pipeline.webp({ lossless: true, effort: 5 }).toFile(outputPath)
    optimizedBytes += (await stat(outputPath)).size
  }

  // A full-size optimized version may differ only in the RGB values of fully
  // transparent pixels, which cannot affect the visible packaging artwork.
  const originalPixels = await sharp(sourcePath).ensureAlpha().raw().toBuffer()
  const fullPixels = await sharp(join(root, 'public', `${base}-full.webp`)).ensureAlpha().raw().toBuffer()
  if (originalPixels.length !== fullPixels.length) throw new Error(`Full image dimensions changed: ${url}`)
  for (let offset = 0; offset < originalPixels.length; offset += 4) {
    if (originalPixels[offset + 3] !== fullPixels[offset + 3] ||
        (originalPixels[offset + 3] > 0 && (
          originalPixels[offset] !== fullPixels[offset] ||
          originalPixels[offset + 1] !== fullPixels[offset + 1] ||
          originalPixels[offset + 2] !== fullPixels[offset + 2]
        ))) throw new Error(`Visible product pixels were changed: ${url}`)
  }
}

const manifestPath = join(root, 'src/data/optimized-image-manifest.js')
await writeFile(manifestPath, `// Generated from the approved, unchanged product assets.\nexport default ${JSON.stringify(manifest, null, 2)}\n`)
console.log(`Responsive images: ${Object.keys(manifest).length} untouched originals (${(originalBytes / 1048576).toFixed(1)} MiB), generated ${(optimizedBytes / 1048576).toFixed(1)} MiB across three lossless image sizes`)
