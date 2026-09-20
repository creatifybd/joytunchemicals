import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useData } from '../../hooks/useData'

const BUBBLES = Array.from({ length: 14 }, (_, i) => ({
  id: i, r: 16 + Math.random() * 28,
  x: 5 + Math.random() * 90,
  dur: 14 + Math.random() * 14,
  delay: Math.random() * 16,
  sway: (Math.random() - 0.5) * 100,
}))

const STARS = Array.from({ length: 12 }, (_, i) => ({
  id: i, x: Math.random() * 100, y: 10 + Math.random() * 80,
  size: 3 + Math.random() * 4, dur: 3 + Math.random() * 4, delay: Math.random() * 5,
}))

export default function HeroSection({ onOrder }) {
  const { products, company } = useData()
  const navigate = useNavigate()
  const [current, setCurrent] = useState(0)

  const featured = products.filter(p => p.status === 'active').slice(0, 6)

  useEffect(() => {
    if (!featured.length) return
    const t = setInterval(() => setCurrent(c => (c + 1) % featured.length), 4500)
    return () => clearInterval(t)
  }, [featured.length])

  return (
    <section
      className="relative min-h-[90vh] flex items-center overflow-hidden"
      style={{ paddingTop: '96px', background: 'linear-gradient(160deg, #060f2e 0%, #0a2a5e 45%, #083d3a 100%)' }}
    >
      {/* Glows */}
      <div className="absolute top-[-10%] right-[5%] w-[500px] h-[500px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,194,168,0.13) 0%, transparent 70%)', filter: 'blur(40px)' }} />
      <div className="absolute bottom-[-5%] left-[0] w-[550px] h-[380px] rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(59,125,233,0.10) 0%, transparent 70%)', filter: 'blur(50px)' }} />

      {/* Bubbles */}
      {BUBBLES.map(b => (
        <motion.div key={b.id}
          className="absolute rounded-full pointer-events-none"
          style={{
            width: b.r * 2, height: b.r * 2,
            left: `${b.x}%`, bottom: `-${b.r * 2}px`,
            background: 'radial-gradient(circle at 35% 32%, rgba(255,255,255,0.16), rgba(0,229,199,0.05) 40%, transparent)',
            border: '1px solid rgba(0,229,199,0.2)',
          }}
          animate={{ y: [0, -(860 + b.r * 4)], x: [0, b.sway * 0.4, -b.sway * 0.3, 0], opacity: [0, 0.8, 0.7, 0] }}
          transition={{ duration: b.dur, delay: b.delay, repeat: Infinity, ease: 'linear' }}
        />
      ))}

      {/* Stars */}
      {STARS.map(s => (
        <motion.div key={s.id} className="absolute pointer-events-none"
          style={{ left: `${s.x}%`, top: `${s.y}%` }}
          animate={{ opacity: [0, 1, 0], scale: [0.5, 1.2, 0.5] }}
          transition={{ duration: s.dur, delay: s.delay, repeat: Infinity, ease: 'easeInOut' }}
        >
          <svg width={s.size * 3} height={s.size * 3} viewBox="0 0 24 24">
            <path d="M12 2 L13.2 10.8 L22 12 L13.2 13.2 L12 22 L10.8 13.2 L2 12 L10.8 10.8 Z"
              fill="none" stroke="rgba(0,229,199,0.55)" strokeWidth="1" />
          </svg>
        </motion.div>
      ))}

      <div className="max-w-7xl mx-auto px-4 md:px-8 grid lg:grid-cols-2 gap-16 items-center relative z-10 py-16">
        {/* Left */}
        <motion.div initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.7 }}>
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
            className="inline-flex items-center gap-2 border px-4 py-2 rounded-full text-[12px] font-semibold tracking-wider uppercase mb-6"
            style={{ background: 'rgba(0,194,168,0.10)', borderColor: 'rgba(0,194,168,0.30)', color: '#00e5c7' }}
          >
            <motion.span className="inline-block w-2 h-2 rounded-full" style={{ backgroundColor: '#00c2a8' }}
              animate={{ scale: [1, 1.5, 1], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            Bangladesh's Trusted Cleaning Brand
          </motion.div>

          <h1 className="font-outfit text-5xl md:text-7xl font-black text-white leading-[1.08] mb-6">
            Cleaner Homes,<br />
            <motion.span className="inline-block" style={{ color: 'var(--color-accent)' }}
              animate={{ opacity: [0.85, 1, 0.85] }} transition={{ duration: 4, repeat: Infinity }}>
              Brighter Lives
            </motion.span>
          </h1>

          <p className="text-white/65 text-lg leading-relaxed mb-10 max-w-xl">{company.htag}</p>

          <div className="flex flex-wrap gap-4 mb-10">
            <motion.button
              whileHover={{ y: -3, boxShadow: '0 18px 48px rgba(0,194,168,0.40)' }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/products')}
              className="px-8 py-4 rounded-xl font-extrabold shadow-lg transition-all"
              style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-dark)' }}
            >
              Explore Products
            </motion.button>
            <motion.button
              whileHover={{ y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/contact')}
              className="border-2 border-white/25 text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-white/10"
            >
              Get a Quote
            </motion.button>
          </div>

          <div className="flex gap-3 flex-wrap">
            {['Fabric Safe', 'pH Balanced', 'Fresh Scent', 'Eco Friendly'].map((tag, i) => (
              <motion.span key={tag} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.1 }}
                className="text-[10px] font-bold tracking-widest uppercase px-3 py-1.5 rounded-lg flex items-center gap-1.5"
                style={{ color: 'rgba(0,229,199,0.75)', border: '1px solid rgba(0,194,168,0.18)', background: 'rgba(0,194,168,0.06)' }}>
                ✦ {tag}
              </motion.span>
            ))}
          </div>
        </motion.div>

        {/* Right — product carousel */}
        <div className="hidden lg:block relative">
          <div className="absolute inset-0 rounded-[40px] pointer-events-none"
            style={{ background: 'radial-gradient(ellipse at center, rgba(0,194,168,0.13) 0%, transparent 70%)', filter: 'blur(30px)', transform: 'scale(0.9) translateY(12px)' }} />

          <AnimatePresence mode="wait">
            {featured.length > 0 && featured.map((p, idx) => idx === current && (
              <motion.div key={p.id}
                initial={{ opacity: 0, y: 24, scale: 0.94 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -16, scale: 0.96 }}
                transition={{ duration: 0.55, ease: [0.23, 1, 0.32, 1] }}
                className="relative rounded-[32px] text-center max-w-md mx-auto overflow-hidden"
                style={{
                  background: 'rgba(255,255,255,0.05)',
                  backdropFilter: 'blur(28px)',
                  border: '1px solid rgba(255,255,255,0.12)',
                  boxShadow: '0 32px 80px rgba(0,0,0,0.25)',
                  padding: '48px 40px',
                }}
              >
                <div className="absolute top-0 left-1/4 right-1/4 h-px"
                  style={{ background: 'linear-gradient(90deg, transparent, rgba(0,229,199,0.5), transparent)' }} />

                {p.img
                  ? <div className="relative w-52 h-52 mx-auto mb-5 flex items-center justify-center rounded-2xl" style={{background:'rgba(255,255,255,0.08)', padding:'16px'}}>
                      <img src={p.img} alt={p.name} className="w-full h-full object-contain drop-shadow-2xl" style={{filter:'drop-shadow(0 16px 32px rgba(0,0,0,0.5))'}} />
                    </div>
                  : <motion.div className="text-[88px] mb-5 inline-block"
                      animate={{ y: [0, -6, 0] }} transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}>
                      {p.icon}
                    </motion.div>
                }
                <p className="text-[10px] font-bold tracking-[3px] uppercase mb-2" style={{ color: 'var(--color-accent)' }}>{p.cat}</p>
                <h3 className="font-outfit text-2xl font-bold text-white mb-3">{p.name}</h3>
                <p className="text-white/55 text-sm leading-relaxed mb-6">{p.desc?.slice(0, 90)}…</p>
                {p.badge && (
                  <span className="px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-wider text-dark"
                    style={{ backgroundColor: 'var(--color-accent)' }}>{p.badge}</span>
                )}
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {featured.map((_, i) => (
              <motion.button key={i} onClick={() => setCurrent(i)}
                animate={{ width: current === i ? 28 : 6, opacity: current === i ? 1 : 0.3 }}
                className="h-1.5 rounded-full" style={{ backgroundColor: 'var(--color-accent)' }}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
