import test from 'node:test'
import assert from 'node:assert/strict'
import {inspectSeoHtml,inspectSitemap,expectedSeoRoutes,auditPublicSeo} from '../scripts/audit-public-seo.js'
import {defaultSite,SITE_URL} from '../src/data/site.js'
import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
import {spawnSync} from 'node:child_process'
import {mkdtemp,writeFile,copyFile,rm} from 'node:fs/promises'
import {tmpdir} from 'node:os'
import path from 'node:path'

const php=spawnSync('php',['--version']).status===0
test('public SEO health checklist covers all approved routes and checks external failures',()=>{
 assert.equal(expectedSeoRoutes.length,38)
 assert.equal(new Set(expectedSeoRoutes).size,38)
 assert.deepEqual(inspectSitemap('<urlset><url><loc>https://www.joytunchemicals.com/</loc></url></urlset>').missing.length,37)
 assert(inspectSeoHtml('<html><h1>Bad</h1></html>','/products/aro-detergent').length>=5)
})
test('all 38 PHP crawler pages pass exact metadata and schema audit',{skip:!php},async t=>{
 const dir=await mkdtemp(path.join(tmpdir(),'joytun-public-audit-'))
 t.after(()=>rm(dir,{recursive:true,force:true}))
 await copyFile('public/index.php',path.join(dir,'index.php'))
 await writeFile(path.join(dir,'index.html'),'<html><head><title>Old</title><meta name="description" content="Old"></head><body><div id="root"></div></body></html>')
 await writeFile(path.join(dir,'seo-defaults.json'),JSON.stringify({site:defaultSite,products:approvedProducts,topics:discoveryTopics,origin:SITE_URL,project:''}))
 function render(route){
  const result=spawnSync('php',['-r',`$_SERVER['REQUEST_URI']=${JSON.stringify(route)};include 'index.php';`],{cwd:dir,encoding:'utf8'})
  assert.equal(result.status,0,result.stderr)
  return result.stdout
 }
 const sitemap=inspectSitemap(render('/sitemap.xml'))
 assert.equal(sitemap.urls.length,38)
 assert.deepEqual(sitemap.missing,[])
 assert.deepEqual(sitemap.unexpected,[])
 for(const route of expectedSeoRoutes)assert.deepEqual(inspectSeoHtml(render(route),route),[],route)
})
test('public health check reports broken canonical without inventing a pass',async()=>{
 const fake=async url=>{
   const pathname=new URL(url).pathname
   return {ok:true,status:200,async text(){
     if(pathname==='/sitemap.xml')return '<urlset>'+expectedSeoRoutes.map(p=>'<url><loc>'+SITE_URL+p+'</loc></url>').join('')+'</urlset>'
     return '<html><title>Broken</title><h1>One</h1></html>'
   }}
 }
 const result=await auditPublicSeo(SITE_URL,{fetchImpl:fake,concurrency:7})
 assert.equal(result.ok,false)
 assert.equal(result.routesChecked,38)
 assert.equal(result.sitemapURLs,38)
 assert(result.errors.some(err=>err.includes('Incorrect canonical')))
})
