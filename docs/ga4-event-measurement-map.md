# JOYTUN — GA4 Measurement & Looker Studio Event Map

**State:** Site code instrumentation only. Signed-in GA4/Looker Studio verification remains pending.
**Website:** https://www.joytunchemicals.com
**GA4 Property:** 533958329 · **Web Measurement ID:** G-03P79M8JDL
**Existing Looker Studio:** https://lookerstudio.google.com/reporting/6834aed1-7c9a-4f89-a948-9c5d0365b6be

## Consent and interpretation

Events are emitted **only after a visitor opts into website analytics**, provided Website Studio analytics is enabled, the destination is configured, and the visitor is not an admin or an internal/preview user. Browser tests must not be used to generate artificial production traffic. No names, emails, phone numbers or enquiry messages are sent to GA4 event parameters. This code does not prove that GA4 received any event.

The following metric types must remain distinct:
- **Total users** = native GA4 `Total users` field; never replace with 1-day active users.
- **Sessions** = native GA4 `Sessions`.
- **Engaged sessions** = native `Engaged sessions`.
- **Views** = native `Views`; may include page and screen views.
- **Section views** = count of custom `section_view` events; *not* distinct visitors.
- **Product item views** = `view_item`, with item IDs/names in standard `items` data.
- **Product selections** = `select_item` with item details; the legacy `select_content` can describe the same action and MUST NOT be summed.
- **Saved enquiries** = private first-party Firestore records, separate from `generate_lead` events; successful saves may have no GA4 event if consent is declined.

## Public website event coverage

| Event | Trigger | Parameters | Provider QA |
|---|---|---|---|
| `page_view` | One consented initial load or true SPA route change | `page_path`, `page_location`, `page_title`, `page_referrer` | Check exactly once per navigation in DebugView |
| `section_view` | A marked public section is ≥10% in view for ≥1 second | `section_id` | Confirm received; register event-scoped `section_id` custom dimension **only after** receipt |
| `view_item` | Actual product details opened | GA4-standard `items`, approved item identifiers and labels | Check item reporting uses Item ID/Item name |
| `select_item` | Actual SKU link selected from public catalogue, brand, care guide or homepage | `items`, `section_id`, `item_list_name` | Check Click reporting from **this** event alone |
| `select_content` | Historical SKU link selection | `content_type`, `item_id`, `section_id` | Historical reference only, do not double count |
| `category_select` | User selects category or category CTA | `category_id` | Verify real interactions |
| `form_start` | Focus on contact/product enquiry form, once per form | `form_id` | No form content |
| `generate_lead` | One successful saved contact/product enquiry, only if consented | `form_id`, optional `item_id` | Check actual event, then GA4 Key Event designation |
| `contact_click` | Telephone/email link | `contact_method`, `section_id` | No phone/email value |
| `video_open` and playback events | User opens or watches official videos | `video_id`, playback percentage where relevant | No names or cookies exposed in event parameters |

New static `section_id` values for useful public page areas:
- Products: `catalogue_intro`, `product_catalogue`, `product_detail`.
- About: `about_intro`, `about_gallery`, `about_story`, `about_brands`, `about_purpose`.
- Contact: `contact_intro`, `contact_details`, `contact_faq`.
- Care guides: `care_guide_intro`, `care_guide_products`.
- Brand pages already had `brand_intro`, `brand_products`.
- Homepage has existing `hero`, `brands`, `categories`, `featured`, `ritual`, `story`, `partner`, `videos` blocks.

## Next authenticated GA4 / Looker Studio checks

1. Open GA4 → Reports → Realtime or DebugView with a **consented, legitimately authorized** browser; inspect whether live `page_view`, `section_view`, `view_item` and `select_item` actually arrive. Avoid artificial production leads.
2. GA4 → Admin → Custom definitions: create an event-scoped `section_id` dimension only if the event is arriving and no equivalent definition already exists. Do not fabricate historical section statistics; custom dimensions may take time to process.
3. GA4 → Engagement and Items reports: verify standard Item Name / Item ID dimensions using real `view_item` / `select_item` events. Watch for consent-based lower volumes.
4. Looker Studio report **page 2**: rename to **Website Traffic & Engagement**. From the exact existing GA4 property, create six scorecards for **Total users**, **Sessions**, **Engaged sessions**, **Views**, **Engagement rate**, **Average engagement time per session**.
5. Add GA4 time series with `Date` × `Sessions` or `Total users` and a 28-complete-day date control, then acquisition and page-engagement charts. Confirm report date and metrics in View mode.
6. Preserve page 1 Google Search Performance exactly; do not create a second report or remove existing sources.
7. In the Joytun admin dashboard, the authenticated Looker Studio report can already be opened or embedded. Do not put GA4 OAuth/service-account secrets in the public React bundle.

## Known constraints

- Consent gating can reduce visible GA4 data relative to all website visits.
- Google Analytics Enhanced Measurement `Page changes based on browser history events` must remain disabled when manually tracking SPA `page_view` to avoid duplicates; validate in signed-in GA4.
- Item selection and form-success events have different meanings. Do not infer sales or orders from a click.
- A green GitHub build or browser test verifies implementation, **not Google delivery**.
- No paid browser credits, new billing, subscriptions, fake conversion tests or recurring GitHub Actions schedules are allowed.

**Official references:**
- https://developers.google.com/analytics/devguides/collection/ga4/views
- https://developers.google.com/analytics/devguides/collection/ga4/ecommerce
- https://support.google.com/analytics/answer/14239696
