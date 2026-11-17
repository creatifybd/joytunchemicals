import test from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const source = file => readFileSync(new URL(`../${file}`, import.meta.url), 'utf8')

test('server refreshes stale Firestore snapshots after the public response', () => {
  const php = source('public/index.php')
  assert.match(php, /register_shutdown_function\(static function/)
  assert.match(php, /fastcgi_finish_request/)
  assert.match(php, /litespeed_finish_request/)
  assert.match(php, /LOCK_EX\|LOCK_NB/)
  assert.match(php, /@rename\(\$tmp,\$cache\)/)
  assert.match(php, /stale-while-revalidate=300/)
  assert.match(php, /private, no-store/)
})

test('first render discovers the homepage hero without waiting for React', () => {
  const php = source('public/index.php')
  assert.match(php, /\$path==='\/' && !empty\(\$site\['media'\]\['showLifestyleImages'\]\)/)
  assert.match(php, /rel=\\?"preload\\?" as=\\?"image\\?"/)
  assert.match(php, /fetchpriority=\\?"high\\?"/)
})

test('public entry defers Firebase rather than bundling it into initial JS', () => {
  const files = ['src/hooks/useAuth.jsx','src/hooks/useData.jsx','src/site/Pages.jsx','src/site/Product.jsx']
  for (const file of files) {
    const js = source(file)
    assert.doesNotMatch(js, /\bfrom\s+['"](?:firebase\/|\.\.\/lib\/(?:firebase|firestore))/,
      `${file} should not statically load Firebase`)
  }
  assert.match(source('src/hooks/useAuth.jsx'), /import\('firebase\/auth'\)/)
  assert.match(source('src/hooks/useData.jsx'), /import\('\.\.\/lib\/firestore'\)/)
})
