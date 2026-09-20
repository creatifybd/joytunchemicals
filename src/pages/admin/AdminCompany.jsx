import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useToast } from '../../components/shared/Toast'
import ImageUploader from '../../components/shared/ImageUploader'

export default function AdminCompany() {
  const { company, contact, updateCompany, updateContact } = useData()
  const notify = useToast()
  const [co, setCo] = useState(company)
  const [ct, setCt] = useState(contact)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setCo(company) }, [company])
  useEffect(() => { setCt(contact) }, [contact])

  const dirty = JSON.stringify(co) !== JSON.stringify(company) || JSON.stringify(ct) !== JSON.stringify(contact)

  const handleSave = async () => {
    setSaving(true)
    try {
      await Promise.all([updateCompany(co), updateContact(ct)])
      notify('Settings saved!')
    } catch { notify('Failed to save.', 'error') }
    finally { setSaving(false) }
  }

  const Field = ({ label, val, onChange, type = 'text' }) => (
    <div>
      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">{label}</label>
      {type === 'textarea'
        ? <textarea value={val} onChange={e => onChange(e.target.value)} rows={3}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
        : <input type={type} value={val} onChange={e => onChange(e.target.value)}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
      }
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black text-dark">Company Info</h1>
          <p className="text-gray-400 text-sm mt-1">Brand and contact information</p>
        </div>
        {dirty && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">
          <h3 className="font-bold text-dark text-sm border-b border-gray-100 pb-4">Brand Identity</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Brand Name" val={co.name} onChange={v => setCo(c => ({ ...c, name: v }))} />
            <Field label="Sub Name / Tagline" val={co.sub} onChange={v => setCo(c => ({ ...c, sub: v }))} />
          </div>
          <ImageUploader label="Company Logo" value={co.logo || ''} onChange={url => setCo(c => ({ ...c, logo: url }))} />
          <Field label="Hero Tagline (long description)" val={co.htag} onChange={v => setCo(c => ({ ...c, htag: v }))} type="textarea" />
          <Field label="Distributor Section Text" val={co.dta} onChange={v => setCo(c => ({ ...c, dta: v }))} type="textarea" />

        </div>

        <div className="bg-white border border-gray-100 rounded-2xl p-5 md:p-8 shadow-sm space-y-5">
          <h3 className="font-bold text-dark text-sm border-b border-gray-100 pb-4">Contact Information</h3>
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Phone" val={ct.phone} onChange={v => setCt(c => ({ ...c, phone: v }))} />
            <Field label="Email" val={ct.email} onChange={v => setCt(c => ({ ...c, email: v }))} type="email" />
            <Field label="WhatsApp Number" val={ct.wa} onChange={v => setCt(c => ({ ...c, wa: v }))} />
            <Field label="Website URL" val={ct.web} onChange={v => setCt(c => ({ ...c, web: v }))} />
          </div>
          <Field label="Full Address" val={ct.addr} onChange={v => setCt(c => ({ ...c, addr: v }))} />
          <Field label="Business Hours" val={ct.hours} onChange={v => setCt(c => ({ ...c, hours: v }))} />
          <Field label="Ticker Bar Text" val={ct.tb} onChange={v => setCt(c => ({ ...c, tb: v }))} />
        </div>
      </div>
    </div>
  )
}
