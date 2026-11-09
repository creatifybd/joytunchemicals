import {appendFileSync} from 'node:fs'
import {fileURLToPath} from 'node:url'
import path from 'node:path'
import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
import {defaultSite} from '../src/data/site.js'

const origin=(process.env.SITE_URL||'https://www.joytunchemicals.com').replace(/\/+$/,'')
export const expectedPaths=[
  '/','/products','/about','/contact','/privacy',
  ...defaultSite.brandPages.map(b=>'/brands/'+b.slug),
  ...discoveryTopics.map(t=>'/care/'+t.slug),
  ...approvedProducts.map(p=>'/products/'+p.slug)
]
const categories=new Map(discoveryTopics.map(t=>[t.slug,t]))
const limit=4
const problems=[]
const notes=[]
const report={time:new Date().toISOString(),site:origin,checked:0,images:0,problems:[],notes:[]}

export function extractLiveSchema(html){
 const open='<script id="joytun-schema" type="application/ld+json">'
 const start=html.indexOf(open)
 if(start===-1)return null
 const end=html.indexOf('</script>',start+open.length)
 if(end===-1)return null
 try{return JSON.parse(html.slice(start+open.length,end))}catch{return null}
}
export function extractCanonical(html){
 return html.match(/<link\s+rel="canonical"\s+href="([^"]+)"/i)?.[1]||null
}
export function extractRobots(html){
 return html.match(/<meta\s+name="robots"\s+content="([^"]+)"/i)?.[1]||null
}
export function sitemapLocations(xml){
 return [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m=>m[1].replace(/&amp;/g,'&'))
}
async function request(url,{method='GET'}={}){
 let lastError
 for(let i=0;i<2;i++){
  try{
   const response=await fetch(url,{method,headers:{'Cache-Control':'no-cache','User-Agent':'Joytun-SEO-Health/1.0 (+public-site-check)'},signal:AbortSignal.timeout(18000)})
   if(i===0&&[429,502,503,504].includes(response.status)){await new Promise(r=>setTimeout(r,1100));continue}
   return response
  }catch(e){lastError=e;if(i===0)await new Promise(r=>setTimeout(r,1100))}
 }
 throw lastError||new Error('Request could not be completed')
}
function fail(path,message){problems.push(path+': '+message)}
async function checkPage(pathname){
 const url=origin+pathname
 try{
  const response=await request(url)
  if(response.status!==200){fail(pathname,'Expected HTTP 200, received '+response.status);return}
  if(!/text\/html/i.test(response.headers.get('content-type')||''))fail(pathname,'Missing HTML content-type')
  const html=await response.text()
  const canonical=extractCanonical(html)
  if(canonical!==url)fail(pathname,'Incorrect canonical: '+canonical)
  const robots=extractRobots(html)||''
  if(!robots.startsWith('index,follow'))fail(pathname,'Expected index,follow robots directive: '+robots)
  if(!/<h1\b/i.test(html))fail(pathname,'No server-rendered H1')
  if(html.includes('AHN Tower'))fail(pathname,'Legacy address leaked')
  const graph=extractLiveSchema(html)?.['@graph']
  if(!Array.isArray(graph))fail(pathname,'Structured JSON-LD @graph missing')
  if(pathname.startsWith('/products/')){
   if(!graph?.find(x=>x['@type']==='Product'))fail(pathname,'Product schema missing')
   if(!graph?.find(x=>x['@type']==='BreadcrumbList'))fail(pathname,'Product breadcrumbs missing')
   const slug=pathname.slice('/products/'.length)
   const p=approvedProducts.find(x=>x.slug===slug)
   if(p&&!html.includes('/care/'))fail(pathname,'No contextual care guide link')
  }
  if(pathname.startsWith('/care/')){
   if(!graph?.find(x=>x['@type']==='CollectionPage'))fail(pathname,'CollectionPage schema missing')
   const crumbs=graph?.find(x=>x['@type']==='BreadcrumbList')?.itemListElement||[]
   if(crumbs.length!==3||crumbs[1]?.item!==origin+'/products')fail(pathname,'Guide breadcrumb hierarchy invalid')
   const topic=categories.get(pathname.slice(6))
   if(topic&&!html.includes(topic.headingBn))fail(pathname,'Server-rendered Bangla topic heading missing')
  }
  report.checked++
 }catch(e){fail(pathname,e.message)}
}
async function checkImage(p){
 const src=p.img.startsWith('http')?p.img:origin+p.img
 try{
  const response=await request(src,{method:'HEAD'})
  if(response.status!==200)fail(p.slug,'Product image HEAD returned '+response.status)
  else if(!/image\//i.test(response.headers.get('content-type')||''))fail(p.slug,'Product image is not served with image content-type')
  else report.images++
 }catch(e){fail(p.slug,'Image check: '+e.message)}
}
async function inBatches(items,task){
 for(let i=0;i<items.length;i+=limit)await Promise.all(items.slice(i,i+limit).map(task))
}
async function run(){
 try{
  const robots=await request(origin+'/robots.txt')
  if(robots.status!==200)fail('/robots.txt','HTTP '+robots.status)
  else {
    const body=await robots.text()
    if(!body.includes('Sitemap: '+origin+'/sitemap.xml'))fail('/robots.txt','Canonical sitemap declaration missing')
  }
  const sitemap=await request(origin+'/sitemap.xml')
  if(sitemap.status!==200){fail('/sitemap.xml','HTTP '+sitemap.status)}
  else{
    const xml=await sitemap.text()
    const actual=sitemapLocations(xml),required=expectedPaths.map(p=>origin+p)
    if(actual.length!==new Set(actual).size)fail('/sitemap.xml','Duplicate sitemap URL(s)')
    for(const url of required)if(!actual.includes(url))fail('/sitemap.xml','Missing '+url)
    for(const url of actual)if(!url.startsWith(origin+'/')&&url!==origin)fail('/sitemap.xml','Unexpected external canonical: '+url)
    if(!xml.includes('xmlns:image='))fail('/sitemap.xml','Image namespace missing')
    report.sitemapUrls=actual.length
  }
  await inBatches(expectedPaths,checkPage)
  await inBatches(approvedProducts,checkImage)
  const admin=await request(origin+'/admin/login')
  if(admin.status!==200)fail('/admin/login','Unexpected HTTP '+admin.status)
  else if(!extractRobots(await admin.text())?.startsWith('noindex'))fail('/admin/login','Admin noindex missing')
  const missing=await request(origin+'/this-page-does-not-exist-joytun-seo-check')
  if(missing.status!==404)fail('/unknown','Expected real HTTP 404; got '+missing.status)
  report.problems=problems
  report.notes=notes
  const lines=[
    '### Joytun Live SEO & Availability Health',
    '- Site: '+origin,
    '- Checked canonical HTML pages: '+report.checked+' / '+expectedPaths.length,
    '- Checked product image assets: '+report.images+' / '+approvedProducts.length,
    '- Sitemap URLs found: '+(report.sitemapUrls??'not available'),
    '- Issues: '+problems.length,
    ...problems.map(s=>'- ❌ '+s),
    '- Checks validate public HTTP/HTML only. Google Search Console indexing, ranking, GA4, Clarity and private admin features are **not** verified by this script.'
  ]
  if(process.env.GITHUB_STEP_SUMMARY)appendFileSync(process.env.GITHUB_STEP_SUMMARY,lines.join('\n')+'\n')
  console.log(lines.join('\n'))
  if(problems.length)process.exitCode=1
 }catch(e){console.error('Live health audit failed:',e);process.exitCode=1}
}
if(process.argv[1]&&path.resolve(process.argv[1])===fileURLToPath(import.meta.url))await run()
