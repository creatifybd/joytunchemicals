import {Link,useParams} from 'react-router-dom'
import {useData} from '../hooks/useData'
import {ProductCard} from './Product'
import {NotFoundPage} from './Pages'
import {ActionLink} from './Layout'
export default function BrandPage(){
 const {slug}=useParams(),{site,products}=useData()
 const brand=site.brandPages.find(b=>b.slug===slug)
 if(!brand)return <NotFoundPage/>
 const items=products.filter(p=>p.status==='active'&&p.brand===brand.brand)
 return <><section className="shell section-space brand-intro" data-section="brand_intro"><p className="eyebrow">THE JOYTUN FAMILY</p><h1>{brand.title}</h1><p>{brand.description}</p><h2 lang="bn">{brand.banglaTitle}</h2><p lang="bn">{brand.banglaText}</p><div className="brand-page-actions"><ActionLink to={`/contact?subject=${encodeURIComponent(brand.title)}`}>Enquire about {brand.brand}</ActionLink>{/^[-_a-zA-Z0-9]{11}$/.test(brand.videoId)&&<a className="text-link" href={`https://www.youtube.com/watch?v=${brand.videoId}`} target="_blank" rel="noopener noreferrer">Watch the official film ↗</a>}</div></section><section className="shell section-space" data-section="brand_products"><h2>Explore {brand.brand}</h2><div className="product-grid catalogue-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div><Link className="text-link" to="/products">Explore all Joytun products</Link></section></>
}
