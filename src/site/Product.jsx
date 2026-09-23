import { useCallback, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Check, Minus, Plus } from 'lucide-react'
import { useData } from '../hooks/useData'
import { productUrl, safeUrl } from '../data/site'
import { getCategory } from '../data/catalogue'
import Dialog from '../components/public/Dialog'
import { addOrder } from '../lib/firestore'

export function ProductCard({ product, onSelect }) {
  const {site}=useData()
  const category = getCategory(product,site.categories)
  const picture = product.images?.[0] || product.img
  return <article className="product-card">
    <Link to={productUrl(product)} onClick={onSelect ? e=>{e.preventDefault();onSelect(product)} : undefined} className="product-card-link" aria-label={`View ${product.name}, ${product.variant || ''}, ${product.format || ''}`}>
      <div className="product-picture" style={{ '--product-tone': category.color }}><span className="product-category-label">{category.name}</span><img src={safeUrl(picture,'')} alt={`${product.name} — ${product.variant || ''} ${product.format || ''}`} loading="lazy" decoding="async"/><span className="product-view">Discover product <ArrowUpRight size={18}/></span></div>
      <div className="product-card-info"><span className="product-brand">{product.brand || product.name}</span><h3>{product.type || product.name}</h3><p>{product.variant}{product.variant && product.format && <span> · </span>}{product.format}</p><span className="product-card-arrow"><ArrowUpRight size={21}/></span></div>
    </Link>
  </article>
}

export function ProductDetails({ product, products, onClose, onSelect, onEnquire, standalone = false }) {
  const {site}=useData()
  const category = getCategory(product,site.categories)
  const siblings = products.filter(p=>p.brand===product.brand && p.type===product.type && p.status==='active')
  const [pictureIndex,setPictureIndex]=useState(0)
  const pictures=product.images?.length?product.images:[product.img]
  const [expanded, setExpanded] = useState(false)
  const Title=standalone?'h1':'h2'
  const Wrapper=standalone?'section':Dialog
  return <Wrapper {...(standalone?{className:'product-dialog standalone-product'}:{onClose,titleId:'product-title',className:'product-dialog'})}>
    <div className="detail-picture" style={{ backgroundColor: category.color }}><span className="eyebrow">{category.name}</span><img src={safeUrl(pictures[pictureIndex],'')} alt={`${product.name} ${product.variant || ''} ${product.format || ''}`}/>{pictures.length>1&&<div className="detail-thumbnails">{pictures.map((src,i)=><button key={i} aria-label={`View product image ${i+1}`} aria-pressed={i===pictureIndex} onClick={()=>setPictureIndex(i)}><img src={safeUrl(src,'')} alt=""/></button>)}</div>}</div>
    <div className="detail-copy"><p className="eyebrow">THE JOYTUN COLLECTION</p><p className="detail-brand">{product.brand}</p><Title id="product-title">{product.type || product.name}</Title><p className="detail-variant">{product.variant} <span>·</span> {product.format}</p><p className="detail-description">{product.desc}</p>{product.feats&&<ul className="product-features">{product.feats.split(/\n|,/).filter(Boolean).map(f=><li key={f}>{f}</li>)}</ul>}
      {siblings.length>1 && <div className="variant-picker"><h3>Find your favourite</h3><div>{siblings.map(p=><button className={p.id===product.id?'selected':''} key={p.id} onClick={()=>onSelect(p)} aria-pressed={p.id===product.id}>{p.variant}<small>{p.format}</small></button>)}</div></div>}
      <button className="care-button" onClick={()=>onEnquire(product)}>Enquire about this product <ArrowUpRight size={18}/></button><p className="enquiry-note">For product availability, orders and wholesale enquiries.</p>
      <div className="care-accordion"><button onClick={()=>setExpanded(v=>!v)} aria-expanded={expanded}>Use & care {expanded?<Minus size={18}/>:<Plus size={18}/>}</button>{expanded&&<p>{product.usage || site.products.usage}</p>}</div>
    </div>
  </Wrapper>
}

export function ProductEnquiry({ product, onClose }) {
  const [form,setForm]=useState({name:'',phone:'',email:'',qty:'1',address:''})
  const [state,setState]=useState('idle')
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function submit(e){e.preventDefault();if(state==='sending')return;setState('sending');try{await addOrder({...form,product:product.name,productId:product.id,variant:`${product.variant || ''} · ${product.format || ''}`,type:'product-enquiry'});setState('success')}catch{setState('error')}}
  return <Dialog onClose={onClose} titleId="enquiry-title" className="enquiry-dialog">
    {state==='success'?<div className="form-success" role="status"><span><Check size={30}/></span><h2 id="enquiry-title">Thank you for reaching out.</h2><p>Your product enquiry has been received. Our team will contact you to discuss availability and next steps.</p><button className="care-button" onClick={onClose}>Keep exploring <ArrowRight size={18}/></button></div>:<><p className="eyebrow">LET’S TALK PRODUCTS</p><h2 id="enquiry-title">A little more information.</h2><div className="enquiry-product"><img src={product.images?.[0]||product.img} alt=""/><div><strong>{product.name}</strong><p>{product.variant} · {product.format}</p></div></div>
      <form className="care-form" onSubmit={submit}><div className="form-row"><label>Full name <span>*</span><input name="name" required autoComplete="name" value={form.name} onChange={change}/></label><label>Phone <span>*</span><input name="phone" required type="tel" autoComplete="tel" value={form.phone} onChange={change}/></label></div><div className="form-row"><label>Email<input name="email" type="email" autoComplete="email" value={form.email} onChange={change}/></label><label>Quantity <span>*</span><input name="qty" required type="number" min="1" max="100000" step="1" value={form.qty} onChange={change}/></label></div><label>Location / delivery address <span>*</span><textarea name="address" required rows="2" autoComplete="street-address" value={form.address} onChange={change}/></label>{state==='error'&&<p className="form-error" role="alert">Your enquiry could not be sent. Please try again or email info@joytunchemicals.com.</p>}<button className="care-button" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send product enquiry'}<ArrowUpRight size={18}/></button><p className="enquiry-note">This sends an enquiry. No payment is taken.</p></form></>}
  </Dialog>
}
