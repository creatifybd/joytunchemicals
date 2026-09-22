# Joytun website redesign — September 2026

## Reference study

The live sites were reviewed for navigation, hierarchy, imagery and computed font families on 21 September 2026.

| Reference | Observed typography | Useful design principles |
| --- | --- | --- |
| [Unilever](https://www.unilever.com/) | UnileverDesire, with system fallbacks | Strong brand hierarchy, editorial storytelling, prominent lifestyle and product imagery, grouped navigation. |
| [Henkel](https://www.henkel.com/) | Henkel GT Flexa VF and Segoe UI fallbacks | Clear corporate information structure, readable headings and distinct business sections. |
| [method](https://methodproducts.com/) | Haffer / Haffer XH | Large product photography, confident display type, approachable category navigation and fragrance-led product discovery. |

Joytun uses its own identity: the original logo, navy and botanical green, warm off-white, original product mockups, Manrope Variable headings and DM Sans Variable body text. Fonts are self-hosted through Fontsource; no competitor images, logos or proprietary fonts are reused.

## Product selection

The archive contains 24 PNG files and two JPG files. The two JPGs repeat the Vix Lemon and Orange liquid bottles. The pink and blue baby detergent PNGs are excluded. The remaining 22 original PNGs are published without any byte changes.

The catalogue has three laundry products, eight hand wash variants/formats, six dish-care products, two floor cleaners, two glass cleaners and one toilet cleaner. Product spellings follow the supplied artwork, including Layzen and T-Flush.

`src/data/product-assets.json` records the archive filename, dimensions and SHA-256 for every published image. The automated test verifies these against the actual PNGs.

## Product data and administration

The approved catalogue ships with the site, so it is available on the first render. The six previous generic Firestore family cards are replaced by individual variants. Admin edits save an override under the stable product ID. Archiving an approved product hides it without letting the bundled default reappear. New products created in the admin remain supported; baby products remain excluded from this release.

No existing Firestore records were deleted or seeded during deployment. Existing orders and messages remain available only to signed-in administrators. The product enquiry and contact forms retain the existing Firestore submission integration.

## Interaction and accessibility

- Search by product, fragrance and format; category filters and A–Z sorting.
- Shareable product query URLs, variant selection, product enquiry and a labelled contact form.
- Keyboard focus indicators, skip link, modal focus management and Escape dismissal.
- Mobile navigation, responsive product grids, lazy-loaded product images and self-hosted fonts.
- Restrained entrance and hover transitions; reduced-motion preferences respected.
- No invented sales figures, certifications, testimonials or customer counts.

## Checks

Run `node --test tests/*.test.js` and `npm run build`. The existing Hostinger action also verifies that the published pages and built JavaScript/CSS match the current release.
