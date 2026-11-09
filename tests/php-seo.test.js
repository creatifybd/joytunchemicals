import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {mkdtemp,writeFile,copyFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {defaultSite,SITE_URL} from '../src/data/site.js'
import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
const hasPhp=spawnSync('php',['--version']).status===0
test('Hostinger renders crawlable pages, product metadata, safe JSON, sitemap and real 404s',{skip:!hasPhp},async t=>{
 const dir=await mkdtemp(path.join(tmpdir(),'joytun-php-'));t.after(()=>rm(dir,{recursive:true,force:true}));await copyFile('public/index.php',path.join(dir,'index.php'))
 await writeFile(path.join(dir,'index.html'),'<html><head><title>Old</title><meta name="description" content="Old"></head><body><div id="root"></div></body></html>')
 await writeFile(path.join(dir,'seo-defaults.json'),JSON.stringify({site:{...defaultSite,home:{...defaultSite.home,title:'Care </script><script>alert(1)</script>'}},products:approvedProducts,topics:discoveryTopics,origin:SITE_URL,project:''}))
 const render=route=>{const r=spawnSync('php',['-r',`$_SERVER['REQUEST_URI']=${JSON.stringify(route)};include 'index.php';`],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');return r.stdout}
 const html=render('/');assert(html.includes('rel="canonical"'));assert(!html.includes('<script>alert(1)</script>'));assert(html.includes('\\u003C/script\\u003E'));assert(html.includes('Kanchpur'));assert(!html.includes('AHN Tower'));assert.equal((html.match(/<title>/g)||[]).length,1)
 const product=render('/products/aro-detergent');assert(product.includes('https://www.joytunchemicals.com/products/aro-detergent'));assert(product.includes('"@type":"Product"'))
 const sitemap=render('/sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,38);assert.equal((sitemap.match(/<image:image>/g)||[]).length,24);assert(sitemap.includes('/images/products-corrected/nolive-lavender-pump-v2.webp'));assert(sitemap.includes('xmlns:image='))
 const pump=render('/products/nolive-lavender-pump'),refill=render('/products/nolive-lavender-refill');assert(pump.includes('Lavender — Pump bottle'));assert(refill.includes('Lavender — Refill pouch'));assert(pump.includes('aria-label="Product variants"'));assert(pump.includes('/products/nolive-lavender-refill'));assert(pump.includes('Use &amp; care'))
 const guide=render('/care/dish-wash-bar');assert(guide.includes('Dish Wash Bar in Bangladesh'));assert(guide.includes('বাংলাদেশে ডিশ ওয়াশ বার'));assert(guide.includes('/products/vix-lemon-bar'));assert(guide.includes('CollectionPage'));assert(sitemap.includes('/care/hand-wash'));assert(sitemap.includes('/care/toilet-cleaner'));
 const parseSchema=html=>{const match=html.match(/<script id="joytun-schema" type="application\\/ld\\+json">([^<]+)<\\/script>/);assert(match,'No JSON-LD');return JSON.parse(match[1])['@graph']}
 const guideCrumbs=parseSchema(guide).find(n=>n['@type']==='BreadcrumbList').itemListElement
 assert.deepEqual(guideCrumbs.map(n=>n.name),['Home','Our products','Dish Wash Bar'])
 assert.deepEqual(guideCrumbs.map(n=>n.position),[1,2,3])
 const productCrumbs=parseSchema(product).find(n=>n['@type']==='BreadcrumbList').itemListElement
 assert.deepEqual(productCrumbs.map(n=>n.name),['Home','Our products','Aro Synthetic Detergent Powder — Fresh Green — Pouch'])
 assert(product.includes('href="/care/detergent-powder"'),'Product page must cross-link to its care guide')
 assert(pump.includes('href="/care/hand-wash"'))
 const brand=render('/brands/nolive');assert(brand.includes('n’Olive Hand Wash in Bangladesh'));assert(brand.includes('এন অলিভ'));assert(brand.includes('/products/nolive-lavender-pump'));assert(!brand.includes('Page not found'));assert(render('/privacy').includes('Privacy &amp; Analytics'));
 const missing=spawnSync('php',['-r',`$_SERVER['REQUEST_URI']='/missing';ob_start();include 'index.php';ob_end_clean();echo http_response_code();`],{cwd:dir,encoding:'utf8'});assert.equal(missing.stdout,'404')
 assert(render('/admin/login').includes('noindex,nofollow'))
})

