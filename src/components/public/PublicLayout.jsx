import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, LayoutDashboard } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { ToastProvider } from '../shared/Toast'
import Footer from './Footer'
import Ticker from './Ticker'

export default function PublicLayout() {
  const { company, contact, theme } = useData()
  const { isAdmin } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/products', label: 'Products' },
    { path: '/about', label: 'About' },
    { path: '/contact', label: 'Contact' },
  ]

  return (
    <ToastProvider>
      <div className="min-h-screen flex flex-col">
        {/* Fixed Navbar */}
        {/* Compute navbar style from theme */}
        {(() => {
          const ns = theme?.navbarStyle || 'white'
          const navBg = ns === 'navy' ? theme.navy
            : ns === 'primary' ? theme.blue
            : ns === 'custom' ? (theme.navbarCustomBg || '#ffffff')
            : null // white = CSS handles it
          const navText = ns === 'white' ? null : (
            ns === 'custom' ? (theme.navbarCustomText || '#060f2e') : '#ffffff'
          )
          const isDark = ns !== 'white'
          return null // just computing, rendered below
        })()}
        <header className="fixed top-0 left-0 right-0 z-[1000] backdrop-blur-2xl border-b"
          style={{
            backgroundColor: (() => {
              const ns = theme?.navbarStyle || 'white'
              if (ns === 'navy') return theme.navy + 'ee'
              if (ns === 'primary') return theme.blue + 'ee'
              if (ns === 'custom') return (theme.navbarCustomBg || '#ffffff') + 'ee'
              return 'rgba(255,255,255,0.85)'
            })(),
            borderColor: (() => {
              const ns = theme?.navbarStyle || 'white'
              return ns === 'white' ? '#f3f4f6' : 'rgba(255,255,255,0.1)'
            })()
          }}>
          <div className="max-w-7xl mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              {company.logo
                ? <img src={company.logo} alt="Logo" className="h-10 w-auto object-contain group-hover:scale-105 transition-transform" style={{ background: "transparent" }} />
                : <div className="w-11 h-11 bg-dark text-accent rounded-2xl flex items-center justify-center font-outfit text-xl font-black shadow-lg group-hover:scale-105 transition-transform"
                    style={{ backgroundColor: 'var(--color-dark)', color: 'var(--color-accent)' }}>
                    {company.name?.charAt(0)}
                  </div>
              }
              <div>
                <div className="font-outfit text-lg font-black uppercase tracking-tight leading-none mb-0.5"
                  style={{ color: (() => { const ns = theme?.navbarStyle || 'white'; return ns === 'white' ? 'var(--color-dark)' : '#ffffff' })() }}>
                  {company.name}
                </div>
                <div className="text-[9px] font-black uppercase tracking-[3px] leading-none"
                  style={{ color: 'var(--color-accent)' }}>
                  {company.sub}
                </div>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex items-center gap-10">
              {navLinks.map(l => (
                <Link
                  key={l.path}
                  to={l.path}
                  className={`text-sm font-black uppercase tracking-[2px] transition-colors relative py-1`}
                  style={(() => {
                    const ns = theme?.navbarStyle || 'white'
                    const isDark = ns !== 'white'
                    const customText = theme?.navbarCustomText || '#060f2e'
                    if (location.pathname === l.path) return { color: isDark ? 'var(--color-accent)' : 'var(--color-primary)' }
                    return { color: isDark ? 'rgba(255,255,255,0.6)' : '#9ca3af' }
                  })()}
                >
                  {l.label}
                  {location.pathname === l.path && (
                    <motion.div layoutId="navline"
                      className="absolute -bottom-0.5 left-0 right-0 h-0.5 rounded-full"
                      style={{ backgroundColor: 'var(--color-accent)' }}
                    />
                  )}
                </Link>
              ))}
            </nav>

            <div className="flex items-center gap-4">
              <div className="hidden lg:flex flex-col items-end">
                <div className="text-[10px] font-black uppercase tracking-wider"
                  style={{ color: (theme?.navbarStyle || 'white') === 'white' ? '#d1d5db' : 'rgba(255,255,255,0.5)' }}>Support</div>
                <div className="text-sm font-bold"
                  style={{ color: (theme?.navbarStyle || 'white') === 'white' ? 'var(--color-dark)' : '#ffffff' }}>{contact.phone}</div>
              </div>
              <button onClick={() => setMenuOpen(!menuOpen)} className="md:hidden p-2 text-dark">
                {menuOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
              <button
                onClick={() => navigate(isAdmin ? '/admin' : '/admin/login')}
                className="p-2.5 bg-gray-50 text-gray-400 rounded-xl hover:text-primary transition-all"
              >
                <LayoutDashboard size={18} />
              </button>
            </div>
          </div>

          {/* Mobile menu */}
          <AnimatePresence>
            {menuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="md:hidden bg-white border-t border-gray-100 overflow-hidden"
              >
                <div className="px-6 py-8 space-y-5">
                  {navLinks.map(l => (
                    <Link
                      key={l.path}
                      to={l.path}
                      onClick={() => setMenuOpen(false)}
                      className={`block font-outfit text-2xl font-black capitalize ${
                        location.pathname === l.path ? 'text-primary' : 'text-gray-300'
                      }`}
                    >
                      {l.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </header>

        {/* Main content */}
        <main className="flex-1 pt-20">
          <Outlet />
        </main>

        <Footer />

        {/* WhatsApp */}
        <a
          href={`https://wa.me/${contact.wa?.replace(/[^0-9]/g, '')}`}
          target="_blank"
          rel="noreferrer"
          className="fixed bottom-6 right-6 z-[900] w-14 h-14 bg-[#25d366] rounded-full flex items-center justify-center shadow-2xl hover:scale-110 transition-transform"
          style={{ boxShadow: '0 8px 32px rgba(37,211,102,0.4)' }}
        >
          <svg viewBox="0 0 24 24" className="w-7 h-7 fill-white">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
          </svg>
        </a>
      </div>
    </ToastProvider>
  )
}
