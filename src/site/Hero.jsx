import {Link} from 'react-router-dom'
import {ArrowUpRight} from 'lucide-react'
import {useData} from '../hooks/useData'
import {safeUrl,resolveProductImage} from '../data/site'
import {ActionLink} from './Layout'
export function EditorialTitle({text,as:Tag='h2',className=''}){const lines=text.split('\n');return <Tag className={`editorial-title ${className}`}>{lines.map((line,i)=><span className={i===lines.length-1&&lines.length>1?'script-line':''} key={i}>{line}</span>)}</Tag>}
export default function Hero(){
 const {site}=useData();const h=site.home,m=site.media
 return <><section className={`corporate-hero ${m.showLifestyleImages?'':'without-photo'}`}>
 {m.showLifestyleImages&&<img className="hero-lifestyle" src={safeUrl(m.heroImage)} alt={m.heroAlt} fetchPriority="high" width="1672" height="941"/>}
 <div className="hero-shade"/><div className="shell corporate-hero-copy"><p className="eyebrow">{h.eyebrow}</p><EditorialTitle text={h.title} as="h1"/><p>{h.description}</p>{h.accent&&<p className="hero-managed-accent">{h.accent}</p>}<div className="hero-links"><ActionLink to={h.buttonUrl}>{h.button}</ActionLink><Link className="text-link" to="/about">Our story<ArrowUpRight size={18}/></Link></div><small className="hero-managed-note">{h.note}</small></div></section>
 <div className="hero-information"><div className="shell"><p>{site.brand.announcement}</p><span>{site.brand.location}</span><Link to="/contact">Contact us <ArrowUpRight size={17}/></Link></div></div></>
}
export function CollectionShowcase(){const {site,products}=useData();return <div className="collection-showcase">{site.slides.map((s,i)=><Link className="collection-editorial" key={i} to={`/products?category=${s.category}`} style={{background:s.color}}><div><h3>{s.name}</h3><p>{s.caption}</p><ArrowUpRight size={21}/></div><div className="collection-products">{s.images.slice(0,3).filter(v=>resolveProductImage(v,products)).map((v,j)=><img key={j} src={resolveProductImage(v,products)} alt={products.find(p=>p.slug===v)?.name||s.name} loading="lazy"/>)}</div></Link>)}</div>}
