import { SITE_URL, productUrl, safeUrl } from './site.js'
export function getSeo(site,products,pathname,search='') {
  const params=new URLSearchParams(search)
  const match=pathname.match(/^\/products\/([^/]+)\/?$/)
  let slug=match?decodeURIComponent(match[1]):params.get('product')
  const product=products.find(p=>(p.slug||p.id)===slug&&p.status==='active')
  const key=pathname==='/about'?'about':pathname==='/contact'?'contact':pathname.startsWith('/products')?'products':'home'
  const missing=!!match&&!product||(!['/','/products','/about','/contact'].includes(pathname)&&!match)
  const title=product?(product.seoTitle||`${product.name} — ${product.variant||product.format||'Product'} | Joytun`):missing?'Page not found | Joytun':site.seo[key].title
  const description=product?(product.seoDescription||product.desc||site.seo.products.description):site.seo[key].description
  const path=product?productUrl(product):['/','/products','/about','/contact'].includes(pathname)?pathname:'/'
  const url=SITE_URL+path
  const image=new URL(safeUrl(product?(product.images?.[0]||product.img):site.seo.image,'/images/brand/joytun-logo.png'),SITE_URL).href
  const organization={'@type':'Organization','@id':SITE_URL+'/#organization',name:site.brand.name,url:SITE_URL,logo:new URL(safeUrl(site.brand.logo),SITE_URL).href,email:site.brand.email,telephone:site.brand.phone,address:{'@type':'PostalAddress',streetAddress:site.brand.location,addressCountry:'BD'}}
  const graph=[organization,{'@type':'WebSite','@id':SITE_URL+'/#website',url:SITE_URL,name:site.brand.name,publisher:{'@id':organization['@id']}},{'@type':'WebPage','@id':url+'#page',url,name:title,description,isPartOf:{'@id':SITE_URL+'/#website'}}]
  if(path!=='/')graph.push({'@type':'BreadcrumbList',itemListElement:[{'@type':'ListItem',position:1,name:'Home',item:SITE_URL+'/'},{'@type':'ListItem',position:2,name:product?'Our products':key,item:product?SITE_URL+'/products':url},...(product?[{'@type':'ListItem',position:3,name:product.name,item:url}]:[])]})
  if(product)graph.push({'@type':'Product','@id':url+'#product',name:`${product.name} ${product.variant||''}`,description,image,sku:product.slug||product.id,brand:{'@type':'Brand',name:product.brand||site.brand.shortName},manufacturer:{'@id':organization['@id']}})
  if(key==='products'&&!product)graph.push({'@type':'ItemList',itemListElement:products.filter(p=>p.status==='active').map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,url:SITE_URL+productUrl(p)}))})
  return {title,description,url,image,robots:missing||pathname.startsWith('/admin')||params.has('q')||params.has('search')||params.has('preview')||!site.seo.indexable?'noindex,follow':'index,follow,max-image-preview:large',schema:{'@context':'https://schema.org','@graph':graph},missing}
}
