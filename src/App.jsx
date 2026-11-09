import { lazy, Suspense, useLayoutEffect } from 'react'
import { Routes, Route, Navigate, useLocation } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import BrandPage from './site/BrandPage'
import DiscoveryPage from './site/DiscoveryPage'
import Privacy from './site/Privacy'
import PublicLayout from './site/Layout'
import { HomePage, ProductsPage, ProductPage, NotFoundPage, AboutPage, ContactPage } from './site/Pages'
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox'))

const Marketing = lazy(() => import('./pages/admin/Marketing'))
const AnalyticsHub = lazy(() => import('./pages/admin/AnalyticsHub'))
const AdminEditor = lazy(() => import('./pages/admin/AdminEditor'))

function ProtectedRoute({ children }) {
  const { user, loading, isAdmin } = useAuth()

  // Wait until Firebase resolves auth state before deciding
  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-8 h-8 border-2 border-gray-200 border-t-primary rounded-full animate-spin"
        style={{ borderTopColor: 'var(--color-primary)' }} />
    </div>
  )

  if (!user || !isAdmin) return <Navigate to="/admin/login" replace />
  return children
}

export default function App() {
  const {pathname}=useLocation()
  useLayoutEffect(()=>{if(pathname.startsWith('/admin')&&(document.getElementById('joytun-ga')||document.getElementById('joytun-gtm')||document.getElementById('joytun-clarity')))window.location.reload()},[pathname])
  return (
    <Suspense fallback={<div className="app-loading" role="status">Loading Joytun…</div>}><Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
        <Route path="/brands/:slug" element={<BrandPage />} />
        <Route path="/care/:slug" element={<DiscoveryPage />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
      </Route>

      {/* Admin Routes */}
      <Route path="/admin/login" element={<AdminLogin />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="marketing" element={<Marketing />} />
        <Route path="analytics" element={<AnalyticsHub />} />
        <Route path="content" element={<AdminEditor />} />
        <Route path="categories" element={<Navigate to="/admin/content?section=categories" replace />} />
        <Route path="orders" element={<AdminInbox kind="orders" />} />
        <Route path="messages" element={<AdminInbox kind="messages" />} />
        <Route path="company" element={<Navigate to="/admin/content?section=brand" replace />} />
        <Route path="theme" element={<Navigate to="/admin/content?section=appearance" replace />} />
        <Route path="about" element={<Navigate to="/admin/content?section=about" replace />} />
      </Route>


    </Routes></Suspense>
  )
}
