import { useState } from 'react'
import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../../hooks/useAuth'
import { useData } from '../../hooks/useData'
import { ToastProvider } from '../shared/Toast'
import {
  LayoutDashboard, Package, Tag, ShoppingCart, MessageSquare,
  Building2, Palette, FileText, LogOut, ExternalLink, Menu, X
} from 'lucide-react'

const NAV = [
  { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
  { to: '/admin/products', label: 'Products', icon: Package },
  { to: '/admin/categories', label: 'Categories', icon: Tag },
  { to: '/admin/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/admin/messages', label: 'Messages', icon: MessageSquare },
  { to: '/admin/company', label: 'Company Info', icon: Building2 },
  { to: '/admin/about', label: 'About Content', icon: FileText },
  { to: '/admin/theme', label: 'Color Theme', icon: Palette },
]

function SidebarContent({ orders, messages, onClose }) {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const badges = {
    '/admin/orders': orders.length,
    '/admin/messages': messages.length,
  }

  const handleNav = (path) => {
    navigate(path)
    onClose?.()
  }

  return (
    <div className="flex flex-col h-full" style={{ backgroundColor: 'var(--color-dark)' }}>
      {/* Header */}
      <div className="p-6 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-outfit font-black text-lg"
            style={{ backgroundColor: 'rgba(255,255,255,0.1)', color: 'var(--color-accent)' }}>J</div>
          <div>
            <div className="font-outfit font-black text-white text-sm">JOYTUN</div>
            <div className="text-[9px] text-white/30 font-bold uppercase tracking-wider">Admin Panel</div>
          </div>
        </div>
        {/* Close button — only on mobile */}
        {onClose && (
          <button onClick={onClose} className="lg:hidden p-1.5 rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors">
            <X size={20} />
          </button>
        )}
      </div>

      {/* Nav links */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {NAV.map(({ to, label, icon: Icon, end }) => (
          <NavLink key={to} to={to} end={end}
            onClick={() => onClose?.()}
            className={({ isActive }) =>
              `flex items-center justify-between px-3 py-3 rounded-xl text-sm font-semibold transition-all ${
                isActive ? 'text-white' : 'text-white/40 hover:text-white hover:bg-white/5'
              }`
            }
            style={({ isActive }) => isActive ? { backgroundColor: 'var(--color-primary)' } : {}}
          >
            <div className="flex items-center gap-3">
              <Icon size={18} />
              <span>{label}</span>
            </div>
            {badges[to] > 0 && (
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full text-dark min-w-[18px] text-center"
                style={{ backgroundColor: 'var(--color-accent)' }}>
                {badges[to]}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Bottom actions */}
      <div className="p-4 border-t border-white/10 space-y-1">
        <button onClick={() => { navigate('/'); onClose?.() }}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/40 hover:text-white hover:bg-white/5">
          <ExternalLink size={17} /> View Website
        </button>
        <button onClick={logout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-all text-white/30 hover:text-red-400 hover:bg-red-500/10">
          <LogOut size={17} /> Log Out
        </button>
      </div>
    </div>
  )
}

export default function AdminLayout() {
  const { orders, messages } = useData()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <ToastProvider>
      <div className="min-h-screen bg-gray-50 flex">

        {/* ── Desktop sidebar (always visible on lg+) ── */}
        <aside className="w-64 hidden lg:flex flex-col shrink-0 sticky top-0 h-screen overflow-y-auto">
          <SidebarContent orders={orders} messages={messages} />
        </aside>

        {/* ── Mobile drawer overlay ── */}
        <AnimatePresence>
          {drawerOpen && (
            <>
              {/* Backdrop */}
              <motion.div
                key="backdrop"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
                className="fixed inset-0 z-40 lg:hidden"
                style={{ backgroundColor: 'rgba(0,0,0,0.55)', backdropFilter: 'blur(3px)' }}
                onClick={() => setDrawerOpen(false)}
              />
              {/* Drawer panel */}
              <motion.div
                key="drawer"
                initial={{ x: '-100%' }}
                animate={{ x: 0 }}
                exit={{ x: '-100%' }}
                transition={{ type: 'spring', stiffness: 320, damping: 32 }}
                className="fixed top-0 left-0 h-full w-72 z-50 lg:hidden shadow-2xl"
              >
                <SidebarContent
                  orders={orders}
                  messages={messages}
                  onClose={() => setDrawerOpen(false)}
                />
              </motion.div>
            </>
          )}
        </AnimatePresence>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto min-w-0">
          {/* Mobile top bar */}
          <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white shadow-sm">
            <button
              onClick={() => setDrawerOpen(true)}
              className="flex items-center gap-2 font-outfit font-black text-dark"
            >
              <Menu size={22} />
              <span className="text-sm">JOYTUN Admin</span>
            </button>
            <div className="flex items-center gap-2">
              {(orders.length > 0 || messages.length > 0) && (
                <span className="text-[10px] font-black px-2 py-0.5 rounded-full text-dark"
                  style={{ backgroundColor: 'var(--color-accent)' }}>
                  {orders.length + messages.length}
                </span>
              )}
            </div>
          </div>

          {/* Page content */}
          <div className="p-4 md:p-8 lg:p-10">
            <Outlet />
          </div>
        </main>
      </div>
    </ToastProvider>
  )
}
