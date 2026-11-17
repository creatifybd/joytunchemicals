import test from 'node:test'
import assert from 'node:assert/strict'
import { stat } from 'node:fs/promises'
import { approvedProducts } from '../src/data/catalogue.js'
import imageManifest from '../src/data/optimized-image-manifest.js'
import { optimizedProductImageProps } from '../src/data/optimizedImages.js'

test('approved product artwork is covered by responsive, lossless image variants', async () => {
  assert.ok(Object.keys(imageManifest).length >= approvedProducts.length)
  for (const product of approvedProducts) {
    const original = product.img
    const entry = imageManifest[original]
    assert.ok(entry, `Missing optimized image for ${original}`)
    assert.ok(entry.width >= 720, `${original} should have sufficient source resolution`)
    assert.ok((await stat(`public${original}`)).size > 0)
    const props = optimizedProductImageProps(original, '250px')
    assert.equal(props.sizes, '250px')
    assert.match(props.srcSet, /-360\.webp 360w/)
    assert.match(props.srcSet, /-720\.webp 720w/)
    assert.ok(props.srcSet.endsWith(`${entry.base}-full.webp ${entry.width}w`))
  }
})

test('unapproved external or user-uploaded files never get invented optimized URLs', () => {
  for (const url of ['https://example.com/photo.png', '/uploads/custom.png', '//example.com/photo.png', '', null]) {
    assert.deepEqual(optimizedProductImageProps(url), {})
  }
})

test('approved full website URLs and query strings resolve to the matching responsive image', () => {
  const url = approvedProducts[0].img
  const relative = optimizedProductImageProps(url)
  const absolute = optimizedProductImageProps(`https://www.joytunchemicals.com${url}?v=1`)
  assert.equal(relative.srcSet, absolute.srcSet)
})

test('WebP loading errors fall back to untouched original image', () => {
  const props = optimizedProductImageProps(approvedProducts[0].img)
  const state = { removed: [], dataset: {}, removeAttribute(name) { this.removed.push(name) } }
  props.onError({ currentTarget: state })
  assert.deepEqual(state.removed, ['srcset', 'sizes'])
  assert.equal(state.dataset.optimizedFallback, 'true')
  props.onError({ currentTarget: state })
  assert.equal(state.removed.length, 2)
})
