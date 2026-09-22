import { useEffect, useState } from 'react'
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom'
import { ArrowUpRight, ArrowRight, Menu, X, Search, Mail, ChevronDown } from 'lucide-react'
import { MotionConfig } from 'framer-motion'
import { ToastProvider } from '../components/shared/Toast'
import { careCategories, companyDetails } from '../data/catalogue'
import '../site.css'

export function ActionLink({ to, children, light = false, className = '' }) {
  return <Link className={`care-button ${light ? 'button-light' : ''} ${className}`} to={to}>{children}<ArrowUpRight size={19}/></Link>
}

export function PartnerSection() {
  return <section className="partner-section shell">
    <div><p className="eyebrow">GROW WITH JOYTUN</p><h2>Good things happen<br/>when we care together.</h2></div>
    <div><p>Bring the Joytun collection to your customers. Let’s talk about retail, distribution and business enquiries.</p><ActionLink to="/contact?subject=Distribution" light>Let’s work together</ActionLink></div>
  </section>
}

export default function SiteLayout() {
  const [menu, setMenu] = useState(false)
  const [categoriesOpen, setCategoriesOpen] = useState(false)
  const { pathname } = useLocation()
  useEffect(() => {
    setMenu(false); setCategoriesOpen(false)
    window.scrollTo({ top: 0, behavior: 'instant' })
    const names = { '/': 'Home & Personal Care', '/products': 'Our Products', '/about': 'Our Story', '/contact': 'Contact & Distribution' }
    document.title = `${names[pathname] || 'Joytun'} | Joytun Chemical Industries OPC`
  }, [pathname])
  useEffect(() => {
    const close = e => { if (e.key === 'Escape') { setMenu(false); setCategoriesOpen(false) } }
    document.addEventListener('keydown', close)
    return () => document.removeEventListener('keydown', close)
  }, [])

  return <MotionConfig reducedMotion="user"><ToastProvider><div className="public-site">
    <a className="skip-link" href="#main-content">Skip to content</a>
    <div className="utility-bar"><span>Thoughtful care for everyday living.</span><Link to="/contact?subject=Distribution">Become a distribution partner <ArrowUpRight size={13}/></Link></div>
    <header className="site-header">
      <div className="header-inner shell">
        <Link to="/" className="brand-lockup" aria-label="Joytun home"><img src="/images/brand/joytun-logo.png" width="170" height="52" alt="Joytun"/><span>CHEMICAL INDUSTRIES OPC</span></Link>
        <nav className="desktop-nav" aria-label="Main navigation">
          <NavLink to="/" end>Home</NavLink>
          <div className="nav-products"><NavLink to="/products">Our products</NavLink><button aria-label="Show care categories" aria-expanded={categoriesOpen} onClick={() => setCategoriesOpen(v => !v)}><ChevronDown size={15}/></button></div>
          <NavLink to="/about">Our story</NavLink><NavLink to="/contact">Contact</NavLink>
        </nav>
        <div className="header-actions"><Link className="icon-button" to="/products?search=1" aria-label="Search products"><Search size={20}/></Link><ActionLink to="/contact" className="header-cta">Let’s connect</ActionLink><button className="icon-button mobile-toggle" aria-label={menu ? 'Close menu' : 'Open menu'} aria-expanded={menu} aria-controls="mobile-navigation" onClick={() => setMenu(v => !v)}>{menu ? <X/> : <Menu/>}</button></div>
      </div>
      {categoriesOpen && <nav className="category-menu shell" aria-label="Care categories">{careCategories.map(c => <Link onClick={() => setCategoriesOpen(false)} to={`/products?category=${c.id}`} key={c.id}>{c.name}<ArrowUpRight size={17}/></Link>)}</nav>}
      {menu && <nav className="mobile-nav" id="mobile-navigation" aria-label="Mobile navigation">{[['/', 'Home'], ['/products', 'Our products'], ['/about', 'Our story'], ['/contact', 'Contact']].map(([to,label]) => <Link key={to} to={to} onClick={() => setMenu(false)}>{label}<ArrowUpRight/></Link>)}<p>CARE FOR YOUR HOME. CARE FOR YOUR EVERYDAY.</p></nav>}
    </header>
    <main id="main-content"><Outlet/></main>
    <footer className="site-footer">
      <div className="footer-top shell"><div className="footer-brand"><div className="footer-logo"><img src="/images/brand/joytun-logo.png" alt="Joytun" width="170" height="52"/></div><p>A little care makes a difference.<br/>For your home. For your everyday.</p><a href={`mailto:${companyDetails.email}`} className="footer-email">{companyDetails.email}<ArrowUpRight size={18}/></a></div>
        <div><h3>Explore</h3><Link to="/products">Our products</Link><Link to="/about">Our story</Link><Link to="/contact">Contact us</Link><Link to="/contact?subject=Distribution">Partner with us</Link></div>
        <div><h3>Everyday care</h3>{careCategories.map(c => <Link to={`/products?category=${c.id}`} key={c.id}>{c.name}</Link>)}</div>
        <div className="footer-address"><h3>Made in Bangladesh</h3><p>Kanchpur, Sonargaon,<br/>Narayanganj, Bangladesh.</p><a href="tel:+8801799996410">{companyDetails.phone}</a><Link to="/contact">Office & factory details <ArrowRight size={15}/></Link></div>
      </div>
      <div className="footer-bottom shell"><p>© {new Date().getFullYear()} Joytun Chemical Industries OPC.</p><div><span>Home & personal care, made in Bangladesh.</span><Link to="/admin/login">Admin</Link></div></div>
    </footer>
    <Link className="contact-float" to="/contact" aria-label="Contact Joytun"><Mail size={21}/></Link>
  </div></ToastProvider></MotionConfig>
}
