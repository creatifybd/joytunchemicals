import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, ShoppingCart, Check } from 'lucide-react'
import { addOrder } from '../../lib/firestore'
import { useToast } from '../shared/Toast'

export default function OrderModal({ product, onClose }) {
  const notify = useToast()
  const [form, setForm] = useState({ name: '', phone: '', email: '', variant: '', qty: '1', address: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  if (!product) return null
  const variants = product.variants?.split('\n').filter(Boolean) || []

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addOrder({
        product: product.name,
        productId: product.id,
        ...form,
        variant: form.variant || variants[0] || '',
      })
      setDone(true)
      notify('Order placed successfully!')
    } catch {
      notify('Failed to place order. Try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[2000] flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-dark/70 backdrop-blur-sm"
          style={{ backgroundColor: 'rgba(6,15,46,0.7)' }}
          onClick={onClose}
        />
        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 24 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.92, opacity: 0, y: 24 }}
          className="relative bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl z-10 my-8"
        >
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={16} />
          </button>

          {done ? (
            <div className="text-center py-8">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-5" style={{ background: 'linear-gradient(135deg, #00c2a8, #009e88)' }}>
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
              <h3 className="font-outfit text-2xl font-black text-dark mb-2">Order Placed! 🎉</h3>
              <p className="text-gray-400 text-sm mb-2">
                Thank you, <span className="font-bold text-primary">{form.name}</span>!
              </p>
              <p className="text-gray-400 text-sm mb-8">We'll contact you shortly to confirm your order.</p>
              <button onClick={onClose} className="px-8 py-3 rounded-xl font-bold border-2 border-gray-100 text-gray-500 hover:border-primary hover:text-primary transition-all">
                Close
              </button>
            </div>
          ) : (
            <>
              <h2 className="font-outfit text-xl font-black text-dark mb-1">Place Order</h2>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl mb-6">
                <span className="text-3xl">{product.icon}</span>
                <div>
                  <p className="text-[9px] font-black uppercase tracking-widest" style={{ color: 'var(--color-accent)' }}>{product.cat}</p>
                  <p className="text-sm font-bold text-dark">{product.name}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Full Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your name" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+880..." className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Email</label>
                  <input type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20" />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  {variants.length > 0 && (
                    <div>
                      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Size / Variant</label>
                      <select value={form.variant || variants[0]} onChange={e => setForm(f => ({ ...f, variant: e.target.value }))}
                        className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20">
                        {variants.map(v => <option key={v}>{v}</option>)}
                      </select>
                    </div>
                  )}
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Quantity *</label>
                    <input required type="number" min="1" value={form.qty} onChange={e => setForm(f => ({ ...f, qty: e.target.value }))}
                      className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20" />
                  </div>
                </div>

                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Delivery Address *</label>
                  <textarea required value={form.address} onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                    placeholder="Full delivery address..." rows={3}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 ring-primary/20 resize-none" />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full text-white py-3.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 shadow-lg hover:scale-[1.02] transition-transform disabled:opacity-60"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                >
                  <ShoppingCart size={16} />
                  {submitting ? 'Placing Order…' : 'Confirm Order'}
                </button>
              </form>
            </>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
