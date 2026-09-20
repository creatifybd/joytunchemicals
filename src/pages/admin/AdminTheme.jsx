import { useState, useEffect } from 'react'
import { Save } from 'lucide-react'
import { useData } from '../../hooks/useData'
import { useToast } from '../../components/shared/Toast'

const PRESETS = [
  { name: 'Classic Joytun', blue: '#0a3d8f', teal: '#00c2a8', navy: '#060f2e' },
  { name: 'Eco Fresh', blue: '#2d5a27', teal: '#82c91e', navy: '#1b2d17' },
  { name: 'Royal Gold', blue: '#1a1b1e', teal: '#fab005', navy: '#000000' },
  { name: 'Oceanic', blue: '#1864ab', teal: '#3bc9db', navy: '#0b2840' },
  { name: 'Sunset', blue: '#e03131', teal: '#f08c00', navy: '#4b0b0b' },
  { name: 'Cyberpunk', blue: '#be4bdb', teal: '#20c997', navy: '#2b0b3b' },
  { name: 'Forest', blue: '#087f5b', teal: '#63e6be', navy: '#053123' },
  { name: 'Midnight', blue: '#364fc7', teal: '#748ffc', navy: '#101423' },
]

const NAVBAR_STYLES = [
  { id: 'white', label: 'White', desc: 'Light navbar (default)', bg: '#ffffff', text: '#060f2e' },
  { id: 'navy', label: 'Dark Navy', desc: 'Dark colored navbar', bg: 'var(--color-dark)', text: '#ffffff' },
  { id: 'primary', label: 'Brand Blue', desc: 'Primary brand color', bg: 'var(--color-primary)', text: '#ffffff' },
  { id: 'custom', label: 'Custom', desc: 'Pick your own color', bg: null, text: null },
]

export default function AdminTheme() {
  const { theme, updateTheme } = useData()
  const notify = useToast()
  const [local, setLocal] = useState(theme)
  const [saving, setSaving] = useState(false)

  useEffect(() => { setLocal(theme) }, [theme])

  const dirty = JSON.stringify(local) !== JSON.stringify(theme)

  const handleSave = async () => {
    setSaving(true)
    try { await updateTheme(local); notify('Theme saved!') }
    catch { notify('Failed.', 'error') }
    finally { setSaving(false) }
  }

  const navbarStyle = local.navbarStyle || 'white'
  const navbarCustomBg = local.navbarCustomBg || '#ffffff'
  const navbarCustomText = local.navbarCustomText || '#060f2e'

  return (
    <div className="max-w-3xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-outfit text-3xl font-black text-dark">Color Theme</h1>
          <p className="text-gray-400 text-sm mt-1">Customize your brand colors and navbar</p>
        </div>
        {dirty && (
          <button onClick={handleSave} disabled={saving}
            className="flex items-center gap-2 text-white px-5 py-2.5 rounded-xl font-bold text-sm shadow-lg hover:-translate-y-0.5 transition-all disabled:opacity-60"
            style={{ backgroundColor: 'var(--color-primary)' }}>
            <Save size={15} /> {saving ? 'Saving…' : 'Save Theme'}
          </button>
        )}
      </div>

      <div className="space-y-6">
        {/* Color Presets */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-dark text-sm mb-6">Color Presets</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PRESETS.map(p => (
              <button key={p.name} onClick={() => setLocal(l => ({ ...l, blue: p.blue, teal: p.teal, navy: p.navy }))}
                className="p-3 rounded-2xl border border-gray-100 hover:border-primary transition-all group text-left"
                style={local.blue === p.blue && local.teal === p.teal ? { borderColor: 'var(--color-primary)', backgroundColor: '#f0f4ff' } : {}}>
                <div className="flex h-8 rounded-lg overflow-hidden mb-2.5">
                  <div className="flex-1" style={{ backgroundColor: p.navy }} />
                  <div className="flex-1" style={{ backgroundColor: p.blue }} />
                  <div className="flex-1" style={{ backgroundColor: p.teal }} />
                </div>
                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{p.name}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Custom brand colors */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-dark text-sm mb-6">Custom Brand Colors</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { label: 'Primary Blue', key: 'blue' },
              { label: 'Accent Teal', key: 'teal' },
              { label: 'Dark Navy', key: 'navy' },
            ].map(({ label, key }) => (
              <div key={key}>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 block">{label}</label>
                <input type="color" value={local[key]} onChange={e => setLocal(t => ({ ...t, [key]: e.target.value }))}
                  className="w-full h-12 rounded-xl cursor-pointer border border-gray-200" />
                <input type="text" value={local[key]} onChange={e => setLocal(t => ({ ...t, [key]: e.target.value }))}
                  className="w-full mt-2 bg-gray-50 rounded-xl px-3 py-2 text-xs font-mono text-center outline-none" />
              </div>
            ))}
          </div>

          {/* Live preview */}
          <div className="mt-8 p-6 bg-gray-50 rounded-2xl">
            <p className="text-[10px] font-black uppercase text-gray-400 tracking-[2px] mb-5 text-center">Color Preview</p>
            <div className="flex gap-5 max-w-sm mx-auto">
              {[
                { label: 'Navy', color: local.navy },
                { label: 'Primary', color: local.blue },
                { label: 'Accent', color: local.teal },
              ].map(s => (
                <div key={s.label} className="flex-1 text-center">
                  <div className="h-16 rounded-xl shadow-lg mb-2" style={{ backgroundColor: s.color }} />
                  <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Navbar style */}
        <div className="bg-white border border-gray-100 rounded-2xl p-8 shadow-sm">
          <h3 className="font-bold text-dark text-sm mb-2">Navbar Style</h3>
          <p className="text-xs text-gray-400 mb-6">Choose the background color of the top navigation bar</p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {NAVBAR_STYLES.map(s => (
              <button key={s.id} onClick={() => setLocal(l => ({ ...l, navbarStyle: s.id }))}
                className="p-3 rounded-2xl border-2 transition-all text-left"
                style={navbarStyle === s.id
                  ? { borderColor: 'var(--color-primary)', backgroundColor: '#f0f4ff' }
                  : { borderColor: '#f3f4f6' }}>
                {/* Navbar preview strip */}
                <div className="h-8 rounded-lg mb-2.5 flex items-center px-2 gap-1.5 overflow-hidden"
                  style={{
                    backgroundColor: s.id === 'custom' ? navbarCustomBg
                      : s.id === 'navy' ? local.navy
                      : s.id === 'primary' ? local.blue
                      : '#ffffff',
                    border: s.id === 'white' ? '1px solid #e5e7eb' : 'none'
                  }}>
                  <div className="w-3 h-3 rounded-sm opacity-60"
                    style={{ backgroundColor: s.id === 'white' ? local.navy : '#ffffff' }} />
                  <div className="flex gap-1 ml-auto">
                    {[1,2,3].map(i => (
                      <div key={i} className="w-4 h-1.5 rounded-full opacity-50"
                        style={{ backgroundColor: s.id === 'white' ? '#9ca3af' : 'rgba(255,255,255,0.6)' }} />
                    ))}
                  </div>
                </div>
                <p className="text-[10px] font-bold text-gray-700 mb-0.5">{s.label}</p>
                <p className="text-[9px] text-gray-400">{s.desc}</p>
              </button>
            ))}
          </div>

          {/* Custom color pickers - only show when custom is selected */}
          {navbarStyle === 'custom' && (
            <div className="grid grid-cols-2 gap-5 p-5 bg-gray-50 rounded-xl border border-gray-200">
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 block">Background Color</label>
                <input type="color" value={navbarCustomBg}
                  onChange={e => setLocal(l => ({ ...l, navbarCustomBg: e.target.value }))}
                  className="w-full h-11 rounded-xl cursor-pointer border border-gray-200" />
                <input type="text" value={navbarCustomBg}
                  onChange={e => setLocal(l => ({ ...l, navbarCustomBg: e.target.value }))}
                  className="w-full mt-2 bg-white rounded-lg px-3 py-2 text-xs font-mono text-center outline-none border border-gray-200" />
              </div>
              <div>
                <label className="text-[9px] font-black uppercase text-gray-400 tracking-wider mb-2 block">Text / Icon Color</label>
                <input type="color" value={navbarCustomText}
                  onChange={e => setLocal(l => ({ ...l, navbarCustomText: e.target.value }))}
                  className="w-full h-11 rounded-xl cursor-pointer border border-gray-200" />
                <input type="text" value={navbarCustomText}
                  onChange={e => setLocal(l => ({ ...l, navbarCustomText: e.target.value }))}
                  className="w-full mt-2 bg-white rounded-lg px-3 py-2 text-xs font-mono text-center outline-none border border-gray-200" />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
