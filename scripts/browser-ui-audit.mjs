import {chromium} from 'playwright'
import assert from 'node:assert/strict'
import {mkdir,writeFile} from 'node:fs/promises'
import {approvedProducts} from '../src/data/catalogue.js'
import {discoveryTopics} from '../src/data/searchLanding.js'
const base=(process.env.SITE_URL||'https://www.joytunchemicals.com').replace(/\/$/,'')
await mkdir('qa-screenshots',{recursive:true})
const browser=await chromium.launch({headless:true,args:['--no-sandbox']})
const results=[]
const paths=[
 '/',
 '/products',
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
  const context=await browser.newContext({viewport:device.viewport,isMobile:device.isMobile,deviceScaleFactor:1,locale:'en-US',reducedMotion:'no-preference'})
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
   // Capture a precise warning for horizontal overflow without mistaking a
   // deliberately scrollable product rail for a broken whole-page layout.
   if(item.documentWidth>item.viewport+8)pageErrors.push(route+' document horizontally overflows on '+device.name+' ('+item.documentWidth+' > '+item.viewport+')')
   if(route==='/'){
    const banner=page.locator('.care-hero-banners')
    await banner.waitFor({state:'visible',timeout:14000})
    assert.equal(await page.locator('.care-banner-dots button').count(),6,'Homepage must display six category banner selectors on '+device.name)
    const before=(await page.locator('.care-banner-copy h2').textContent())?.trim()
    await page.getByRole('button',{name:'Next care category'}).click()
    await page.waitForFunction(previous=>document.querySelector('.care-banner-copy h2')?.textContent?.trim()!==previous,before,{timeout:10000})
    assert((await page.locator('.care-banner-link').getAttribute('href')||'').startsWith('/products?category='),'Active category banner has no catalogue link')
    await page.waitForFunction(()=>[...document.querySelectorAll('.care-banner-art img')].length>0&&[...document.querySelectorAll('.care-banner-art img')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000})
    // Regression: a mouse click must not leave the carousel permanently paused.
    const autoBefore=(await page.locator('.care-banner-copy h2').textContent())?.trim()
    const started=Date.now()
    await page.waitForFunction(previous=>document.querySelector('.care-banner-copy h2')?.textContent?.trim()!==previous,autoBefore,{timeout:6200})
    const elapsed=Date.now()-started
    assert(elapsed>=2000&&elapsed<5000,'3-second autoplay interval did not advance after mouse click: '+elapsed+' ms on '+device.name)
    // Product shapes differ, but both must occupy identically sized visual slots.
    for(const category of ['Hand care','Glass care']){
      await page.getByRole('button',{name:'Show '+category+' banner'}).click()
      const slots=await page.locator('.care-banner-product-slot').evaluateAll(nodes=>nodes.map(el=>{
        const rect=el.getBoundingClientRect()
        return {x:rect.x,width:rect.width,height:rect.height}
      }))
      assert.equal(slots.length,2,category+' must show two approved product slots')
      assert(Math.abs(slots[0].height-slots[1].height)<1,category+' product heights differ')
      assert(Math.abs(slots[0].width-slots[1].width)<1,category+' product widths differ')
      const gap=slots[1].x-(slots[0].x+slots[0].width)
      assert(gap>=10&&gap<=40,category+' product spacing is unbalanced: '+gap)
      await page.waitForFunction(()=>[...document.querySelectorAll('.care-banner-product-image')].length===2&&[...document.querySelectorAll('.care-banner-product-image')].every(img=>img.complete&&img.naturalWidth>0),null,{timeout:12000})
      await banner.screenshot({path:`qa-screenshots/${device.name}-${category==='Hand care'?'hand':'glass'}-pair.png`,animations:'disabled'})
    }
    await page.evaluate(()=>window.scrollTo(0,0))
   }
   if(route==='/products'){
    assert((await page.locator('.catalogue-grid .product-card').count())>=24,'Product catalogue has fewer than 24 cards on '+device.name)
   }
   if(route==='/contact'){
    assert((await page.locator('form.care-form input[required]').count())>=3,'Contact form fields missing on '+device.name)
   }
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
