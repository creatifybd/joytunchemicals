import {useEffect} from 'react'
import {useLocation} from 'react-router-dom'
import {useData} from '../hooks/useData'
import {getSeo} from '../data/seo'
import {safeUrl} from '../data/site'
export default function SEO(){
 const {site,products}=useData();const {pathname,search}=useLocation()
 useEffect(()=>{
  const seo=getSeo(site,products,pathname,search);document.title=seo.title
  const meta=(key,value,attr='name')=>{let el=document.head.querySelector(`meta[${attr}="${key}"]`);if(!el){el=document.createElement('meta');el.setAttribute(attr,key);document.head.append(el)}el.content=value}
  meta('description',seo.description);meta('robots',seo.robots);meta('theme-color',site.appearance.ink)
  for(const [k,v]of Object.entries({'og:title':seo.title,'og:description':seo.description,'og:url':seo.url,'og:image':seo.image,'og:type':'website','og:site_name':site.brand.name}))meta(k,v,'property')
  meta('twitter:card','summary_large_image');meta('twitter:title',seo.title);meta('twitter:description',seo.description);meta('twitter:image',seo.image)
  let canonical=document.querySelector('link[rel="canonical"]');if(!canonical){canonical=document.createElement('link');canonical.rel='canonical';document.head.append(canonical)}canonical.href=seo.url
  let schema=document.getElementById('joytun-schema');if(!schema){schema=document.createElement('script');schema.id='joytun-schema';schema.type='application/ld+json';document.head.append(schema)}schema.textContent=JSON.stringify(seo.schema)
  const icon=document.querySelector('link[rel="icon"]');if(icon)icon.href=safeUrl(site.brand.favicon)
 },[site,products,pathname,search]);return null
}
