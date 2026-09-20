import { useState } from 'react'
import { MapPin, Phone, Mail, Clock, Send, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useData } from '../hooks/useData'
import { addMessage } from '../lib/firestore'
import { useToast } from '../components/shared/Toast'

export default function ContactPage() {
  const { contact } = useData()
  const notify = useToast()
  const [form, setForm] = useState({ name: '', phone: '', email: '', msg: '' })
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      await addMessage(form)
      setDone(true)
      notify('Message sent successfully!')
    } catch {
      notify('Failed to send. Please try again.', 'error')
    } finally {
      setSubmitting(false)
    }
  }

  const info = [
    { icon: <MapPin size={20} />, label: 'Factory & Office', val: contact.addr },
    { icon: <Phone size={20} />, label: 'Phone', val: contact.phone },
    { icon: <Mail size={20} />, label: 'Email', val: contact.email },
    { icon: <Clock size={20} />, label: 'Business Hours', val: contact.hours },
  ]

  return (
    <>
      <div className="py-20 px-4 md:px-8" style={{ background: 'linear-gradient(135deg, var(--color-dark), #0a2a5e)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <p className="text-xs font-black tracking-[3px] uppercase mb-3" style={{ color: 'var(--color-accent)' }}>Get In Touch</p>
          <h1 className="font-outfit text-5xl font-black mb-4">Contact Us</h1>
          <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-accent)' }} />
        </div>
      </div>

      <section className="py-24 px-4 md:px-8">
        <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
          {/* Info */}
          <div>
            <h2 className="font-outfit text-3xl font-black text-dark mb-10">Reach Us Directly</h2>
            <div className="space-y-8">
              {info.map(item => (
                <div key={item.label} className="flex gap-5">
                  <div className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0 bg-gray-50"
                    style={{ color: 'var(--color-primary)' }}>
                    {item.icon}
                  </div>
                  <div>
                    <h4 className="font-bold text-dark text-sm mb-0.5">{item.label}</h4>
                    <p className="text-gray-500 text-sm">{item.val}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Form */}
          {done ? (
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
              className="bg-white border border-gray-100 rounded-3xl shadow-xl p-12 flex flex-col items-center justify-center text-center">
              <div className="w-20 h-20 rounded-full flex items-center justify-center mb-6"
                style={{ background: 'linear-gradient(135deg, #00c2a8, #009e88)' }}>
                <Check size={36} className="text-white" strokeWidth={3} />
              </div>
              <h3 className="font-outfit text-2xl font-black text-dark mb-2">Message Sent! 🎉</h3>
              <p className="text-gray-400 text-sm mb-8">
                Thank you, <span className="font-bold" style={{ color: 'var(--color-primary)' }}>{form.name}</span>!<br />
                We'll reply within 24 hours.
              </p>
              <button onClick={() => { setDone(false); setForm({ name: '', phone: '', email: '', msg: '' }) }}
                className="px-8 py-3 rounded-xl font-bold border-2 border-gray-100 text-gray-500 hover:border-primary hover:text-primary transition-all">
                Send Another
              </button>
            </motion.div>
          ) : (
            <div className="bg-white border border-gray-100 rounded-3xl shadow-xl p-10">
              <h2 className="font-outfit text-2xl font-bold text-dark mb-8">Send a Message</h2>
              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Name *</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="Your Name" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                  <div>
                    <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Phone *</label>
                    <input required type="tel" value={form.phone} onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                      placeholder="+880..." className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Email *</label>
                  <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    placeholder="email@example.com" className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
                </div>
                <div>
                  <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">Message *</label>
                  <textarea required value={form.msg} onChange={e => setForm(f => ({ ...f, msg: e.target.value }))}
                    placeholder="How can we help?" rows={4}
                    className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
                </div>
                <button type="submit" disabled={submitting}
                  className="w-full text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:scale-[1.02] transition-transform disabled:opacity-60 shadow-xl"
                  style={{ backgroundColor: 'var(--color-primary)', boxShadow: '0 8px 24px rgba(10,61,143,0.25)' }}>
                  <Send size={16} /> {submitting ? 'Sending…' : 'Send Message'}
                </button>
              </form>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
