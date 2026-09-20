import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Package } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { addProduct, updateProduct, deleteProduct } from '../../lib/firestore'
import { useToast } from '../../components/shared/Toast'
import MultiImageUploader from '../../components/shared/MultiImageUploader'

const EMPTY = {
  name: '', cat: '', icon: '📦', badge: '', badgeCol: '',
  desc: '', feats: '', variants: '', status: 'active', images: []
}

export default function AdminProducts() {
  const { products, categories } = useData()
  const notify = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  const openAdd = () => {
    setForm({ ...EMPTY, cat: categories[0]?.name || '' })
    setModal('add')
  }
  const openEdit = (p) => {
    // Migrate legacy single img → images array
    const images = p.images?.length ? p.images : (p.img ? [p.img] : [])
    setForm({ ...p, images })
    setModal('edit')
  }
  const close = () => { setModal(null); setForm(EMPTY) }

  const handleSave = async () => {
    if (!form.name) return notify('Product name is required.', 'error')
    setSaving(true)
    try {
      const saveData = { ...form, img: form.images?.[0] || '' }
      if (modal === 'add') {
        await addProduct(saveData)
        notify('Product added!')
      } else {
        const { id, ...data } = saveData
        await updateProduct(id, data)
        notify('Product updated!')
      }
      close()
    } catch {
      notify('Failed to save.', 'error')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this product?')) return
    try { await deleteProduct(id); notify('Product deleted!') }
    catch { notify('Failed to delete.', 'error') }
  }

  return (
    <div className="max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black text-dark">Products</h1>
          <p className="text-gray-400 text-sm mt-1">{products.length} total products</p>
        </div>
        <button onClick={openAdd}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 4px 16px rgba(10,61,143,0.3)' }}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm overflow-x-auto">
        {products.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Package size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No products yet</p>
          </div>
        ) : (
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {['Product', 'Category', 'Images', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-4 md:px-6 py-4 text-[10px] font-black uppercase text-gray-400 tracking-[2px]">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {products.map(p => (
                <tr key={p.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center overflow-hidden shrink-0">
                        {p.images?.[0] || p.img
                          ? <img src={p.images?.[0] || p.img} alt="" className="w-full h-full object-contain p-0.5" />
                          : <span className="text-xl">{p.icon}</span>}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-dark">{p.name}</p>
                        <p className="text-[11px] text-gray-400 line-clamp-1">{p.desc}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-sm text-gray-500">{p.cat}</td>
                  <td className="px-4 md:px-6 py-4">
                    <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                      {(p.images?.length || (p.img ? 1 : 0))} photo{(p.images?.length || (p.img ? 1 : 0)) !== 1 ? 's' : ''}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full ${
                      p.status === 'active' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                      {p.status}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="flex gap-2">
                      <button onClick={() => openEdit(p)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-blue-50 transition-colors">
                        <Pencil size={15} />
                      </button>
                      <button onClick={() => handleDelete(p.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                        <Trash2 size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-start justify-center p-4 overflow-y-auto">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-sm" onClick={close}
              style={{ backgroundColor: 'rgba(6,15,46,0.6)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl w-full max-w-2xl p-5 md:p-8 shadow-2xl z-10 my-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-outfit text-xl font-black text-dark">{modal === 'add' ? 'Add Product' : 'Edit Product'}</h2>
                <button onClick={close} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-5">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Product Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" placeholder="e.g. Joytun Detergent Powder" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Category</label>
                  <select value={form.cat} onChange={e => setForm(f => ({ ...f, cat: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none">
                    {categories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <MultiImageUploader
                  label="Product Images (up to 8)"
                  images={form.images || []}
                  onChange={imgs => setForm(f => ({ ...f, images: imgs, img: imgs[0] || '' }))}
                />
              </div>

              <div className="grid grid-cols-3 gap-5 mb-5">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Icon (Emoji)</label>
                  <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Badge</label>
                  <input value={form.badge} onChange={e => setForm(f => ({ ...f, badge: e.target.value }))}
                    placeholder="Bestseller" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="mb-5">
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Description</label>
                <textarea value={form.desc} onChange={e => setForm(f => ({ ...f, desc: e.target.value }))} rows={3}
                  className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
              </div>

              <div className="grid md:grid-cols-2 gap-5 mb-6">
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Key Features (one per line)</label>
                  <textarea value={form.feats} onChange={e => setForm(f => ({ ...f, feats: e.target.value }))} rows={4}
                    placeholder={'Removes tough stains\nLong-lasting fragrance\nSafe for colors'}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Sizes / Variants (one per line)</label>
                  <textarea value={form.variants} onChange={e => setForm(f => ({ ...f, variants: e.target.value }))} rows={4}
                    placeholder={'500g\n1kg\n2kg\n5kg'}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={close} className="px-6 py-2.5 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">Cancel</button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold text-white shadow-lg hover:scale-[1.02] transition-all disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <Save size={15} /> {saving ? 'Saving…' : 'Save Product'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
