import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Menu, X, Search, Mail, ChevronDown } from 'lucide-react'
import { MotionConfig } from 'framer-motion'
import { ToastProvider } from '../components/shared/Toast'
import { useData } from '../hooks/useData'
import { safeUrl } from '../data/site'
import SEO from './SEO'
import '../site.css'
import '../corporate.css'
export function ActionLink({to,children,light=false,className=''}){return <Link className={`care-button ${light?'button-light':''} ${className}`} to={safeUrl(to)}>{children}<ArrowUpRight size={19}/></Link>}
export function PartnerSection(){const {site}=useData();const p=site.partner;if(!p.enabled)return null;return <section className="partner-section shell"><div><p className="eyebrow">{p.eyebrow}</p><h2 className="preserve-lines">{p.title}</h2></div><div><p>{p.description}</p><ActionLink to={p.url} light>{p.button}</ActionLink></div></section>}
export default function SiteLayout(){
  const {site}=useData();const b=site.brand,a=site.appearance
  const categories=site.categories.filter(c=>c.status==='active')
  const [menu,setMenu]=useState(false),[categoriesOpen,setCategoriesOpen]=useState(false)
  const {pathname}=useLocation()
  useEffect(()=>{setMenu(false);setCategoriesOpen(false);window.scrollTo({top:0,behavior:'instant'})},[pathname])
  useEffect(()=>{const close=e=>{if(e.key==='Escape'){setMenu(false);setCategoriesOpen(false)}};document.addEventListener('keydown',close);return()=>document.removeEventListener('keydown',close)},[])
  useEffect(()=>{if(!menu)return;const prev=document.body.style.overflow;document.body.style.overflow='hidden';return()=>{document.body.style.overflow=prev}},[menu])
  const family=name=>name==='Metropolis'?"'Metropolis',sans-serif":`'${name} Variable',sans-serif`
  const style={'--ink':a.ink,'--green':a.green,'--lime':a.lime,'--paper':a.paper,'--heading-font':family(a.headingFont),'--body-font':family(a.bodyFont),'--corner':`${a.radius}px`}
  return <MotionConfig reducedMotion={a.motion?'user':'always'}><ToastProvider><div className={`public-site ${a.motion?'':'motion-off'}`} style={style}>
    <SEO/>{new URLSearchParams(window.location.search).has('preview')&&<div className="preview-banner">Draft preview · Changes are not published. <a href="/admin/content">Return to website studio</a></div>}<a className="skip-link" href="#main-content">Skip to content</a>
    <div className="utility-bar"><span>{b.announcement}</span><Link to={safeUrl(site.partner.url)}>{site.partner.button}<ArrowUpRight size={13}/></Link></div>
    <header className="site-header"><div className="header-inner shell"><Link to="/" className="brand-lockup" aria-label="Joytun home"><img src={safeUrl(b.logo)} width="170" height="52" alt={b.shortName}/><span>{b.subtitle}</span></Link>
    <nav className="desktop-nav" aria-label="Main navigation">{site.navigation.map(n=><div className="nav-entry" key={n.url}><NavLink to={safeUrl(n.url)} end={n.url==='/'}>{n.label}</NavLink>{n.url==='/products'&&<button className="nav-category-toggle" aria-label="Show care categories" aria-expanded={categoriesOpen} onClick={()=>setCategoriesOpen(v=>!v)}><ChevronDown size={16}/></button>}</div>)}</nav>
    <div className="header-actions"><Link className="icon-button" to="/products?search=1" aria-label="Search products"><Search size={20}/></Link><ActionLink to="/contact" className="header-cta">Let’s connect</ActionLink><button className="icon-button mobile-toggle" aria-label={menu?'Close menu':'Open menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={()=>setMenu(v=>!v)}>{menu?<X/>:<Menu/>}</button></div></div>
    {categoriesOpen&&<nav className="category-menu shell" aria-label="Care categories">{categories.map(c=><Link onClick={()=>setCategoriesOpen(false)} to={`/products?category=${c.id}`} key={c.id}>{c.name}<ArrowUpRight size={17}/></Link>)}</nav>}
    {menu&&<nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{site.navigation.map(n=><Link key={n.url} to={safeUrl(n.url)} onClick={()=>setMenu(false)}>{n.label}<ArrowUpRight/></Link>)}<p>{b.announcement}</p></nav>}</header>
    <main id="main-content"><div className="page-enter" key={pathname}><Outlet/></div></main>
    <footer className="site-footer"><div className="footer-top shell"><div className="footer-brand"><div className="footer-logo"><img src={safeUrl(b.logo)} alt={b.shortName} width="170" height="52"/></div><p className="preserve-lines">{b.footerText}</p><a href={`mailto:${b.email}`} className="footer-email">{b.email}<ArrowUpRight size={18}/></a></div><div><h3>Explore</h3>{site.navigation.map(n=><Link key={n.url} to={safeUrl(n.url)}>{n.label}</Link>)}<Link to={safeUrl(site.partner.url)}>Partner with us</Link></div><div><h3>Everyday care</h3>{categories.map(c=><Link to={`/products?category=${c.id}`} key={c.id}>{c.name}</Link>)}</div><div className="footer-address"><h3>Our location</h3><p>{b.location}</p><a href={`tel:${b.phone.replace(/[^+\d]/g,'')}`}>{b.phone}</a><Link to="/contact">Contact details <ArrowRight size={15}/></Link></div></div>
    <div className="footer-bottom shell"><p>© {new Date().getFullYear()} {b.name}.</p><div><span>{b.footerNote}</span><Link to="/admin/login">Admin</Link></div></div></footer><Link className="contact-float" to="/contact" aria-label="Contact Joytun"><Mail size={21}/></Link>
  </div></ToastProvider></MotionConfig>
}
