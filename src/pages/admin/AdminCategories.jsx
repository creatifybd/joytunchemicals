import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus, Pencil, Trash2, X, Save, Tag } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { addCategory, updateCategory, deleteCategory } from '../../lib/firestore'
import { useToast } from '../../components/shared/Toast'
import ImageUploader from '../../components/shared/ImageUploader'

const EMPTY = { name: '', icon: '📂', img: '', status: 'active' }

export default function AdminCategories() {
  const { categories } = useData()
  const notify = useToast()
  const [modal, setModal] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)
  // 'emoji' | 'image' — which icon type to use
  const [iconType, setIconType] = useState('emoji')

  const open = (cat = null) => {
    const base = cat || EMPTY
    setForm(base)
    setIconType(base.img ? 'image' : 'emoji')
    setModal(cat ? 'edit' : 'add')
  }
  const close = () => { setModal(null); setForm(EMPTY); setIconType('emoji') }

  const handleSave = async () => {
    if (!form.name) return notify('Category name required.', 'error')
    // Clear whichever field isn't active
    const saveForm = {
      ...form,
      icon: iconType === 'emoji' ? form.icon : '',
      img: iconType === 'image' ? form.img : '',
    }
    setSaving(true)
    try {
      if (modal === 'add') { await addCategory(saveForm); notify('Category added!') }
      else { const { id, ...d } = saveForm; await updateCategory(id, d); notify('Category updated!') }
      close()
    } catch { notify('Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this category?')) return
    try { await deleteCategory(id); notify('Deleted!') }
    catch { notify('Failed.', 'error') }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black text-dark">Categories</h1>
          <p className="text-gray-400 text-sm mt-1">{categories.length} categories</p>
        </div>
        <button onClick={() => open()}
          className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all"
          style={{ backgroundColor: 'var(--color-primary)' }}>
          <Plus size={16} /> Add Category
        </button>
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden shadow-sm">
        {categories.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <Tag size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-semibold">No categories yet</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-50">
            {categories.map(c => (
              <div key={c.id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50/50 transition-colors">
                <div className="flex items-center gap-3">
                  {/* Show image or emoji */}
                  <div className="w-10 h-10 rounded-xl overflow-hidden bg-gray-100 flex items-center justify-center shrink-0">
                    {c.img
                      ? <img src={c.img} alt={c.name} className="w-full h-full object-cover" />
                      : <span className="text-2xl">{c.icon}</span>
                    }
                  </div>
                  <div>
                    <p className="text-sm font-bold text-dark">{c.name}</p>
                    <span className={`text-[10px] font-black uppercase ${c.status === 'active' ? 'text-green-500' : 'text-red-400'}`}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button onClick={() => open(c)} className="p-2 text-gray-400 hover:text-primary rounded-lg hover:bg-blue-50 transition-colors">
                    <Pencil size={15} />
                  </button>
                  <button onClick={() => handleDelete(c.id)} className="p-2 text-gray-400 hover:text-red-500 rounded-lg hover:bg-red-50 transition-colors">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <AnimatePresence>
        {modal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 backdrop-blur-sm" onClick={close}
              style={{ backgroundColor: 'rgba(6,15,46,0.6)' }} />
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="relative bg-white rounded-3xl w-full max-w-sm p-8 shadow-2xl z-10">

              <div className="flex justify-between items-center mb-6">
                <h2 className="font-outfit text-xl font-black text-dark">
                  {modal === 'add' ? 'Add Category' : 'Edit Category'}
                </h2>
                <button onClick={close} className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-5 mb-6">
                {/* Name */}
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Name *</label>
                  <input value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20"
                    placeholder="e.g. Detergent" />
                </div>

                {/* Icon type toggle */}
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 block">Icon Type</label>
                  <div className="flex gap-2 bg-gray-100 p-1 rounded-xl">
                    <button
                      onClick={() => setIconType('emoji')}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={iconType === 'emoji'
                        ? { backgroundColor: 'white', color: 'var(--color-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                        : { color: '#9ca3af' }}>
                      Emoji / Icon
                    </button>
                    <button
                      onClick={() => setIconType('image')}
                      className="flex-1 py-2 rounded-lg text-xs font-bold transition-all"
                      style={iconType === 'image'
                        ? { backgroundColor: 'white', color: 'var(--color-primary)', boxShadow: '0 1px 4px rgba(0,0,0,0.08)' }
                        : { color: '#9ca3af' }}>
                      Brand Logo / Image
                    </button>
                  </div>
                </div>

                {/* Emoji input */}
                {iconType === 'emoji' && (
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Emoji or Icon</label>
                    <input value={form.icon} onChange={e => setForm(f => ({ ...f, icon: e.target.value }))}
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-2xl outline-none focus:ring-2 ring-primary/20 text-center"
                      placeholder="📦" />
                    <p className="text-[10px] text-gray-400 mt-1.5 text-center">Paste an emoji or leave as-is</p>
                  </div>
                )}

                {/* Image upload */}
                {iconType === 'image' && (
                  <ImageUploader
                    label="Category Image / Brand Logo"
                    value={form.img || ''}
                    onChange={url => setForm(f => ({ ...f, img: url }))}
                  />
                )}

                {/* Status */}
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20">
                    <option value="active">Active</option>
                    <option value="draft">Draft</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-3 justify-end">
                <button onClick={close} className="px-5 py-2.5 rounded-xl text-sm font-bold text-gray-500 border border-gray-200 hover:bg-gray-50 transition-all">
                  Cancel
                </button>
                <button onClick={handleSave} disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white disabled:opacity-60 hover:scale-[1.02] transition-all shadow-lg"
                  style={{ backgroundColor: 'var(--color-primary)' }}>
                  <Save size={14} /> {saving ? 'Saving…' : 'Save'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
