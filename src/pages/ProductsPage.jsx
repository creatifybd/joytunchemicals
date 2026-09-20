import { useState } from 'react'
import { useData } from '../hooks/useData'
import ProductCard from '../components/public/ProductCard'
import ProductModal from '../components/public/ProductModal'
import OrderModal from '../components/public/OrderModal'

export default function ProductsPage() {
  const { products, categories } = useData()
  const [filter, setFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [viewProduct, setViewProduct] = useState(null)
  const [orderProduct, setOrderProduct] = useState(null)

  const active = products.filter(p => p.status === 'active')
  const filtered = active
    .filter(p => filter === 'all' || p.cat === filter)
    .filter(p => !search || p.name.toLowerCase().includes(search.toLowerCase()))

  return (
    <>
      <div className="py-16 px-4 md:px-8 border-b border-gray-100"
        style={{ background: 'linear-gradient(135deg, #f8faff 0%, #f0f7ff 100%)' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-xs font-black tracking-[3px] uppercase mb-3" style={{ color: 'var(--color-accent)' }}>
            Our Catalogue
          </p>
          <h1 className="font-outfit text-5xl font-black text-dark mb-4">All Products</h1>
          <p className="text-gray-500 max-w-xl mx-auto mb-8">
            Premium household and institutional cleaning products trusted across Bangladesh.
          </p>
          <div className="max-w-md mx-auto">
            <input type="text" placeholder="Search products…" value={search} onChange={e => setSearch(e.target.value)}
              className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-sm outline-none shadow-sm"
              style={{ '--tw-ring-color': 'var(--color-primary)' }} />
          </div>
        </div>
      </div>

      <section className="py-12 px-4 md:px-8">
        <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-8">
          <aside className="lg:w-52 shrink-0">
            <div className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm sticky top-24">
              <h3 className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-4">Categories</h3>
              <div className="flex flex-col gap-1.5">
                {[{ id: 'all', name: 'All Products' }, ...categories].map(c => (
                  <button key={c.id} onClick={() => setFilter(c.id === 'all' ? 'all' : c.name)}
                    className="text-left text-sm font-semibold px-3 py-2.5 rounded-xl transition-all flex items-center gap-2"
                    style={(filter === 'all' && c.id === 'all') || filter === c.name
                      ? { backgroundColor: 'var(--color-primary)', color: 'white' }
                      : { color: '#6b7280' }}>
                    {c.id !== 'all' && (
                      c.img
                        ? <img src={c.img} alt={c.name} className="w-5 h-5 rounded object-cover shrink-0" />
                        : <span className="text-base shrink-0">{c.icon}</span>
                    )}
                    <span className="flex-1">{c.name}</span>
                    {c.id !== 'all' && (
                      <span className="text-[10px] opacity-60 shrink-0">
                        {active.filter(p => p.cat === c.name).length}
                      </span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </aside>

          <div className="flex-1">
            <p className="text-sm text-gray-500 mb-6">
              <span className="font-bold text-dark">{filtered.length}</span> products
            </p>
            {filtered.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {filtered.map(p => (
                  <ProductCard key={p.id} product={p} onOrder={setOrderProduct} onView={setViewProduct} />
                ))}
              </div>
            ) : (
              <div className="text-center py-24 text-gray-400">
                <div className="text-5xl mb-4">🔍</div>
                <p className="font-semibold">No products found</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <ProductModal product={viewProduct} onClose={() => setViewProduct(null)} onOrder={setOrderProduct} />
      <OrderModal product={orderProduct} onClose={() => setOrderProduct(null)} />
    </>
  )
}
