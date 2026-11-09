# JOYTUN — Master SEO, Analytics & Growth QA Checklist
Owner: Joytun Chemical Industries OPC • Last reviewed: 2026-11-10 (Bangladesh)
Canonical: https://www.joytunchemicals.com
GA4 property: 533958329 • Web measurement: G-03P79M8JDL
Existing Looker Studio: https://lookerstudio.google.com/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be

## Meaning of status
- **DONE / AUTOMATED:** source implementation is finished and covered by reproducible tests; a green deployment also verifies public routing after publish.
- **LIVE VERIFIED:** published release and HTTP response verified by a real production job.
- **NEEDS PRIVATE PROVIDER QA:** only a signed-in Google / Clarity account can confirm; an unknown is *not* a pass.
- **ONGOING EXTERNAL:** search indexing, impressions, CTR, ranking, visitor behaviour depend on independent platforms and elapsed time. Never call these "complete" or promise ranking.
- **NOT IN SCOPE / PAID:** no payments, paid connectors, ads, premium subscriptions or unauthorized OAuth grants.

## A. Public website and SEO (zero cost)
| Item | Status | Definition of done / evidence |
|---|---|---|
| Exact original product art and approved 24 SKUs | DONE | Approved product image assets untouched; 24 canonical pages included |
| Seven non-branded search-intent pages | DONE | `/care/` pages have bilingual human-readable information and correct product links |
| 24 product page canonical, meta description and Product schema | DONE / AUTOMATED | PHP+JS SEO regression tests and new public SEO auditor |
| Care guide JSON-LD / breadcrumb relationships | DONE / AUTOMATED | Home > Our products > individual care/product URL tested |
| Product-to-category guide internal links | DONE / AUTOMATED | Product details server HTML and React contain correct contextual links |
| robots.txt and XML sitemap | DONE / AUTOMATED | 38 baseline public URLs with 24 product image sitemap references |
| Public website canonical/metadata/structured-data audit | DONE / AUTOMATED | Every canonical public page checked; failures flag a red GitHub Action |
| Daily autonomous free external health check | DONE / AUTOMATED | GitHub Actions cron + manual dispatch; checks 38 public pages & sitemap |
| Post-deploy public audit | DONE / AUTOMATED | Production job fails when canonical, page availability, robots or schema breaks |
| Google Search Console initial property/sitemap | DONE previously | Original native submission Success in provider; confirm new last-read externally |
| New seven guides + two baby SKUs indexed | ONGOING EXTERNAL | Check 9 URLs individually in Search Console; never infer indexing from Sitemap Success |
| Organic positions for "hand wash", "dish wash", etc | ONGOING EXTERNAL | Monitor 28-day GSC non-branded query/page performance; no guaranteed ranking |
| Content authority and useful FAQ | ONGOING EDITORIAL | Product-label facts and authentic specs only, no invented price/sales/rating/best claims |
| Google Image search / rich results | ONGOING EXTERNAL | Test live fetchable original image links and structured data; Google decides presentation |

## B. Measurement and privacy
| Item | Status | Definition of done / evidence |
|---|---|---|
| Verified GA4 property and web stream | DONE previously | GA4 533958329 / G-03P79M8JDL |
| Consent gating / admin & preview exclusion | DONE / TESTED | `trackingAllowed`, consent UI, auto exclusion and event allowlist tests |
| GA4 browser-history duplicate pageview setting | DONE previously / PROVIDER VERIFIED | Optional history-change pageviews OFF and saved; page-load measurement left ON |
| Product `view_item` events not lost before tag startup | DONE / AUTOMATED | Only mark tracking-ready once the Google queue / GTM layer exists; tests ensure fail-closed behaviour |
| `generate_lead` on confirmed saved enquiry only | DONE / AUTOMATED | Existing single-flight submit helper and success/failure tests |
| Private contact / product enquiry counts | DONE / AUTOMATED | Firestore authorized admin inbox, loading / error states, timestamped records |
| Top enquired products, last 28d | DONE / AUTOMATED | Aggregates saved Firestore records; never claims sales or keyword-attributed leads |
| 10% visibility for one-second `section_view` | DONE / AUTOMATED | Visibility ratio >= 0.1, not hidden; tests |
| GA4 DebugView: one page_view per navigation | NEEDS PRIVATE PROVIDER QA | Explicitly test first load, SPA navigation, consent, and no double fire |
| GA4 DebugView: generate_lead receipt | NEEDS PRIVATE PROVIDER QA | Safely test valid submission without fake production leads |
| GA4 `generate_lead` designated a Key Event | NEEDS PRIVATE PROVIDER QA | Verify GA4 Admin key event setting; don't assume |
| Clarity recording, input masking and consent | NEEDS PRIVATE PROVIDER QA | Open Clarity project, verify sample *consented* recording and masking; admin traffic excluded |
| GA4 Total users, engaged sessions, Sessions chart | NEEDS PRIVATE PROVIDER QA | Existing native connector 533958329; manual source/metric/date QA in Looker Studio |
| GA4 time-series metric / date filter | NEEDS PRIVATE PROVIDER QA | Check actual Sessions by Date field, avoid mislabeled Views and duplicate connectors |
| GSC report query CTR & average position layout | NEEDS PRIVATE PROVIDER QA | Visual, signed-in Looker Studio check; source connected previously |
| Admin Analytics browser UI (mobile/desktop) | NEEDS AUTHENTICATED VISUAL QA | Firestore permissions, actual records, consent, load errors, layout |
| Raw GA4/GSC data in custom React cards | NOT IMPLEMENTED | Requires authorized server API and secure OAuth; existing private Looker Studio embed is the free, no-credential client solution |

## C. Operations, regression gates and review
| Item | Status | Definition of done |
|---|---|---|
| Unit tests, PHP syntax and production Vite build | DONE / AUTOMATED | Required before production push |
| FTP publication and release-marker verification | DONE / AUTOMATED | GitHub Actions verifies live marker and built JS/CSS |
| Public SEO page HTTP/content post-deploy check | DONE / AUTOMATED | All expected public routes; test failure blocks green release |
| 28-day organic discovery/engagement baseline | ONGOING EXTERNAL | Keep one 28-complete-day baseline, then compare honest changes |
| Privacy and permission discipline | DONE / DOCUMENTED | No names/phones/emails in GA4 event values; no tokens in public bundle |
| Zero-cost-first policy | DONE / DOCUMENTED | No paid connectors, top-ups, ads, billing or new subscriptions |
| Real user QA and final cross-device preview | NEEDS REAL BROWSER QA | Verify signed-in analytics and live mobile interactions before declaring visual perfection |

## What is verifiable automatically vs externally
**An automated successful build or HTTP response does not prove** Google has indexed new pages, that GA4 has received all events, that Microsoft Clarity recordings are correctly masked, or that a Looker Studio chart uses the intended metric. Those require provider data, real browser QA, and sometimes time. They remain explicitly open, rather than being mislabeled as complete.

## No-repeat workflow
- All future technical changes should update this checklist and the GitHub issue tracker before/after release.
- CI checks the latest source, deploy checks built assets and public URLs; a **scheduled daily health job** can detect regressions without another chat prompt. Scheduled GitHub Actions are dependent on GitHub scheduling/notifications and do not represent an always-on ChatGPT process.
- Public sitemap audit failure is actionable; inspect the GitHub Actions log rather than claiming invisible ranking improvements.
- Recheck the official Google and Clarity reports when an authenticated browser session is available **without requesting a paid tool or guessing results**.
- Keep Product artwork byte-for-byte original, all claims verifiable, and no paid integrations without approval.
