import { Link } from 'react-router-dom'
import { MapPin, Phone, Mail } from 'lucide-react'
import { useData } from '../../hooks/useData'

export default function Footer() {
  const { company, contact, categories } = useData()
  return (
    <footer className="border-t border-white/5 py-20 px-4 md:px-8" style={{ backgroundColor: 'var(--color-dark)' }}>
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 text-white">
        <div className="space-y-4">
          <div className="font-outfit text-xl font-black">{company.name}</div>
          <p className="text-white/40 text-sm leading-relaxed">{company.htag}</p>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[3px] mb-6">Navigation</h4>
          <div className="space-y-3">
            {[['/', 'Home'], ['/products', 'Products'], ['/about', 'About'], ['/contact', 'Contact']].map(([path, label]) => (
              <Link key={path} to={path} className="block text-white/60 hover:text-white text-sm font-medium transition-colors">{label}</Link>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[3px] mb-6">Categories</h4>
          <div className="space-y-3">
            {categories.slice(0, 5).map(c => (
              <div key={c.id} className="text-white/60 text-sm font-medium">{c.name}</div>
            ))}
          </div>
        </div>
        <div>
          <h4 className="text-[10px] font-black uppercase text-white/30 tracking-[3px] mb-6">Contact</h4>
          <div className="space-y-4 text-sm text-white/60">
            <div className="flex gap-3"><MapPin size={16} className="text-accent shrink-0 mt-0.5" style={{ color: 'var(--color-accent)' }} /><p>{contact.addr}</p></div>
            <div className="flex gap-3"><Phone size={16} className="text-accent shrink-0" style={{ color: 'var(--color-accent)' }} /><p>{contact.phone}</p></div>
            <div className="flex gap-3"><Mail size={16} className="text-accent shrink-0" style={{ color: 'var(--color-accent)' }} /><p>{contact.email}</p></div>
          </div>
        </div>
      </div>
      <div className="max-w-7xl mx-auto mt-16 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
        <p className="text-white/20 text-[11px] tracking-wider">© {new Date().getFullYear()} JOYTUN CHEMICAL INDUSTRIES. ALL RIGHTS RESERVED.</p>
      </div>
    </footer>
  )
}
