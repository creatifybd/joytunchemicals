import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import PublicLayout from './site/Layout'
import { HomePage, ProductsPage, ProductPage, NotFoundPage, AboutPage, ContactPage } from './site/Pages'
const AdminLayout = lazy(() => import('./components/admin/AdminLayout'))
const AdminLogin = lazy(() => import('./pages/AdminLogin'))
const Dashboard = lazy(() => import('./pages/admin/Dashboard'))
const AdminProducts = lazy(() => import('./pages/admin/AdminProducts'))
const AdminInbox = lazy(() => import('./pages/admin/AdminInbox'))

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
  return (
    <Suspense fallback={<div className="app-loading" role="status">Loading Joytun…</div>}><Routes>
      {/* Public Routes */}
      <Route element={<PublicLayout />}>
        <Route path="/" element={<HomePage />} />
        <Route path="/products" element={<ProductsPage />} />
        <Route path="/products/:slug" element={<ProductPage />} />
        <Route path="*" element={<NotFoundPage />} />
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
