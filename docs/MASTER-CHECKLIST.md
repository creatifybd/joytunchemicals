# Joytun Digital Growth — Master Execution & Verification Checklist

**Owner:** Joytun Chemical Industries OPC  
**Repo:** https://github.com/creatifybd/joytunchemicals  
**Public site:** https://www.joytunchemicals.com  
**As of:** 9 November 2026  
**Constraint:** Free tools only; preserve all 24 approved product images, text, shapes and brand artwork unchanged. Never fabricate rankings, conversions or traffic.

This is the single authoritative checklist for future continuation. A checked task means the specified **code or platform state** was verifiably delivered; it does not silently include Google ranking, signed-in visual QA or traffic attribution. Review automated checks regularly. Never treat a successful deploy as proof every third-party system received events.

## 1. Crawlability, products and SEO

- [x] 24 individual, approved product URLs and server-rendered Product JSON-LD; 7 distinct, bilingual care-topic guides and matching CollectionPage markup.
- [x] Canonical URL and noindex for missing, preview and admin pages. Meaningful Home > Products > Product/Care-guide BreadcrumbList structured data.
- [x] Product pages link to relevant care guides and vice versa, including PHP crawler HTML, with no changes to original packaging/image files.
- [x] Sitemap with canonical approved URLs and product image entries; known baseline 38 URLs. Accurate public robots.txt now declares the sitemap and leaves noindex routes crawlable.
- [x] Automated public-site monitor tests sitemap, robots, 38 expected routes, canonical, metadata, headings, product schema, breadcrumb hierarchy, 24 product image resources, admin noindex and real 404.
- [x] Daily scheduled **Live Website SEO Health** GitHub Actions workflow (03:17 UTC = 09:17 Bangladesh) and recheck after successful production deploy.
- [x] Free IndexNow ownership-key proof and webhook/dispatch workflow for Bing and participating engines. Only notify on content-relevant deployment changes; initial full batch can be dispatched once. HTTP 200/202 confirms receipt/pending verification, **not indexing**.
- [ ] Confirm Google has crawled and indexed each of 7 care guides + 2 new baby detergent products using an authenticated **Search Console URL Inspection** report. The prior 7 November snapshot cannot verify pages added 9 November. Google does not participate in IndexNow and does not guarantee indexing or ranking.

## 2. Measurement, enquiries and privacy

- [x] Confirmed GA4 property ID `533958329`, website stream `G-03P79M8JDL`, and prior site traffic in an authenticated GA4 inspection.
- [x] **Page changes based on browser history events** was disabled, saved and reopened in the verified GA4 stream on 9 November, preventing one known source of duplicated SPA pageviews.
- [x] Consent gating, admin/internal/preview exclusions and approved event-field allowlist in website code.
- [x] Tracking-ready signal now fires only after gtag/GTM event queues exist; `track` does not claim an event was queued when the sender is absent. Code-level tests cover this guard. Local queue success does not prove Google receipt.
- [x] Contact and Product Enquiry forms use single-flight submissions; Firestore save success precedes one best-effort `generate_lead` event. Failures permit retry and send no lead. Customer inputs and raw query data never become event parameters.
- [x] Authenticated Admin Analytics counts stored contact messages and saved product enquiry records with a 28-day timestamped window; loading/access failures are never misreported as zero.
- [x] Top 5 product interest **by saved product enquiry** is shown without customer contact fields. These are not views, unique customers, purchases, verified qualified leads or attributed SEO conversions.
- [ ] Confirm one actual page_view per consented navigation and one generated lead per *controlled* successful enquiry in GA4 DebugView / Realtime, with no personally identifiable event payload.
- [ ] In the correct GA4 property, verify `generate_lead` as a **key event** and ensure no competing enhanced `form_submit` transformation duplicates it. Do not fabricate live customer submissions for this test.
- [ ] Verify Clarity consent, strict mask/recording, absence of sensitive form inputs, and admin/internal visitor exclusions via account's session reports.

## 3. Admin reporting

- [x] Admin Analytics hub links/embeds the existing private Looker Studio management report without exposing reporting tokens or keys.
- [x] Native free Google Search Console connector added; page for Search Query, Clicks, Impressions, CTR and Average Position configured.
- [x] Existing GA4 property has Sessions, Views and 1-day active users scorecards; **1-day active users is not Total users**.
- [ ] Resolve/inspect unverified GA4 time-series chart metric, add the real Total users and Engaged sessions (if compatible), date controls, finish page styling and confirm real chart rendering in the user's authenticated report.
- [ ] Verify protected Admin Analytics with real Firestore records on mobile and desktop, including account permission and error states. Code tests do not substitute for signed-in browser QA.
- [ ] Confirm Google Search Console indexing and branded/nonbranded keyword baselines, plus GA4 lead attribution. Never assert traffic/ranking uplift without provider reports.

## 4. Testing and operations

- [x] Existing GitHub Actions quality gate: PHP syntax, Node tests, production Vite build; deployment flow uploads assets and verifies release marker.
- [x] Headless browser test script covers desktop 1440px and mobile 390px, selected public guides/products, images, admin login noindex, key headings, and no pre-consent tracking requests; stores screenshots for review.
- [x] Weekly **Public Browser UX Check** job (Monday 04:42 UTC = 10:42 Bangladesh) plus PR-time browser checks. Availability depends on GitHub Actions runner and third-party website reachability; inspect actual first run before claiming browser QA passed.
- [ ] Confirm first live SEO-monitor run has **passed** after this release; resolve any discovered content/indexability defects.
- [ ] Confirm first IndexNow submission returned HTTP 200/202 and ownership proof was accepted; do not claim Bing/Yandex indexing.
- [ ] Confirm first real browser audit passed, inspect screenshots and mobile layout; remedy detected issues.
- [x] Build and deployment workflow preserves original product artwork; no new paid analytics/hosting connectors or subscriptions.

## Non-automatable provider controls

Search Console's URL Inspection/indexing, private GA4 DebugView/key events, Looker Studio field selection and Clarity recording/privacy QA require an authenticated browser or officially authorized API. No secure Google reporting OAuth or private Analytics API credentials are embedded in this public React app. The earlier browser automation wallet reported insufficient balance; do not purchase credits or silently substitute unsafe publicly readable provider APIs. These tasks must remain **unchecked** until independently verified.

## Release sign-off

A release can be called **deployed** when GitHub's production workflow finishes with success and the published release marker and assets match. Call a browser/UI or third-party integration **verified** only after its distinct test passes. IndexNow and sitemap receipt provide discovery signals but never guarantee Google/Bing indexing or search ranking.
