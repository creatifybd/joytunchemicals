import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams, useParams, useNavigate } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Search, X, SlidersHorizontal, Droplets, Flower2, Shirt, Sparkles, MapPin, Phone, Mail, Check, Plus, Minus } from 'lucide-react'
import { useData } from '../hooks/useData'
import { getCategory, filterCatalogue } from '../data/catalogue'
import { resolveProductImage, safeUrl, productUrl } from '../data/site'
import { addMessage } from '../lib/firestore'
import Reveal from '../components/public/Reveal'
import Hero from './Hero'
import { ActionLink, PartnerSection } from './Layout'
import { ProductCard, ProductDetails, ProductEnquiry } from './Product'


function ManagedImage({reference,products,...props}){const src=resolveProductImage(reference,products);return src?<img src={src} {...props}/>:null}

export function HomePage(){
  const {products,site}=useData()
  const careCategories=site.categories.filter(c=>c.status==='active')
  const h=site.home
  const brandNames=[...new Set(products.filter(p=>p.status==='active').map(p=>p.brand).filter(Boolean))]
  const featuredSlugs=h.featured
  const featured=featuredSlugs.map(slug=>products.find(p=>(p.slug===slug||p.id===slug)&&p.status==='active')).filter(Boolean)
  const content = <>
    <Hero/>
    {h.showBrands&&<section className="brand-strip shell" aria-label="Joytun product brands"><span>ONE FAMILY.<br/>EVERYDAY CARE.</span><div>{brandNames.map(name=><span key={name}>{name}</span>)}</div></section>}
    {h.showCategories&&<section className="section-space shell" id="care-collections"><Reveal className="section-heading"><div><p className="eyebrow">A PLACE FOR EVERY KIND OF CARE</p><h2 className="preserve-lines">{h.collectionsTitle}</h2></div><p>{h.collectionsText}</p></Reveal>
      <div className="category-grid">{careCategories.map((c,i)=><Reveal key={c.id} delay={i%3*0.06}><Link to={`/products?category=${c.id}`} className={`category-card category-${c.id}`} style={{backgroundColor:c.color}}><div className="category-top"><span>0{i+1} / {c.name}</span><span className="category-arrow"><ArrowUpRight size={22}/></span></div><ManagedImage reference={c.image} products={products} alt={`${c.name} collection`} loading="lazy" decoding="async"/><div className="category-caption"><h3>{c.title}</h3><p>{c.description}</p></div></Link></Reveal>)}</div>
    </section>}
    {h.showFeatured&&<section className="featured-section section-space"><div className="shell"><Reveal className="section-heading"><div><p className="eyebrow">MEET YOUR EVERYDAY ESSENTIALS</p><h2>{h.featuredTitle}</h2></div><Link className="text-link" to="/products">Explore the collection <ArrowUpRight size={19}/></Link></Reveal><div className="product-grid featured-grid">{featured.map((p,i)=><Reveal key={p.id} delay={i*0.05}><ProductCard product={p}/></Reveal>)}</div></div></section>}
    {h.showRitual&&<section className="ritual-section shell section-space"><Reveal className="ritual-art"><span className="eyebrow">N’OLIVE HAND CARE</span><span className="ritual-word" aria-hidden="true">a moment<br/>for you.</span><div className="ritual-product-pair"><ManagedImage reference={h.ritualImages[0]} products={products} alt={products.find(p=>p.slug===h.ritualImages[0])?.name||'Featured care product'} loading="lazy"/><ManagedImage reference={h.ritualImages[1]} products={products} alt={products.find(p=>p.slug===h.ritualImages[1])?.name||'Featured care product'} loading="lazy"/></div><span className="art-footnote">PUMP. REFILL. REPEAT.</span></Reveal><Reveal className="ritual-copy"><p className="eyebrow">SMALL RITUALS. EVERYDAY JOY.</p><h2 className="preserve-lines">{h.ritualTitle}</h2><p>{h.ritualText}</p><p>{h.ritualDetail}</p><ActionLink to={h.ritualLink}>{h.ritualButton}</ActionLink></Reveal></section>}
    {h.showStory&&<section className="about-band"><div className="shell about-band-inner"><Reveal><p className="eyebrow">ROOTED HERE. MADE FOR EVERYDAY.</p><h2 className="preserve-lines">{h.storyTitle}</h2></Reveal><Reveal><p>{h.storyText}</p><Link className="text-link" to="/about">Get to know Joytun <ArrowUpRight size={19}/></Link></Reveal></div><div className="care-values shell"><div><Droplets/><span>Care for your everyday</span></div><div><Shirt/><span>Essentials for every room</span></div><div><Flower2/><span>Fragrances to make your own</span></div></div></section>}
    <PartnerSection/>
  </>
  const keys=['hero','brands','categories','featured','ritual','story','partner']
  return <>{h.sectionOrder.map(key=><div className="home-section" key={key}>{content.props.children[keys.indexOf(key)]}</div>)}</>
}

export function ProductsPage(){
  const {products,site}=useData()
  const careCategories=site.categories.filter(c=>c.status==='active')
  const [params,setParams]=useSearchParams()
  const {slug}=useParams()
  const [order,setOrder]=useState(null)
  const [sort,setSort]=useState('collection')
  const searchRef=useRef(null)
  const category=params.get('category')||'all'
  const query=params.get('q')||''
  const active=products.filter(p=>p.status==='active')
  const selected=active.find(p=>(p.slug||p.id)===(slug||params.get('product')))
  const shown=useMemo(()=>{
    let result=filterCatalogue(products,category,query,careCategories)
    if(sort==='az')result=[...result].sort((a,b)=>`${a.name} ${a.variant}`.localeCompare(`${b.name} ${b.variant}`))
    return result
  },[products,category,query,sort,site.categories])
  function update(key,value){setParams(prev=>{const next=new URLSearchParams(prev);value&&value!=='all'?next.set(key,value):next.delete(key);return next},{replace:true})}
  const select=useCallback(p=>setParams(prev=>{const next=new URLSearchParams(prev);next.set('product',p.slug||p.id);return next}),[setParams])
  const close=useCallback(()=>setParams(prev=>{const next=new URLSearchParams(prev);next.delete('product');return next},{replace:true}),[setParams])
  const closeOrder=useCallback(()=>setOrder(null),[])
  useEffect(()=>{if(params.get('search'))searchRef.current?.focus()},[params.get('search')])
  return <>
    <section className="catalogue-intro shell"><p className="eyebrow">{site.products.eyebrow}</p><div><h1 className="preserve-lines">{site.products.title}</h1><p>{site.products.description}</p></div></section>
    <section className="catalogue-section shell" aria-label="Product catalogue">
      <div className="catalogue-toolbar"><label className="search-field"><Search size={20}/><span className="sr-only">Search products</span><input ref={searchRef} type="search" value={query} placeholder="Find a product, fragrance or format…" onChange={e=>update('q',e.target.value)}/>{query&&<button onClick={()=>update('q','')} aria-label="Clear search"><X size={17}/></button>}</label><label className="sort-field"><SlidersHorizontal size={17}/><span className="sr-only">Sort products</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="collection">Collection order</option><option value="az">Name: A to Z</option></select></label></div>
      <nav className="filter-tabs" aria-label="Filter by care category"><button aria-pressed={category==='all'} onClick={()=>update('category','all')}>All products <span>{active.length}</span></button>{careCategories.map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>update('category',c.id)}>{c.name} <span>{active.filter(p=>getCategory(p,careCategories).id===c.id).length}</span></button>)}</nav>
      <div className="results-line"><p aria-live="polite">{shown.length} {shown.length===1?'product':'products'}{category!=='all'&&` in ${careCategories.find(c=>c.id===category)?.name||category}`}</p><span>{site.products.note}</span></div>
      {shown.length?<div className="product-grid catalogue-grid">{shown.map(p=><ProductCard key={p.id} product={p} onSelect={select}/>)}</div>:<div className="empty-results"><Search size={34}/><h2>No products found.</h2><p>Try another name, fragrance or care category.</p><button className="care-button" onClick={()=>setParams({})}>Show all products <ArrowRight size={18}/></button></div>}
    </section>
    <PartnerSection/>
    {selected&&!order&&<ProductDetails key={selected.id} product={selected} products={active} onClose={close} onSelect={select} onEnquire={p=>{close();setOrder(p)}}/>}
    {order&&<ProductEnquiry product={order} onClose={closeOrder}/>}
  </>
}

export function AboutPage(){
  const {site,products}=useData();const a=site.about
  const brandNames=[...new Set(products.filter(p=>p.status==='active').map(p=>p.brand).filter(Boolean))]
  return <>
    <section className="story-intro shell"><p className="eyebrow">{a.eyebrow}</p><h1 className="preserve-lines">{a.title}</h1><div className="story-lede"><span className="story-symbol"><Flower2 size={58} strokeWidth={1}/></span><p>{a.intro}</p></div></section>
    <section className="story-visual shell"><div className="story-image-composition"><span aria-hidden="true">{a.artTitle}</span>{a.images.slice(0,4).map((slug,i)=><ManagedImage key={slug} className={`story-product-${i}`} reference={slug} products={products} alt={slug.replaceAll('-',' ')} loading="lazy"/>)}</div><div className="story-caption"><p>THE JOYTUN FAMILY</p><p>Home care. Personal care. Everyday care.</p></div></section>
    <section className="story-details shell section-space"><Reveal><p className="eyebrow">OUR STORY</p><h2 className="preserve-lines">{a.storyTitle}</h2></Reveal><Reveal><p className="large-paragraph">{a.lead}</p><p>{a.paragraph1}</p><p>{a.paragraph2}</p><ActionLink to="/products">Meet our products</ActionLink></Reveal></section>
    {a.showBrands&&<section className="brand-family"><div className="shell"><p className="eyebrow">OUR BRANDS. ONE FAMILY.</p><h2 className="preserve-lines">{a.brandsTitle}</h2><div className="brand-family-grid">{brandNames.map((brand,i)=><Link to={`/products?q=${encodeURIComponent(brand)}`} key={brand}><small>0{i+1}</small><span>{brand}</span><ArrowUpRight size={24}/></Link>)}</div></div></section>}
    {a.showPurpose&&<section className="purpose-section shell section-space"><Reveal><p className="eyebrow">WHAT WE’RE HERE FOR</p><h2 className="preserve-lines">{a.purposeTitle}</h2></Reveal><div className="purpose-grid">{site.values.map((v,i)=><Reveal key={i}><span>{String(i+1).padStart(2,'0')}</span><h3>{v.title}</h3><p>{v.text}</p></Reveal>)}</div></section>}
    <PartnerSection/>
  </>
}

export function ContactPage(){
  const {site}=useData();const c=site.contact,b=site.brand
  const [params]=useSearchParams()
  const [form,setForm]=useState({name:'',phone:'',email:'',subject:params.get('subject')==='Distribution'?'Distribution partnership':'Product enquiry',msg:''})
  const [state,setState]=useState('idle')
  const [faq,setFaq]=useState(null)
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function submit(e){e.preventDefault();if(state==='sending')return;setState('sending');try{await addMessage(form);setState('success')}catch{setState('error')}}
  return <>
    <section className="contact-intro shell"><p className="eyebrow">{c.eyebrow}</p><h1 className="preserve-lines">{c.title}</h1><p>{c.description}</p></section>
    <section className="contact-grid shell"><div className="contact-information"><div className="contact-direct"><a href={`mailto:${b.email}`}><Mail size={21}/><div><small>WRITE TO US</small><strong>{b.email}</strong></div><ArrowUpRight size={20}/></a><a href={`tel:${b.phone.replace(/[^+\d]/g,'')}`}><Phone size={21}/><div><small>GIVE US A CALL</small><strong>{b.phone}</strong></div><ArrowUpRight size={20}/></a></div><div className="address-block"><MapPin size={22}/><div><h2>{c.locationLabel}</h2><p>{b.location}</p></div></div><div className="contact-message-note"><Flower2 size={27}/><p>{c.note}</p></div></div>
      <div className="contact-form-panel">{state==='success'?<div className="form-success" role="status"><span><Check size={30}/></span><h2>Message received.</h2><p>Thank you, {form.name}. Our team will get back to you using the contact details you provided.</p><button className="care-button" onClick={()=>{setState('idle');setForm({...form,msg:''})}}>Send another message <ArrowRight size={18}/></button></div>:<><p className="eyebrow">DROP US A NOTE</p><h2>{c.formTitle}</h2><form className="care-form" onSubmit={submit}><div className="form-row"><label>Your name <span>*</span><input name="name" required autoComplete="name" value={form.name} onChange={change} placeholder="Full name"/></label><label>Phone number <span>*</span><input name="phone" required type="tel" autoComplete="tel" value={form.phone} onChange={change} placeholder="Your phone number"/></label></div><label>Email address <span>*</span><input name="email" required type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@example.com"/></label><label>I’m interested in<select name="subject" value={form.subject} onChange={change}><option>Product enquiry</option><option>Distribution partnership</option><option>Retail / wholesale</option><option>General enquiry</option></select></label><label>Your message <span>*</span><textarea name="msg" required rows="4" value={form.msg} onChange={change} placeholder="Tell us a little about what you have in mind…"/></label>{state==='error'&&<p className="form-error" role="alert">We couldn’t send your message. Please try again or contact us by email.</p>}<button className="care-button" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send your message'}<ArrowUpRight size={19}/></button><p className="enquiry-note">We’ll use these details to respond to your enquiry.</p></form></>}</div>
    </section>
    <section className="faq-section shell section-space"><div><p className="eyebrow">A FEW HELPFUL ANSWERS</p><h2>{c.faqTitle}</h2></div><div>{site.faqs.map(({question:q,answer:a},i)=><div className="care-accordion" key={q}><button aria-expanded={faq===i} onClick={()=>setFaq(faq===i?null:i)}>{q}{faq===i?<Minus size={20}/>:<Plus size={20}/>}</button>{faq===i&&<p>{a}</p>}</div>)}</div></section>
  </>
}

export function ProductPage(){
  const {slug}=useParams(),navigate=useNavigate();const {products,settingsLoaded}=useData();const [enquiry,setEnquiry]=useState(false)
  const product=products.find(p=>(p.slug||p.id)===slug&&p.status==='active')
  const close=useCallback(()=>setEnquiry(false),[])
  if(!product&&!settingsLoaded)return <div className="shell section-space" role="status">Loading product…</div>
  if(!product)return <NotFoundPage/>
  return <><div className="shell product-breadcrumb"><Link to="/">Home</Link><span>/</span><Link to="/products">Our products</Link><span>/</span><span>{product.name}</span></div><div className="shell"><ProductDetails key={product.id} standalone product={product} products={products} onSelect={p=>navigate(productUrl(p))} onEnquire={()=>setEnquiry(true)}/></div><PartnerSection/>{enquiry&&<ProductEnquiry product={product} onClose={close}/>}</>
}
export function NotFoundPage(){return <section className="shell section-space not-found"><p className="eyebrow">PAGE NOT FOUND · 404</p><h1>A fresh direction.</h1><p>This page or product is no longer available. Explore our current collection.</p><ActionLink to="/products">Explore products</ActionLink></section>}
