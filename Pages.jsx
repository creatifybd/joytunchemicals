import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Search, X, SlidersHorizontal, Droplets, Flower2, Shirt, Sparkles, MapPin, Phone, Mail, Check, Plus, Minus } from 'lucide-react'
import { useData } from '../hooks/useData'
import { careCategories, companyDetails, getCategory, filterCatalogue } from '../data/catalogue'
import { addMessage } from '../lib/firestore'
import Reveal from '../components/public/Reveal'
import Hero from './Hero'
import { ActionLink, PartnerSection } from './Layout'
import { ProductCard, ProductDetails, ProductEnquiry } from './Product'

const imagePath=slug=>`/images/products/${slug}.png`
const brandNames=['Aro','Sharo','Rio','n’Olive','Vix','Layzen','Mr. Glasso','T-Flush']

export function HomePage(){
  const {products}=useData()
  const featuredSlugs=['nolive-apple-green-pump','vix-orange-bottle','aro-detergent','mr-glasso-spray']
  const featured=featuredSlugs.map(slug=>products.find(p=>p.slug===slug&&p.status==='active')).filter(Boolean)
  return <>
    <Hero/>
    <section className="brand-strip shell" aria-label="Joytun product brands"><span>ONE FAMILY.<br/>EVERYDAY CARE.</span><div>{brandNames.map(name=><span key={name}>{name}</span>)}</div></section>
    <section className="section-space shell" id="care-collections"><Reveal className="section-heading"><div><p className="eyebrow">A PLACE FOR EVERY KIND OF CARE</p><h2>For all the things<br/>you call home.</h2></div><p>Fresh clothes. Clean dishes. Little hand-washing rituals.<br className="desktop-only"/>Find the right care for every part of your day.</p></Reveal>
      <div className="category-grid">{careCategories.map((c,i)=><Reveal key={c.id} delay={i%3*0.06}><Link to={`/products?category=${c.id}`} className={`category-card category-${c.id}`} style={{backgroundColor:c.color}}><div className="category-top"><span>0{i+1} / {c.name}</span><span className="category-arrow"><ArrowUpRight size={22}/></span></div><img src={imagePath(c.image)} alt={`${c.name} collection`} loading="lazy" decoding="async"/><div className="category-caption"><h3>{c.title}</h3><p>{c.description}</p></div></Link></Reveal>)}</div>
    </section>
    <section className="featured-section section-space"><div className="shell"><Reveal className="section-heading"><div><p className="eyebrow">MEET YOUR EVERYDAY ESSENTIALS</p><h2>Good care starts here.</h2></div><Link className="text-link" to="/products">Explore the collection <ArrowUpRight size={19}/></Link></Reveal><div className="product-grid featured-grid">{featured.map((p,i)=><Reveal key={p.id} delay={i*0.05}><ProductCard product={p}/></Reveal>)}</div></div></section>
    <section className="ritual-section shell section-space"><Reveal className="ritual-art"><span className="eyebrow">N’OLIVE HAND CARE</span><span className="ritual-word" aria-hidden="true">a moment<br/>for you.</span><div className="ritual-product-pair"><img src={imagePath('nolive-lavender-refill')} alt="n’Olive Lavender hand wash refill pouch" loading="lazy"/><img src={imagePath('nolive-lavender-pump')} alt="n’Olive Lavender hand wash pump bottle" loading="lazy"/></div><span className="art-footnote">PUMP. REFILL. REPEAT.</span></Reveal><Reveal className="ritual-copy"><p className="eyebrow">SMALL RITUALS. EVERYDAY JOY.</p><h2>Make room<br/>for a little<br/><span>freshness.</span></h2><p>A familiar fragrance. A freshly washed pair of hands. Sometimes, it’s the smallest moments that make the day feel better.</p><p>Meet n’Olive in Apple Green, Lavender, Ocean Blue and Gold Fresh. Find your favourite pump bottle and its matching refill.</p><ActionLink to="/products?category=hand">Discover n’Olive</ActionLink></Reveal></section>
    <section className="about-band"><div className="shell about-band-inner"><Reveal><p className="eyebrow">ROOTED HERE. MADE FOR EVERYDAY.</p><h2>From Bangladesh,<br/>with care.</h2></Reveal><Reveal><p>We’re Joytun Chemical Industries OPC. Our home and personal care collection brings together the essentials that belong in everyday life, from the laundry room to the kitchen sink.</p><Link className="text-link" to="/about">Get to know Joytun <ArrowUpRight size={19}/></Link></Reveal></div><div className="care-values shell"><div><Droplets/><span>Care for your everyday</span></div><div><Shirt/><span>Essentials for every room</span></div><div><Flower2/><span>Fragrances to make your own</span></div></div></section>
    <PartnerSection/>
  </>
}

export function ProductsPage(){
  const {products}=useData()
  const [params,setParams]=useSearchParams()
  const [order,setOrder]=useState(null)
  const [sort,setSort]=useState('collection')
  const searchRef=useRef(null)
  const category=params.get('category')||'all'
  const query=params.get('q')||''
  const active=products.filter(p=>p.status==='active')
  const selected=active.find(p=>(p.slug||p.id)===params.get('product'))
  const shown=useMemo(()=>{
    let result=filterCatalogue(products,category,query)
    if(sort==='az')result=[...result].sort((a,b)=>`${a.name} ${a.variant}`.localeCompare(`${b.name} ${b.variant}`))
    return result
  },[products,category,query,sort])
  function update(key,value){setParams(prev=>{const next=new URLSearchParams(prev);value&&value!=='all'?next.set(key,value):next.delete(key);return next},{replace:true})}
  const select=useCallback(p=>setParams(prev=>{const next=new URLSearchParams(prev);next.set('product',p.slug||p.id);return next}),[setParams])
  const close=useCallback(()=>setParams(prev=>{const next=new URLSearchParams(prev);next.delete('product');return next},{replace:true}),[setParams])
  const closeOrder=useCallback(()=>setOrder(null),[])
  useEffect(()=>{if(params.get('search'))searchRef.current?.focus()},[params.get('search')])
  return <>
    <section className="catalogue-intro shell"><p className="eyebrow">THE JOYTUN COLLECTION</p><div><h1>Everyday care.<br/><span>Find your kind.</span></h1><p>Explore a world of fresh possibilities.<br/>Thoughtful essentials for your home, your hands<br className="desktop-only"/> and everything in between.</p></div></section>
    <section className="catalogue-section shell" aria-label="Product catalogue">
      <div className="catalogue-toolbar"><label className="search-field"><Search size={20}/><span className="sr-only">Search products</span><input ref={searchRef} type="search" value={query} placeholder="Find a product, fragrance or format…" onChange={e=>update('q',e.target.value)}/>{query&&<button onClick={()=>update('q','')} aria-label="Clear search"><X size={17}/></button>}</label><label className="sort-field"><SlidersHorizontal size={17}/><span className="sr-only">Sort products</span><select value={sort} onChange={e=>setSort(e.target.value)}><option value="collection">Collection order</option><option value="az">Name: A to Z</option></select></label></div>
      <nav className="filter-tabs" aria-label="Filter by care category"><button aria-pressed={category==='all'} onClick={()=>update('category','all')}>All products <span>{active.length}</span></button>{careCategories.map(c=><button key={c.id} aria-pressed={category===c.id} onClick={()=>update('category',c.id)}>{c.name} <span>{active.filter(p=>getCategory(p).id===c.id).length}</span></button>)}</nav>
      <div className="results-line"><p aria-live="polite">{shown.length} {shown.length===1?'product':'products'}{category!=='all'&&` in ${careCategories.find(c=>c.id===category)?.name||category}`}</p><span>Something for every part of your day.</span></div>
      {shown.length?<div className="product-grid catalogue-grid">{shown.map(p=><ProductCard key={p.id} product={p} onSelect={select}/>)}</div>:<div className="empty-results"><Search size={34}/><h2>No products found.</h2><p>Try another name, fragrance or care category.</p><button className="care-button" onClick={()=>setParams({})}>Show all products <ArrowRight size={18}/></button></div>}
    </section>
    <PartnerSection/>
    {selected&&!order&&<ProductDetails key={selected.id} product={selected} products={active} onClose={close} onSelect={select} onEnquire={p=>{close();setOrder(p)}}/>}
    {order&&<ProductEnquiry product={order} onClose={closeOrder}/>}
  </>
}

export function AboutPage(){
  return <>
    <section className="story-intro shell"><p className="eyebrow">THIS IS JOYTUN</p><h1>Rooted in Bangladesh.<br/><span>Part of your everyday.</span></h1><div className="story-lede"><span className="story-symbol"><Flower2 size={58} strokeWidth={1}/></span><p>We believe care belongs in the everyday. In the clothes you reach for, the meals you share, and the places you call your own.</p></div></section>
    <section className="story-visual shell"><div className="story-image-composition"><span aria-hidden="true">care comes<br/>in many forms.</span>{['aro-detergent','nolive-apple-green-pump','vix-orange-bottle','layzen-lemon'].map((slug,i)=><img key={slug} className={`story-product-${i}`} src={imagePath(slug)} alt={slug.replaceAll('-',' ')} loading="lazy"/>)}</div><div className="story-caption"><p>THE JOYTUN FAMILY</p><p>Home care. Personal care. Everyday care.</p></div></section>
    <section className="story-details shell section-space"><Reveal><p className="eyebrow">OUR STORY</p><h2>A home feels better<br/>with a little care.</h2></Reveal><Reveal><p className="large-paragraph">Joytun Chemical Industries OPC is a Bangladesh-based home and personal care company.</p><p>Our collection brings together laundry detergents, hand washes, dish-care essentials, floor cleaners, glass cleaners and toilet care. Different products, with a place in the same everyday routine.</p><p>From our factory in Kanchpur, Sonargaon, Narayanganj, to the homes and businesses we serve, we’re building a family of products around the needs of everyday living.</p><ActionLink to="/products">Meet our products</ActionLink></Reveal></section>
    <section className="brand-family"><div className="shell"><p className="eyebrow">EIGHT BRANDS. ONE FAMILY.</p><h2>Meet the names<br/>behind the care.</h2><div className="brand-family-grid">{brandNames.map((brand,i)=><Link to={`/products?q=${encodeURIComponent(brand)}`} key={brand}><small>0{i+1}</small><span>{brand}</span><ArrowUpRight size={24}/></Link>)}</div></div></section>
    <section className="purpose-section shell section-space"><Reveal><p className="eyebrow">WHAT WE’RE HERE FOR</p><h2>Everyday essentials.<br/>A shared purpose.</h2></Reveal><div className="purpose-grid"><Reveal><span>01</span><h3>Care that fits your life.</h3><p>Build a routine around the products, fragrances and formats that work for your home.</p></Reveal><Reveal><span>02</span><h3>More ways to choose.</h3><p>Discover individual brands for different care needs, with bottle, pouch, spray and bar formats across the collection.</p></Reveal><Reveal><span>03</span><h3>Closer to our communities.</h3><p>Based in Bangladesh, we welcome conversations with retailers and distribution partners who share our interest in everyday care.</p></Reveal></div></section>
    <PartnerSection/>
  </>
}

const faqs=[['How can I order Joytun products?','Open a product in our collection and select “Enquire about this product”. Share your contact details and quantity. Our team will discuss availability and order arrangements with you.'],['Can I become a distribution partner?','Yes, we welcome distribution and retail enquiries. Select “Distribution partnership” in the form and tell us your business name and area. Our team will discuss the next steps with you.'],['Where can I find product usage information?','Please refer to the directions and precautions on each product label. If you need more information about a particular product, contact us with the product name and variant.']]
export function ContactPage(){
  const [params]=useSearchParams()
  const [form,setForm]=useState({name:'',phone:'',email:'',subject:params.get('subject')==='Distribution'?'Distribution partnership':'Product enquiry',msg:''})
  const [state,setState]=useState('idle')
  const [faq,setFaq]=useState(null)
  const change=e=>setForm({...form,[e.target.name]:e.target.value})
  async function submit(e){e.preventDefault();if(state==='sending')return;setState('sending');try{await addMessage(form);setState('success')}catch{setState('error')}}
  return <>
    <section className="contact-intro shell"><p className="eyebrow">GOOD CONVERSATIONS START HERE</p><h1>Let’s talk<br/><span>everyday care.</span></h1><p>Questions about a product? A new partnership in mind?<br/>We’d love to hear from you.</p></section>
    <section className="contact-grid shell"><div className="contact-information"><div className="contact-direct"><a href={`mailto:${companyDetails.email}`}><Mail size={21}/><div><small>WRITE TO US</small><strong>{companyDetails.email}</strong></div><ArrowUpRight size={20}/></a><a href="tel:+8801799996410"><Phone size={21}/><div><small>GIVE US A CALL</small><strong>{companyDetails.phone}</strong></div><ArrowUpRight size={20}/></a></div><div className="address-block"><MapPin size={22}/><div><h2>Head office</h2><p>{companyDetails.office}</p></div></div><div className="address-block"><MapPin size={22}/><div><h2>Our factory</h2><p>{companyDetails.factory}</p></div></div><div className="contact-message-note"><Flower2 size={27}/><p>From your home to your business,<br/>we’re here to help you find the right care.</p></div></div>
      <div className="contact-form-panel">{state==='success'?<div className="form-success" role="status"><span><Check size={30}/></span><h2>Message received.</h2><p>Thank you, {form.name}. Our team will get back to you using the contact details you provided.</p><button className="care-button" onClick={()=>{setState('idle');setForm({...form,msg:''})}}>Send another message <ArrowRight size={18}/></button></div>:<><p className="eyebrow">DROP US A NOTE</p><h2>How can we help?</h2><form className="care-form" onSubmit={submit}><div className="form-row"><label>Your name <span>*</span><input name="name" required autoComplete="name" value={form.name} onChange={change} placeholder="Full name"/></label><label>Phone number <span>*</span><input name="phone" required type="tel" autoComplete="tel" value={form.phone} onChange={change} placeholder="Your phone number"/></label></div><label>Email address <span>*</span><input name="email" required type="email" autoComplete="email" value={form.email} onChange={change} placeholder="you@example.com"/></label><label>I’m interested in<select name="subject" value={form.subject} onChange={change}><option>Product enquiry</option><option>Distribution partnership</option><option>Retail / wholesale</option><option>General enquiry</option></select></label><label>Your message <span>*</span><textarea name="msg" required rows="4" value={form.msg} onChange={change} placeholder="Tell us a little about what you have in mind…"/></label>{state==='error'&&<p className="form-error" role="alert">We couldn’t send your message. Please try again or contact us by email.</p>}<button className="care-button" disabled={state==='sending'}>{state==='sending'?'Sending…':'Send your message'}<ArrowUpRight size={19}/></button><p className="enquiry-note">We’ll use these details to respond to your enquiry.</p></form></>}</div>
    </section>
    <section className="faq-section shell section-space"><div><p className="eyebrow">A FEW HELPFUL ANSWERS</p><h2>Before you ask.</h2></div><div>{faqs.map(([q,a],i)=><div className="care-accordion" key={q}><button aria-expanded={faq===i} onClick={()=>setFaq(faq===i?null:i)}>{q}{faq===i?<Minus size={20}/>:<Plus size={20}/>}</button>{faq===i&&<p>{a}</p>}</div>)}</div></section>
  </>
}
