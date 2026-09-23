import test from 'node:test'
import assert from 'node:assert/strict'
import {spawnSync} from 'node:child_process'
import {mkdtemp,writeFile,copyFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'
import {defaultSite,SITE_URL} from '../src/data/site.js'
import {approvedProducts} from '../src/data/catalogue.js'
const hasPhp=spawnSync('php',['--version']).status===0
test('Hostinger renders crawlable pages, product metadata, safe JSON, sitemap and real 404s',{skip:!hasPhp},async t=>{
 const dir=await mkdtemp(path.join(tmpdir(),'joytun-php-'));t.after(()=>rm(dir,{recursive:true,force:true}));await copyFile('public/index.php',path.join(dir,'index.php'))
 await writeFile(path.join(dir,'index.html'),'<html><head><title>Old</title><meta name="description" content="Old"></head><body><div id="root"></div></body></html>')
 await writeFile(path.join(dir,'seo-defaults.json'),JSON.stringify({site:{...defaultSite,home:{...defaultSite.home,title:'Care </script><script>alert(1)</script>'}},products:approvedProducts,origin:SITE_URL,project:''}))
 const render=route=>{const r=spawnSync('php',['-r',`$_SERVER['REQUEST_URI']=${JSON.stringify(route)};include 'index.php';`],{cwd:dir,encoding:'utf8'});assert.equal(r.status,0,r.stderr);assert.equal(r.stderr,'');return r.stdout}
 const html=render('/');assert(html.includes('rel="canonical"'));assert(!html.includes('<script>alert(1)</script>'));assert(html.includes('\\u003C/script\\u003E'));assert(html.includes('Kanchpur'));assert(!html.includes('AHN Tower'));assert.equal((html.match(/<title>/g)||[]).length,1)
 const product=render('/products/aro-detergent');assert(product.includes('https://www.joytunchemicals.com/products/aro-detergent'));assert(product.includes('"@type":"Product"'))
 const sitemap=render('/sitemap.xml');assert.equal((sitemap.match(/<loc>/g)||[]).length,26)
 const missing=spawnSync('php',['-r',`$_SERVER['REQUEST_URI']='/missing';ob_start();include 'index.php';ob_end_clean();echo http_response_code();`],{cwd:dir,encoding:'utf8'});assert.equal(missing.stdout,'404')
 assert(render('/admin/login').includes('noindex,nofollow'))
})
