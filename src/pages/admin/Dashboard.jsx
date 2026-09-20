import { useNavigate } from 'react-router-dom'
import { useData } from '../../hooks/useData'
import { useAuth } from '../../hooks/useAuth'
import { Package, Tag, ShoppingCart, MessageSquare, Clock } from 'lucide-react'

export default function Dashboard() {
  const { products, categories, orders, messages } = useData()
  const { user } = useAuth()
  const navigate = useNavigate()

  const stats = [
    { label: 'Products', val: products.length, icon: Package, path: '/admin/products', color: '#0a3d8f' },
    { label: 'Categories', val: categories.length, icon: Tag, path: '/admin/categories', color: '#00c2a8' },
    { label: 'Orders', val: orders.length, icon: ShoppingCart, path: '/admin/orders', color: '#f59e0b' },
    { label: 'Messages', val: messages.length, icon: MessageSquare, path: '/admin/messages', color: '#8b5cf6' },
  ]

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-10">
        <h1 className="font-outfit text-3xl font-black text-dark">Dashboard</h1>
        <p className="text-gray-400 text-sm mt-1">Welcome back, {user?.displayName?.split(' ')[0]} 👋</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
        {stats.map(({ label, val, icon: Icon, path, color }) => (
          <button key={label} onClick={() => navigate(path)}
            className="bg-white border border-gray-100 rounded-2xl p-6 text-left hover:border-primary hover:shadow-md transition-all group">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: color + '15', color }}>
              <Icon size={20} />
            </div>
            <div className="text-3xl font-black text-dark mb-1" style={{ color }}>{val}</div>
            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">{label}</div>
          </button>
        ))}
      </div>

      {/* Recent orders */}
      {orders.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-dark text-sm">Recent Orders</h2>
            <button onClick={() => navigate('/admin/orders')} className="text-xs font-bold hover:underline" style={{color:'var(--color-primary)'}}>
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {orders.slice(0, 5).map(o => (
              <div key={o.id} className="px-4 md:px-6 py-3 flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-sm font-bold text-dark truncate">{o.name}</p>
                  <p className="text-xs text-gray-400 truncate">{o.product} · {o.qty} units</p>
                </div>
                <div className="flex items-center gap-1 text-xs text-gray-400 shrink-0">
                  <Clock size={11} />
                  {o.createdAt?.toDate?.()?.toLocaleDateString?.() || 'Now'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent messages */}
      {messages.length > 0 && (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-4 md:px-6 py-4 border-b border-gray-100 flex justify-between items-center">
            <h2 className="font-bold text-dark text-sm">Recent Messages</h2>
            <button onClick={() => navigate('/admin/messages')} className="text-xs font-bold hover:underline" style={{color:'var(--color-primary)'}}>
              View All
            </button>
          </div>
          <div className="divide-y divide-gray-50">
            {messages.slice(0, 5).map(m => (
              <div key={m.id} className="px-4 md:px-6 py-3">
                <div className="flex items-center justify-between mb-1 gap-2">
                  <p className="text-sm font-bold text-dark truncate">{m.name}</p>
                  <span className="text-xs text-gray-400 shrink-0">{m.phone}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-1">{m.msg}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
