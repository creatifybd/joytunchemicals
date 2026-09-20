import { useData } from '../hooks/useData'
import { Target, Eye } from 'lucide-react'

export default function AboutPage() {
  const { about } = useData()

  return (
    <>
      {/* Hero */}
      <div className="py-20 px-4 md:px-8"
        style={{ background: 'linear-gradient(135deg, var(--color-dark) 0%, #0a2a5e 100%)' }}>
        <div className="max-w-4xl mx-auto text-center text-white">
          <p className="text-xs font-black tracking-[3px] uppercase mb-3"
            style={{ color: 'var(--color-accent)' }}>Our Story</p>
          <h1 className="font-outfit text-5xl font-black mb-4">{about.title}</h1>
          <div className="w-12 h-1 rounded-full mx-auto" style={{ backgroundColor: 'var(--color-accent)' }} />
        </div>
      </div>

      {/* About text */}
      <section className="py-24 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-gray-600 leading-relaxed text-lg mb-6">{about.p1}</p>
          <p className="text-gray-600 leading-relaxed text-lg">{about.p2}</p>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-20 px-4 md:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8">
          <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm">
            <Target size={32} className="mb-5" style={{ color: 'var(--color-accent)' }} />
            <h3 className="font-outfit text-2xl font-black text-dark mb-4">Our Mission</h3>
            <p className="text-gray-500 leading-relaxed">{about.mission}</p>
          </div>
          <div className="bg-white border border-gray-100 p-10 rounded-3xl shadow-sm">
            <Eye size={32} className="mb-5" style={{ color: 'var(--color-primary)' }} />
            <h3 className="font-outfit text-2xl font-black text-dark mb-4">Our Vision</h3>
            <p className="text-gray-500 leading-relaxed">{about.vision}</p>
          </div>
        </div>
      </section>
    </>
  )
}
