import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useToast } from '../../components/shared/Toast'

export default function AdminAbout() {
  const { about, updateAbout } = useData()
  const notify = useToast()
  const [local, setLocal] = useState(about)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setLocal(about) }, [about])

  const dirty = JSON.stringify(local) !== JSON.stringify(about)

  const handleSave = async () => {
    setSaving(true)
    try { await updateAbout(local); notify('About content saved!') }
    catch { notify('Failed.', 'error') }
    finally { setSaving(false) }
  }

  const Field = ({ label, val, onChange, rows = 3 }) => (
    <div>
      <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-1 block">{label}</label>
      {rows === 1
        ? <input value={val} onChange={e => onChange(e.target.value)} className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none" />
        : <textarea value={val} onChange={e => onChange(e.target.value)} rows={rows}
            className="w-full bg-gray-50 rounded-xl px-4 py-3 text-sm outline-none resize-none" />
      }
    </div>
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black text-dark">About Content</h1>
          <p className="text-gray-400 text-sm mt-1">Manage the About page content</p>
        </div>
        {dirty && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Changes'}
          </button>
        )}
      </div>

      <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm space-y-5">
        <Field label="Page Title" val={local.title} onChange={v => setLocal(l => ({ ...l, title: v }))} rows={1} />
        <Field label="Paragraph 1" val={local.p1} onChange={v => setLocal(l => ({ ...l, p1: v }))} rows={4} />
        <Field label="Paragraph 2" val={local.p2} onChange={v => setLocal(l => ({ ...l, p2: v }))} rows={4} />
        <div className="grid md:grid-cols-2 gap-5">
          <Field label="Mission Statement" val={local.mission} onChange={v => setLocal(l => ({ ...l, mission: v }))} rows={4} />
          <Field label="Vision Statement" val={local.vision} onChange={v => setLocal(l => ({ ...l, vision: v }))} rows={4} />
        </div>
      </div>
    </div>
  )
}
