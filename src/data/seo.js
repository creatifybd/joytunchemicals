import { SITE_URL, productUrl, safeUrl } from './site.js'
import {getDiscoveryTopic, getDiscoveryProducts, discoveryPath} from './searchLanding.js'
export const productSearchName = p => [p.name,p.variant,p.format].filter(Boolean).join(' — ')
export const productSearchDescription = p => `${productSearchName(p)} from Joytun, Bangladesh. ${p.desc || 'Explore product details and contact Joytun for availability and distribution enquiries.'}`
export function getSeo(site,products,pathname,search='') {
  const brand=site.brandPages?.find(b=>pathname===`/brands/${b.slug}`)
  const privacy=pathname==='/privacy'
  const topicMatch=pathname.match(/^\/care\/([-a-z0-9]+)\/?$/)
  const topic=getDiscoveryTopic(topicMatch?.[1])
  const params=new URLSearchParams(search)
  const match=pathname.match(/^\/products\/([^/]+)\/?$/)
  let slug=match?decodeURIComponent(match[1]):params.get('product')
  const product=products.find(p=>(p.slug||p.id)===slug&&p.status==='active')
  const key=pathname==='/about'?'about':pathname==='/contact'?'contact':pathname.startsWith('/products')?'products':'home'
  const missing=!topic&&!brand&&!privacy&&(!!match&&!product||(!['/','/products','/about','/contact'].includes(pathname)&&!match))
  const title=topic?topic.title:brand?`${brand.title} in Bangladesh | Joytun`:privacy?'Privacy & Analytics | Joytun':product?(product.seoTitle||`${productSearchName(product)} | Joytun`):missing?'Page not found | Joytun':site.seo[key].title
  const description=topic?topic.description:brand?brand.description:privacy?'How Joytun handles enquiries and optional website analytics.':product?(product.seoDescription||productSearchDescription(product)):site.seo[key].description
  const path=topic?discoveryPath(topic):brand||privacy?pathname:product?productUrl(product):['/','/products','/about','/contact'].includes(pathname)?pathname:'/'
  const url=SITE_URL+path
  const image=new URL(safeUrl(product?(product.images?.[0]||product.img):site.seo.image,'/images/brand/joytun-logo.png'),SITE_URL).href
  const organization={'@type':'Organization','@id':SITE_URL+'/#organization',name:site.brand.name,url:SITE_URL,logo:new URL(safeUrl(site.brand.logo),SITE_URL).href,email:site.brand.email,telephone:site.brand.phone,address:{'@type':'PostalAddress',streetAddress:site.brand.location,addressCountry:'BD'}}
  const graph=[organization,{'@type':'WebSite','@id':SITE_URL+'/#website',url:SITE_URL,name:site.brand.name,publisher:{'@id':organization['@id']}},{'@type':'WebPage','@id':url+'#page',url,name:title,description,isPartOf:{'@id':SITE_URL+'/#website'}}]
  if(path!=='/')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL+'/'},{'@type':'ListItem',position:2,name:product?'Our products':brand?brand.title:privacy?'Privacy':key,item:product?SITE_URL+'/products':url},...(product?[{'@type':'ListItem',position:3,name:product.name,item:url}]:[])]})
  if(topic)graph.push({'@type':'CollectionPage','@id':url+'#collection',name:topic.heading,url,description:topic.description,about:{'@type':'Thing',name:topic.name},hasPart:getDiscoveryProducts(topic,products).map(p=>({'@type':'WebPage',name:productSearchName(p),url:SITE_URL+productUrl(p)}))})
  if(brand)graph.push({'@type':'CollectionPage','@id':url+'#collection',name:brand.title,url,description,about:{'@type':'Brand',name:brand.brand},hasPart:products.filter(p=>p.status==='active'&&p.brand===brand.brand).map(p=>({'@type':'WebPage',name:p.name,url:SITE_URL+productUrl(p)}))})
  if(product)graph.push({'@type':'Product','@id':url+'#product',name:productSearchName(product),url,description,image:[...new Set((product.images?.length?product.images:[product.img]).filter(Boolean).map(src=>new URL(safeUrl(src),SITE_URL).href))],category:product.cat||product.type,additionalProperty:[{'@type':'PropertyValue',name:'Variant',value:product.variant},{'@type':'PropertyValue',name:'Pack format',value:product.format}].filter(p=>p.value),mainEntityOfPage:{'@id':url+'#page'},sku:product.slug||product.id,brand:{'@type':'Brand',name:product.brand||site.brand.shortName},manufacturer:{'@id':organization['@id']}})
  if(key==='products'&&!product)graph.push({'@type':'ItemList',itemListElement:products.filter(p=>p.status==='active').map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:SITE_URL+productUrl(p)}))})
  return {title,description,url,image,robots:missing||pathname.startsWith('/admin')||params.has('q')||params.has('search')||params.has('preview')||!site.seo.indexable?'noindex,follow':'index,follow,max-image-preview:large',schema:{'@context':'https://schema.org','@graph':graph},missing}
}
