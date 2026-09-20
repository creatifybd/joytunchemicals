import { useData } from '../../hooks/useData'

export default function Ticker() {
  const { contact } = useData()
  const text = contact.tb || 'Detergent Powder ✦ Dish Wash Liquid ✦ Glass Cleaner ✦ Toilet Cleaner ✦ Hand Wash'
  const items = Array(20).fill(text)

  return (
    <div className="overflow-hidden whitespace-nowrap py-3" style={{ backgroundColor: 'var(--color-accent)' }}>
      <div className="inline-flex gap-12 animate-ticker">
        {items.map((t, i) => (
          <span key={i} className="text-dark text-[12px] font-black tracking-widest uppercase">{t}</span>
        ))}
      </div>
    </div>
  )
}
