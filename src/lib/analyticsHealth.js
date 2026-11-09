// Verified in GA4's signed-in Admin > Data streams on 9 November 2026.
// Public stream identifiers are not credentials. Never put OAuth tokens or service keys here.
export const JOYTUN_GA4 = Object.freeze({
  propertyId: '533958329',
  streamId: '14408990486',
  measurementId: 'G-03P79M8JDL',
  streamName: 'Joytun-web',
  website: 'https://www.joytunchemicals.com',
})

export function getAnalyticsReadiness(analytics = {}) {
  if (!analytics.enabled) return { status: 'off', title: 'Website analytics disabled', detail: 'Enable analytics only after validating consent and event delivery in Website Studio.' }
  if (analytics.mode === 'gtm') return { status: 'review', title: 'Google Tag Manager mode', detail: 'Check the published GTM container sends events to the verified Joytun GA4 property, without duplicate page views.' }
  if (!analytics.measurementId) return { status: 'review', title: 'Measurement ID missing', detail: 'Configure the approved Joytun web stream before collecting analytics.' }
  if (analytics.measurementId !== JOYTUN_GA4.measurementId) return { status: 'review', title: 'Measurement ID mismatch', detail: 'Website Studio is configured for a different web stream. Verify the destination before changing any settings.' }
  return { status: 'configured', title: 'Verified stream ID matches', detail: 'The Website Studio GA4 ID matches the verified Joytun web stream. Realtime and DebugView checks are still required to confirm event delivery and deduplication.' }
}
