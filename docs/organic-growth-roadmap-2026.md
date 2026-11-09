# Joytun Organic Growth & Measurement Roadmap
Updated: 2026-11-09
Owner: Joytun Chemical Industries OPC
Production: https://www.joytunchemicals.com

## Evidence and baseline
- April 2026 Euromonitor Bangladesh Laundry Care report: Unilever Bangladesh 58%, Kohinoor Chemical Co (BD) Ltd 8%, Square Toiletries 4% market share for **2025 laundry care** (not the broader cleaning market): https://www.euromonitor.com/laundry-care-in-bangladesh/report?id=823779&recid=9492640378310
- Source is a market-research report summary, **not** evidence of competitors' SEO traffic, technology stack, conversion, analytics capabilities, or advertising spend.
- Without an exported Search Console performance report, GA4 report and brand search baseline, no organic traffic or ranking uplift can be claimed.

## Current production baseline (audit, 9 Nov 2026)
- GitHub source: 24 active approved SKUs, site-rendered metadata for products, image entries in sitemap, two brand landing pages, initial consent-gated analytics and a Marketing configuration workspace.
- No fabricated review count, price, availability, best-in-market statement, or sales claim.
- Google Search Console verification tag is present on home HTML; successful GSC ownership confirmation must be checked in the logged-in property.
- Work conversation reports GA4 on Looker Studio report 6834aed1-7c9a-4f89-a948-9c5d0365b6be, but charts and GSC connector are not yet confirmed.
- Clarity project and masked configuration were set up, but live consent, recording and admin exclusion still need real-device verification.

## Step 1 — technical discovery and site quality (no cost)
- Seven generic-category guides targeting natural searches with distinct, useful user-facing bilingual information and links to approved products.
- Unique canonical URLs, server-rendered metadata and content, schema.org CollectionPage and crawlable Product links.
- Sitemap includes new routes. Search/filter/draft/admin URLs remain noindex; unknown pages return 404.
- Keep approved original product art intact, avoid duplicate thin pages, avoid unverified performance claims.
- Verify with PHP renderer test, sitemap check, production build, and manual mobile QA before deployment.

## Step 2 — first-party analytics (no paid tools)
- In admin analytics, link existing GA4, Search Console, Clarity and private Looker Studio report; embedding is convenience, not provider API data integration.
- Final desired private dashboard:
  (a) GA4 users, sessions, engaged sessions, traffic source/medium, landing page, device;
  (b) Search Console query/page impressions, clicks, CTR, average position, brand/non-brand segments;
  (c) website product interest and successful enquiries using approved event dictionary;
  (d) YouTube video starts/progress/completions from *website events*; YouTube-channel stats link separately;
  (e) Clarity consented heatmaps/session replays, masked and excluding admin/test.
- Provider data should come from native connectors or securely authorized server-side API calls; never expose service-account keys, OAuth refresh tokens or sensitive reporting exports in client-side Vite bundles or public Firestore documents.
- Native Looker Studio GA4/GSC connectors are preferable to paid third-party connectors for a first release.
- Ensure analytics collection is explicitly consented, correctly attributed and produces no PII or false conversions. DebugView, realtime and next-day checks are mandatory.

## Step 3 — content authority & search expansion (no paid promotion)
- Add only genuinely helpful content: original approved product specifications, actual pack sizes, material/usage details, verified FAQ, verified product imagery and Bangla/English terminology.
- Prepare approved product pages for Google Images and discoverability; use meaningful file names and alt attributes, image sitemap and reliable image URLs.
- Add connected educational pages when supported by a real user need, e.g. safe cleaning practice and how to choose a pack format, not dozens of near-duplicate keyword-stuffed pages.
- Google Business Profile only if the company qualifies and account access is authorized; ensure single approved location.
- Cross-link relevant official YouTube video descriptions, Facebook posts and the appropriate category/brand/product URLs using honest campaign UTMs.

## Review cadence and KPIs
First 28 complete days: record baseline without interpreting any uplift.
Weekly: GSC newly indexed pages and exclusions, branded/non-branded clicks, top query/page pairs, product page errors, enquiry event receipts.
Monthly: GA4 sessions, engaged sessions, traffic acquisition, GSC impressions/clicks/CTR/position, product enquiry success, landing-page-to-enquiry sessions where data allows.
Avoid simple event-count/sessions as a substitute for conversion session rate. Interpret low sample sizes carefully. Account for consent loss and blockers.
Investigate technical issues before adjusting copy. Keep before/after deployment and Search Console evidence.
Security and privacy: masked sessions, minimal client event payloads, role-limited dashboard access, no sensitive key leakage.

## Unsupported claims and constraints
- Organic rankings, indexing, Search features, traffic, market share and conversions cannot be guaranteed, and are not instant.
- Google Product markup alone does not secure a Shopping/Merchant listing. Availability, price, reviews or offers must never be invented.
- Google free APIs have quotas; no billing or paid connectors should be added without explicit approval.
- Do not publish this branch to production until the review checks pass.
