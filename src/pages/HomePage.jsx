import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useData } from '../hooks/useData'
import HeroSection from '../components/public/HeroSection'
import Ticker from '../components/public/Ticker'
import ProductCard from '../components/public/ProductCard'
import ProductModal from '../components/public/ProductModal'
import OrderModal from '../components/public/OrderModal'

export default function HomePage() {
  const { products, categories, company } = useData()
  const navigate = useNavigate()
  const [filter, setFilter] = useState('all')
  const [viewProduct, setViewProduct] = useState(null)
  const [orderProduct, setOrderProduct] = useState(null)

  const active = products.filter(p => p.status === 'active')
  const filtered = filter === 'all' ? active : active.filter(p => p.cat === filter)
  const shown = filtered.slice(0, 8)

  return (
    <>
      <HeroSection onOrder={setOrderProduct} />
      <Ticker />

      {/* Products showcase */}
      <section className="py-24 px-4 md:px-8 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs font-black tracking-[3px] uppercase mb-3"
              style={{ color: 'var(--color-accent)' }}>Our Products</p>
            <h2 className="font-outfit text-4xl font-black text-dark mb-4">Complete Cleaning Solutions</h2>
            <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-primary)' }} />
          </div>

          {/* Category filter */}
          <div className="flex flex-wrap justify-center gap-2 mb-10">
            {[{ id: 'all', name: 'All' }, ...categories].map(c => (
              <button key={c.id} onClick={() => setFilter(c.id === 'all' ? 'all' : c.name)}
                className="px-5 py-2 rounded-full text-sm font-bold transition-all"
                style={(filter === 'all' && c.id === 'all') || filter === c.name
                  ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                  : { backgroundColor: 'white', color: '#6b7280', border: '1px solid #e5e7eb' }}
              >
                {c.name}
              </button>
            ))}
          </div>

          {/* Grid */}
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {shown.map(p => (
              <ProductCard key={p.id} product={p} onOrder={setOrderProduct} onView={setViewProduct} />
            ))}
            {shown.length === 0 && (
              <div className="col-span-4 text-center py-16 text-gray-400">No products yet.</div>
            )}
          </div>

          {active.length > 8 && (
            <div className="text-center mt-12">
              <button onClick={() => navigate('/products')}
                className="text-white px-10 py-4 rounded-xl font-bold shadow-xl hover:-translate-y-1 transition-all"
                style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 24px rgba(10,61,143,0.25)' }}>
                View All Products →
              </button>
            </div>
          )}
        </div>
      </section>

      {/* Distributor CTA */}
      <section className="py-24 px-4 md:px-8"
        style={{ background: 'linear-gradient(135deg, var(--color-primary), #0d52c2)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="font-outfit text-4xl font-black mb-4">Become a Distributor</h2>
          <p className="text-white/70 text-lg mb-10 max-w-2xl mx-auto">{company.dta}</p>
          <button onClick={() => navigate('/contact')}
            className="px-10 py-4 rounded-xl font-extrabold text-dark shadow-xl hover:-translate-y-1 transition-all"
            style={{ backgroundColor: 'var(--color-accent)' }}>
            Contact Us Today
          </button>
        </div>
      </section>

      <ProductModal product={viewProduct} onClose={() => setViewProduct(null)} onOrder={setOrderProduct} />
      <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
    </>
  )
}
