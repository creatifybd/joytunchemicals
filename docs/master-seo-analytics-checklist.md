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
| On-demand public SEO QA (development/testing only) | DONE / MANUAL | Scheduled cron removed for Actions-policy caution; run manually only when validating an approved change. Production release automatically tests the 38 pages and 24 product assets |
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
| GA4 ecommerce-compatible item selection | CODE IMPLEMENTED / PRIVATE QA PENDING | Product detail `view_item` and clicked product `select_item` include Google-recommended `items:[{item_id,item_name,item_brand,item_category,item_variant}]`. Direct GA4 and GTM delivery is unit-tested. Actual receipt and item reports need authorized GA4 Realtime/DebugView verification. |
| Product click measurement source | CODE IMPLEMENTED / PRIVATE QA PENDING | Genuine product link interactions only, once per click. `select_item` and legacy `select_content` describe the *same interaction*; do not sum their counts. No auto-marquee impressions counted as clicks. |
| Section-level exploration dimensions | NEEDS PRIVATE PROVIDER QA | Create event-scoped custom dimension `section_id` in GA4 only after confirming event receipt. Standard `Item name`/`Item ID` from `items` should be preferred for product reports; no unnecessary duplicate custom dimensions. Custom dimension data may take 24–48 hours to appear. |
| `generate_lead` on confirmed saved enquiry only | DONE / AUTOMATED | Existing single-flight submit helper and success/failure tests |
| Private contact / product enquiry counts | DONE / AUTOMATED | Firestore authorized admin inbox, loading / error states, timestamped records |
| Top enquired products, last 28d | DONE / AUTOMATED | Aggregates saved Firestore records; never claims sales or keyword-attributed leads |
| 10% visibility for one-second `section_view` | DONE / AUTOMATED | Visibility ratio >= 0.1, not hidden; tests |
| Products, About, Contact and care-guide section coverage | CODE IMPLEMENTED / PROVIDER QA PENDING | First-party `data-section` instrumentation covers catalogue, product detail, contact details/FAQ, story, gallery, brand and care-guide blocks. Existing consent-gated IntersectionObserver emits `section_view` only after 10% visibility for 1s. Source-level tests verify markers; receive/reporting status needs authorized GA4 account. Event catalog: `docs/ga4-event-measurement-map.md`. |
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
- PR quality checks test new code; production releases verify built assets and all public URLs. The former daily scheduled crawler was deliberately removed on 10 November 2026. Manual public SEO QA is for active development/troubleshooting, never unattended general monitoring.
- Public sitemap audit failure is actionable; inspect the GitHub Actions log rather than claiming invisible ranking improvements.
- Recheck the official Google and Clarity reports when an authenticated browser session is available **without requesting a paid tool or guessing results**.
- Keep Product artwork byte-for-byte original, all claims verifiable, and no paid integrations without approval.

## GitHub account safety / approved usage (reviewed 10 November 2026)
- The old GitHub-hosted **daily cron** was disabled. There are no recurring `schedule:` triggers in the repository's three workflow definitions. The manual public SEO QA command is preserved only for deliberate development/testing.
- `quality.yml` runs once for a relevant pull request; updated pushes cancel superseded in-progress checks. `deploy.yml` runs on a deliberate merge/push to main or authenticated manual dispatch and verifies the live release. GitHub token permissions remain read-only and no additional OAuth tokens or secrets were introduced.
- Never use GitHub Actions to create artificial traffic, inflate analytics/search rankings, scrape GitHub users, continuously poll unrelated third-party sites, send bulk messages, run mining, or host an always-on service.
- Account owner should review **GitHub Settings → Billing and licensing → Usage** and **Repository → Actions** for unusually frequent/unexpected jobs. GitHub can still independently enforce its evolving Terms and Acceptable Use Policies; this setup minimizes risk, not guarantees immunity.
- Official references: https://docs.github.com/en/site-policy/github-terms/github-terms-for-additional-products-and-features and https://docs.github.com/en/site-policy/acceptable-use-policies/github-acceptable-use-policies.
