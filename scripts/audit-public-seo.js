import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
import {defaultSite,SITE_URL} from '../src/data/site.js'

// Public checks require no user cookies, GSC OAuth credentials or paid provider.
export const expectedSeoRoutes = [
  '/', '/products', '/about', '/contact', '/privacy',
  ...(defaultSite.brandPages||[]).map(b=>'/brands/'+b.slug),
  ...discoveryTopics.map(t=>'/care/'+t.slug),
  ...approvedProducts.map(p=>'/products/'+p.slug)
]

export function inspectSeoHtml(html,pathname) {
 const errors=[]
 const origin=SITE_URL+pathname
 const canonical=html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]
 if(canonical!==origin)errors.push('Incorrect canonical: '+canonical)
 if(!/<meta\s+name="robots"\s+content="index,follow,max-image-preview:large"/i.test(html))errors.push('Missing indexable robots directive')
 const title=html.match(/<title>([\s\S]*?)<\/title>/i)?.[1]
 if(!title?.trim())errors.push('Missing title')
 if((html.match(/<h1(?:\s[^>]*)?>/gi)||[]).length!==1)errors.push('Expected exactly one server-rendered H1')
 if(!/<meta\s+name="description"\s+content="[^"]+"/i.test(html))errors.push('Missing description')
 const open='<script id="joytun-schema" type="application/ld+json">'
 const i=html.indexOf(open),j=html.indexOf('</script>',i+open.length)
 let nodes=[]
 if(i<0||j<0)errors.push('Missing JSON-LD structured data')
 else try { nodes=JSON.parse(html.slice(i+open.length,j))['@graph']||[] } catch { errors.push('Invalid JSON-LD') }
 if(!nodes.some(n=>n['@type']==='Organization'))errors.push('Missing Organization node')
 if(pathname.startsWith('/products/')) {
   const node=nodes.find(n=>n['@type']==='Product')
   if(!node||node.url!==origin)errors.push('Missing or mismatched Product node')
   const p=approvedProducts.find(v=>pathname==='/products/'+v.slug)
   if(p&&!html.includes('href="/care/'))errors.push('Product page lacks its care-guide link')
   if(p&&!(node?.image?.length))errors.push('Product structured data lacks image')
 }
 if(pathname.startsWith('/care/')) {
   const node=nodes.find(n=>n['@type']==='CollectionPage')
   if(!node||node.url!==origin)errors.push('Missing CollectionPage node')
   if(!html.includes('href="/products/'))errors.push('Care guide lacks product links')
 }
 if(pathname!=='/') {
   const crumb=nodes.find(n=>n['@type']==='BreadcrumbList')?.itemListElement
   if(!Array.isArray(crumb)||crumb.length<2||crumb.at(-1)?.item!==origin)errors.push('Broken BreadcrumbList')
 }
 if(/AHN Tower/i.test(html))errors.push('Old office address leaked')
 return errors
}
export function inspectSitemap(xml) {
 const urls=[...xml.matchAll(/<url>\s*<loc>([^<]+)<\/loc>/g)].map(m=>m[1])
 const expected=expectedSeoRoutes.map(p=>SITE_URL+p)
 const missing=expected.filter(url=>!urls.includes(url))
 const unexpected=urls.filter(url=>!expected.includes(url))
 return {urls,missing,unexpected}
}
// A missing image may be rewritten to a 200 HTML error page; check MIME type too.
export const validProductImageResponse = response =>
  response.ok && /^image\//i.test(response.headers?.get?.('content-type')||'')

export async function auditPublicSeo(baseUrl=SITE_URL,{fetchImpl=fetch,concurrency=5}={}) {
 const base=new URL(baseUrl)
 const errors=[]
 const getResponse=path=>fetchImpl(new URL(path,base),{headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)})
 const get=async path=>{
   const response=await getResponse(path)
   if(!response.ok)throw new Error('HTTP '+response.status+' '+path)
   return response.text()
 }
 const robots=await get('/robots.txt')
 if(!robots.includes('Disallow: /admin'))errors.push('Robots policy no longer protects /admin from crawling')
 if(!robots.includes('Sitemap: '+SITE_URL+'/sitemap.xml'))errors.push('Robots policy is missing canonical Sitemap URL')
  const sitemap=inspectSitemap(await get('/sitemap.xml'))
 if(sitemap.missing.length||sitemap.unexpected.length) errors.push('Sitemap mismatch: missing='+sitemap.missing.join(',')+' extra='+sitemap.unexpected.join(','))
 if(new Set(sitemap.urls).size!==sitemap.urls.length)errors.push('Sitemap contains duplicate URLs')
 const routes=[...expectedSeoRoutes]
 const workers=Array.from({length:Math.min(concurrency,routes.length)},async()=>{
   while(routes.length){
     const path=routes.shift()
     try{
       const html=await get(path)
       errors.push(...inspectSeoHtml(html,path).map(error=>path+': '+error))
     }catch(err){errors.push(path+': '+err.message)}
   }
 })
 await Promise.all(workers)
 // Verify that non-public routes are not indexable and unknown routes return a real 404.
 try {
   const admin=await getResponse('/admin/login')
   if(admin.status!==200)errors.push('/admin/login: Expected HTTP 200, got '+admin.status)
   else if(!/<meta\\s+name="robots"\\s+content="noindex(?:,|\")/i.test(await admin.text()))errors.push('/admin/login: Missing noindex directive')
 } catch(error){errors.push('/admin/login: '+error.message)}
 try {
   const missing=await getResponse('/joytun-not-a-real-page-health-check')
   if(missing.status!==404)errors.push('/unknown: Expected HTTP 404, got '+missing.status)
   else if(!/<meta\\s+name="robots"\\s+content="noindex(?:,|\")/i.test(await missing.text()))errors.push('/unknown: 404 page missing noindex directive')
 } catch(error){errors.push('/unknown: '+error.message)}
 // Check the original approved assets without changing or re-encoding them.
 const images=[...new Set(approvedProducts.map(p=>p.img).filter(Boolean))]
 const queue=[...images]
 await Promise.all(Array.from({length:Math.min(5,queue.length)},async()=>{
   while(queue.length){
     const img=queue.shift()
     try {
       const response=await fetchImpl(new URL(img,base),{method:'HEAD',headers:{'Cache-Control':'no-cache'},signal:AbortSignal.timeout(20000)})
       if(!validProductImageResponse(response))errors.push('Missing or non-image asset: '+img+' (HTTP '+response.status+', type '+response.headers?.get?.('content-type')+')')
     } catch(e){errors.push('Image asset fetch failed: '+img+' '+e.message)}
   }
 }))
 return {ok:errors.length===0,routesChecked:expectedSeoRoutes.length,sitemapURLs:sitemap.urls.length,imagesChecked:images.length,errors}
}
if(process.argv[1]&&new URL('file://'+process.argv[1]).pathname===new URL(import.meta.url).pathname){
  const report=await auditPublicSeo(process.env.SITE_URL||SITE_URL)
  console.log(JSON.stringify(report,null,2))
  if(!report.ok)process.exitCode=1
}
