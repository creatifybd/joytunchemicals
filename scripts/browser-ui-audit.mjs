import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
const base='https://www.joytunchemicals.com'
await mkdir('qa-screenshots',{recursive:true})
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const results=[]
const paths=[
 '/',
 '/care/hand-wash',
 '/care/dish-wash-liquid',
 '/care/dish-wash-bar',
 '/care/toilet-cleaner',
 '/care/detergent-powder',
 '/care/floor-cleaner',
 '/care/glass-cleaner',
 '/products/nolive-lavender-pump',
 '/products/vix-lemon-bar',
 '/products/baby-detergent-blue',
 '/contact',
 '/admin/login'
]
try{
 for(const device of [
  {name:'desktop',viewport:{width:1440,height:900},isMobile:false},
  {name:'mobile',viewport:{width:390,height:844},isMobile:true}
 ]){
  const context=await browser.newContext({viewport:device.viewport,isMobile:device.isMobile,deviceScaleFactor:1,locale:'en-US'})
  const page=await context.newPage()
  const pageErrors=[]
  const prematureTracking=[]
  page.on('pageerror',err=>pageErrors.push(String(err.message).slice(0,240)))
  page.on('request',request=>{
   const url=request.url()
   if(/google-analytics\.com\/(g|collect)|googletagmanager\.com\/gtag\/js|clarity\.ms\/tag/i.test(url))prematureTracking.push(url)
  })
  for(const route of paths){
   const response=await page.goto(base+route,{waitUntil:'domcontentloaded',timeout:35000})
   assert.equal(response?.status(),200,route+' is not HTTP 200 on '+device.name)
   await page.locator('h1').first().waitFor({state:'visible',timeout:18000})
   // Wait for the client app to mount and preserve meaningful visible headings.
   await page.waitForTimeout(250)
   const item=await page.evaluate(()=>({
    title:document.title,
    h1:document.querySelector('h1')?.textContent?.trim()||'',
    canonical:document.querySelector('link[rel="canonical"]')?.href||'',
    viewport:window.innerWidth,
    documentWidth:document.documentElement.scrollWidth,
    rootChildren:document.getElementById('root')?.children.length||0
   }))
   assert(item.h1.length>2,route+' missing public heading')
   assert(item.title.length>2,route+' missing title')
   if(route!=='/admin/login')assert.equal(item.canonical,base+route,route+' canonical differs on '+device.name)
   assert(item.rootChildren>0,route+' app missing')
   if(route.startsWith('/care/')){
    assert((await page.locator('a[href^="/products/"]').count())>0,route+' lacks product links')
   }
   if(route.startsWith('/products/')){
    assert((await page.locator('a[href^="/care/"]').count())>0,route+' lacks related care guide')
    await page.locator('.detail-picture img').first().waitFor({state:'visible',timeout:12000})
    const images=page.locator('.detail-picture img')
    assert((await images.count())>0,route+' has no product image')
    await images.first().scrollIntoViewIfNeeded()
    await page.waitForFunction(()=>{const img=document.querySelector('.detail-picture img');return img?.complete&&img?.naturalWidth>0},null,{timeout:12000}).catch(()=>{})
    assert(await images.first().evaluate(img=>img.complete&&img.naturalWidth>0),route+' product image failed to load')
   }
   if(route==='/admin/login'){
    assert(/noindex/i.test(await page.locator('meta[name="robots"]').getAttribute('content')||''),'Admin login is not noindex')
   }
   results.push({device:device.name,route,h1:item.h1.slice(0,70),title:item.title.slice(0,85),documentWidth:item.documentWidth,viewport:item.viewport})
   if(['/', '/care/hand-wash','/products/nolive-lavender-pump','/contact','/admin/login'].includes(route)){
    const name=route==='/'?'home':route.slice(1).replaceAll('/','-')
    await page.screenshot({path:`qa-screenshots/${device.name}-${name}.png`,fullPage:false})
   }
  }
  assert.equal(pageErrors.length,0,'Browser runtime errors on '+device.name+': '+pageErrors.join(' | '))
  assert.equal(prematureTracking.length,0,'Measurement request observed before consent on '+device.name)
  await context.close()
 }
 console.log('Responsive website QA passed:',results.length,'route/viewport combinations')
 await writeFile('qa-screenshots/browser-audit.json',JSON.stringify(results,null,2))
}catch(error){
 console.error('Browser UI QA failed:',error)
 await writeFile('qa-screenshots/browser-audit.json',JSON.stringify({error:String(error),results},null,2))
 process.exitCode=1
}finally{await browser.close()}
