import { Link, useParams } from 'react-router-dom'
import { ArrowUpRight } from 'lucide-react'
import { useData } from '../hooks/useData'
import { discoveryTopics, getDiscoveryTopic, getDiscoveryProducts, discoveryPath } from '../data/searchLanding'
import { ProductCard } from './Product'
import { NotFoundPage } from './Pages'
import { PartnerSection } from './Layout'

export function DiscoveryLinks({ exclude }) {
  return <nav className="discovery-navigation" aria-label="Browse home and personal care topics">
    <h2>Explore by care need</h2>
    <div className="discovery-link-grid">{discoveryTopics.filter(t=>t.slug!==exclude).map(t=><Link to={discoveryPath(t)} key={t.slug}>{t.name}<ArrowUpRight size={16}/></Link>)}</div>
  </nav>
}

export default function DiscoveryPage() {
  const { slug } = useParams()
  const { products } = useData()
  const topic = getDiscoveryTopic(slug)
  if (!topic) return <NotFoundPage/>
  const items = getDiscoveryProducts(topic, products)
  return <>
    <div className="shell product-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/products">Our products</Link><span>/</span><span>{topic.name}</span></div>
    <section className="shell section-space discovery-intro" data-section="care_guide_intro">
      <p className="eyebrow">JOYTUN CARE GUIDE · BANGLADESH</p>
      <h1>{topic.heading}</h1>
      <p>{topic.introduction}</p>
      <div lang="bn" className="discovery-bangla"><h2>{topic.headingBn}</h2><p>{topic.introductionBn}</p></div>
    </section>
    <section className="shell section-space" data-section="care_guide_products" aria-label={topic.name+' products'}>
      <div className="section-heading"><div><p className="eyebrow">EXPLORE THE COLLECTION</p><h2>{topic.name} products</h2></div></div>
      {items.length
        ? <div className="product-grid catalogue-grid">{items.map(p=><ProductCard key={p.id} product={p}/>)}</div>
        : <p>Products in this category are being updated. <Link to="/products">See the full collection</Link>.</p>}
      <p className="discovery-care-note">{topic.note}</p>
      <DiscoveryLinks exclude={slug}/>
    </section>
    <PartnerSection/>
  </>
}
