import { useEffect, useRef } from 'react'
import { X } from 'lucide-react'

export default function Dialog({ children, onClose, titleId, className = '' }) {
  const dialog = useRef(null)
  useEffect(() => {
    const previous = document.activeElement
    const bodyOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    dialog.current?.focus()
    function onKey(event) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab') return
      const elements = [...dialog.current.querySelectorAll('button:not(:disabled), a[href], input, select, textarea, [tabindex="0"]')].filter(el => el.getClientRects().length)
      const first = elements[0], last = elements.at(-1)
      if (event.shiftKey && (document.activeElement === first || document.activeElement === dialog.current)) { event.preventDefault(); last?.focus() }
      else if (!event.shiftKey && (document.activeElement === last || document.activeElement === dialog.current)) { event.preventDefault(); first?.focus() }
    }
    document.addEventListener('keydown', onKey)
    return () => { document.body.style.overflow = bodyOverflow; document.removeEventListener('keydown', onKey); previous?.focus() }
  }, [onClose])
  return <div className="dialog-backdrop" onClick={e => { if (e.target === e.currentTarget) onClose() }}>
    <section className={`care-dialog ${className}`} ref={dialog} role="dialog" aria-modal="true" aria-labelledby={titleId} tabIndex={-1}>
      <button className="icon-button dialog-close" aria-label="Close dialog" onClick={onClose}><X size={20}/></button>{children}
    </section>
  </div>
}
