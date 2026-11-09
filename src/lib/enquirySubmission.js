// Serialize a single form's Firestore writes and emit GA4 lead events only after a
// successful save. This is a browser-session guard, not server-side deduplication.
export function createEnquirySubmitter({ save, emit, formId, itemId }) {
  if (typeof save !== 'function' || typeof emit !== 'function') throw new TypeError('A save function and an event emitter are required')
  if (!['contact', 'product_enquiry'].includes(formId)) throw new Error('Unrecognized enquiry form')
  let pending = false
  let completed = false
  const eventData = formId === 'product_enquiry'
    ? { form_id: formId, item_id: itemId }
    : { form_id: formId }

  function report(name, params) {
    // Analytics must never change the result of a completed Firestore save,
    // or expose visitor contact fields to Google Analytics.
    try { emit(name, params) } catch { /* best-effort telemetry */ }
  }

  return async function submitOnce(payload) {
    if (pending || completed) return 'ignored'
    pending = true
    try {
      await save(payload)
      completed = true
      report('generate_lead', eventData)
      return 'success'
    } catch {
      report('form_error', { form_id: formId, error_type: 'submission_failed' })
      return 'error'
    } finally {
      pending = false
    }
  }
}
