# Joytun marketing measurement — launch handover

Status (9 November 2026): website instrumentation and SEO foundation implemented; GA4 web stream and live data confirmed in Google Analytics Admin; Search Console source is connected to the existing Looker Studio report. Dashboard and event QA are still incomplete. No paid service or ad spend has been enabled by this project. Default collection in source code is OFF; Firestore site settings may override it.

## Account setup (company ownership)
- GA4 standard property: Bangladesh reporting timezone, BDT currency. Confirm an existing property before creating one. Web stream: https://www.joytunchemicals.com.
- Choose direct GA4 or GTM delivery in Website Studio > Analytics settings; never both. Do not add another Firebase Analytics initialisation.
- Verified GA4 property: **joytun-chemicals** (533958329), Web stream **Joytun-web** (14408990486), Measurement ID **G-03P79M8JDL**. Confirm the production Website Studio setting matches. These IDs are public identifiers, not credentials.
- For controlled SPA measurement, `gtag('config', ..., {send_page_view:false})` is already in the website code to suppress automatic config pageviews. **Also disable the optional 'Page changes based on browser history events' Enhanced Measurement setting** in the GA4 web stream after DebugView validation; it can otherwise send duplicate pageviews on React Router transitions. Google does not allow removing the `page_view` Enhanced Measurement option entirely. Disable overlapping enhanced automatic forms/search/video/outbound event options only after checking the explicit event dictionary, privacy policy and actual delivery. Set retention to 14 months if approved and document it.
- GTM option: Google tag with send_page_view=false, advertising signals disabled; custom event trigger restricted to event names below, GA4 event name {{Event}} with corresponding Data Layer Variables. Do not attach an All Clicks trigger or a second history/pageview trigger. Publish only after Preview validation.
- Mark generate_lead as a key event. It fires only after Firestore confirms enquiry creation. This is an enquiry, not a sale, completed phone call or qualified lead.
- Register event-scoped custom dimensions section_id, item_id, item_brand, item_category, form_id, contact_method and video_id as needed (avoid registering redundant built-in dimensions).
- Microsoft Clarity free project: website domain, strict masking, mask all form inputs, exclude admin paths. Enable only after consent and masking tests. Website code gates script injection until consent.
- Search Console: prefer domain property after DNS verification. Submit https://www.joytunchemicals.com/sitemap.xml. Inspect /brands/nolive, /brands/rio and representative product pages. Do not claim indexing/ranking from sitemap submission alone.

## Event dictionary
page_view: canonical page_path and sanitized page_location, no free-text search/query or fragments. SPA query changes alone do not create new views unless allowed campaign labels differ.
section_view: section_id, once per route observation after at least 10% of section intersects the viewport continuously for 1 second in a visible tab. It is exposure, not proof of reading.
select_content: product card item_id and originating section_id. Marquee presentation clones are excluded.
view_item: product details opened, item_id/item_brand/item_category; once per mounted product view.
category_select: explicit category selection, category_id.
contact_click: phone/email method; never actual contact value. Not a completed call/email.
form_start: first focus in an enquiry form after analytics consent.
generate_lead: successful enquiry saved, form_id and optional item_id.
form_error: failed submission, generic error_type only; never error text or form values.
video_open: modal opened, video_id. Not a play.
video_start: actual playback state, once per modal.
video_progress: accumulated visible playback reaches 25/50/75% of duration; seeks are not counted as watched time.
video_complete: player reaches ended state. Not a guarantee every second was watched.

## Verification before enablement
1. No tracking requests before consent or after decline; recorded preferences persist.
2. Accept -> one page_view, direct route changes -> one each; automatic GA4 pageview measurement disabled.
3. Admin, preview and internal test browsers excluded; normal visitors not excluded.
4. Open a product from each marquee row: one select_content, one view_item.
5. Test successful enquiry against an explicitly marked test record; do not create production fake leads accidentally. Failed submissions never emit generate_lead.
6. Check four YouTube starts/progress/completions; modal open alone emits no video_start.
7. Inspect DebugView payloads: no names, email addresses, phone numbers, messages or unfiltered URLs.
8. Confirm Clarity masks forms before enabling recordings.
9. Compare Realtime and next-day reports. Consent/ad blockers mean observed users are not a census.

## No-cost management report specification
Use native Google Analytics and Search Console connectors in Google's reporting tool (no paid third-party connector).
Page 1: GA4 total users, sessions, engaged sessions, successful enquiries and enquiry sessions / sessions. Compare preceding equal-length period. Avoid labelling total event count / sessions as session conversion rate.
Page 2: session source/medium/campaign, landing page, device, product item_id and section interactions.
Page 3: Search Console query/page impressions, clicks, CTR, average position. Separate branded and non-branded queries; keep GA4 users and GSC clicks separate.
Page 4: OVC starts, progress and completions by video_id; link to YouTube Studio for platform-wide views/watch time.
First 28 complete days are the baseline. Weekly review: errors, top products, missed enquiries. Monthly report: result, evidence, decision, next action. No invented historical numbers or rank guarantees.

## Campaign convention
Lowercase ascii labels, underscores, consistent source/medium. Example: source=facebook, medium=organic_social, campaign=nolive_launch, content=lavender_ovc. Use paid_social only for real paid campaigns. UTM builder is in /admin/marketing. Never add UTM to internal website links or include PII in labels.

## Privacy and rollout
The site's new /privacy text describes actual instrumentation, not a legal certification. Company should confirm contact and enquiry retention practices. No new data warehouse, server-side paid hosting, BigQuery billing, paid analytics plan, paid connector or paid ads are required by this implementation.

## Authenticated provider audit — 9 November 2026
- Signed-in GA4 web stream Joytun-web is receiving events; GA4 7-day home showed 2 users, 2 sessions and 6 views. This small sample is not a full visitor census and cannot justify growth claims.
- Looker Studio report: https://lookerstudio.google.com/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be
- Native free Search Console site-impression data source for https://www.joytunchemicals.com/ is added to the report. A second report page, 'Google Search Performance', has a Search Queries table configured with Query, Clicks, Impressions, Site CTR, Average Position; Clicks descending; last 28 complete days. Verify all columns actually render and apply the final visual QA.
- Existing Google Analytics native connector is correctly connected to property 533958329. Refresh Fields / Reconnect found no connection changes, and the data source's full field list explicitly confirmed **Sessions, Total users, Views and Date** with correct numeric/date types. Initial report-level field browsing had missed them; the GA4 connector selects a property, not a particular stream. Do not create a third GA4 data source. The new separate GA4 report page is not yet complete and must not be presented as a finished dashboard.
- Only 2 GA4-sourced copies were observed during audit. Avoid adding another duplicate source until the existing sources are inspected/reconciled; never delete a source that charts depend on.
- Unresolved: reliable GA4 users/sessions/engaged sessions/Views scorecards, working global date control, dashboard layout QA, GA4 DebugView single pageview per navigation, verified lead events and Clarity consent/masking checks.
- Read-only verified identifiers can be shown in authenticated admin. Never expose OAuth access tokens, service-account JSON, credentials or private provider data in public Firestore or client bundles.

## Section exposure accuracy (code QA)
- Require IntersectionObserver intersectionRatio >= 0.1 **and** isIntersecting and visible document tab before beginning the existing one-second section_view timer. The older observer could count any intersecting sliver even when less than 10% was on screen.
- These are visibility exposures, not evidence the user read the section. Check in a browser at common desktop/mobile viewport sizes and confirm hidden tabs never trigger. Do not treat raw event counts as unique visitors or conversions.

## Enquiry conversion integrity — November 2026
- Active customer-facing Contact and Product Enquiry forms use the same testable submission coordinator. Rapid repeated clicks while a request is pending cannot produce multiple Firestore writes from the same open form, nor duplicate a generate_lead event.
- Send the existing GA4-recommended `generate_lead` event *only after* Firestore confirms the record was saved, once per completed form submission. A failed write emits only `form_error`; it permits a retry. Analytics transport failure must not show a false save failure to the user.
- Every analytics payload stays on the strict event-parameter allowlist: `form_id` and optional approved SKU `item_id`; no names, emails, phone numbers, address, quantity, message, Firestore document ID, or raw referrer/query content.
- This is **in-tab single-flight protection**, not database-wide duplicate prevention. Repeated independent submissions, browser refreshes, multi-tab sends, service retries and malicious clients still need backend deduplication/rate controls if those become real business problems. Do not claim server-side exactly-once processing.
- The `generate_lead` event is **not** a sale, a qualified lead or a verified marketing conversion until GA4 Realtime/DebugView confirms receipt and the property marks that event as a key event. Check GA4 Admin → Events/Key events; avoid creating a second generate_lead transformation from enhanced `form_submit`.
- Manual verification (without writing fake leads to production): use an explicitly approved test environment or an agreed labeled test record; reject double click while submitting; force a controlled Firestore permission failure to check no lead event; confirm one successful Contact and Product form event in GA4 DebugView; compare to the Inbox counts and reconcile consent blockers.

## First-party product enquiry trend
- The authenticated Admin Analytics section additionally ranks **Top enquired products (last 28 days)** from saved `orders` documents where `type=product-enquiry`, grouping by approved `productId` and using valid `createdAt` server timestamps only.
- It shows a product's approved name, variant, format, and saved enquiry count; it never displays visitor contact details in the ranking. Records without timestamps or outside the interval are excluded.
- These are not GA4 product views, conversion session rates, unique customers, revenue, orders completed, qualified leads, or search-attributed leads. Firestore subscribers already used for admin inbox supply these records; no new paid reporting APIs or additional public Firestore read access is required.
