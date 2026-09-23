# Joytun Website Studio

The public website and admin editor share one versioned content model. Sign in at `/admin/login` using an already-authorized Google account. The existing Firebase authentication and Firestore authorization requirements are unchanged.

## Content management

Open **Website studio** to manage brand/contact information, navigation, homepage copy and section order, hero collections, categories, featured products, story content, purpose statements, contact text, FAQs, the partnership banner, typography, colors, motion and page SEO.

- **Save draft** stores the current website draft only in this browser. It does not publish.
- **Preview** opens the public layout using that browser's draft. Preview pages are excluded from indexing.
- **Publish changes** saves one atomic revision to `settings/company.website`. Another editor's newer revision cannot be overwritten silently.
- **Reload published version** discards local edits after confirmation. **Restore browser draft** restores a saved draft.
- Public pages subscribe to published content. The Hostinger HTML renderer refreshes its public content cache approximately every 30 seconds.

The single approved company location is **Kanchpur, Sonargaon, Narayanganj, Bangladesh.** It is intentionally fixed in the editor and rendered consistently in contact details, the footer and structured data.

## Products and conversations

Products have brand, type, variant, pack format, category, display order, description, features, usage instructions, original images and per-product search metadata. The first image is the cover. Uploaded originals are not cropped. Published products use `/products/<slug>`; keep existing slugs stable to preserve links. Archiving hides a product and remains reversible; restoring creates a draft.

Product enquiries and contact messages have new, in-progress and resolved statuses. No automatic customer reply is sent by changing a status.

## Search foundations

Hostinger's PHP entry point renders page titles, descriptions, canonical URLs, Open Graph/Twitter cards, Organization/WebSite/WebPage, breadcrumb and product JSON-LD, and initial page content before JavaScript. Public content reads use Firestore REST and existing public security rules; no privileged credential is stored in PHP. Dynamic `/sitemap.xml` lists current published products and public pages. Search queries, draft previews, admin pages and missing pages are excluded from indexing. Missing public routes return HTTP 404. Structured product data does not invent reviews, prices or stock availability.

Search Console verification and submitting the sitemap require access to the company's Search Console property; they are separate from deploying these technical SEO features.

## Release checks

`npm test` verifies catalogue preservation, content merging, safe links, SEO routes and deployment integrity. PHP integration checks run when PHP is available (required in the GitHub Actions deployment gate). `npm run build` generates production assets and SEO defaults. GitHub `main` deploys to the existing Hostinger destination.

## Reference-led visual update

The corporate presentation follows the visual direction requested from Believe International: Metropolis geometric typography, restrained Birthstone script accents, full-width lifestyle photography, image-led story sections, generous spacing and soft asymmetric corners. The source reference was inspected on 2026-09-23; its pharmaceutical claims, facilities, imagery and copy were not reused.

Two illustrative home-care photographs were created with the built-in image generation tool and integrated as optimized WebP assets:

- `public/images/lifestyle/family-home.webp`: a Bangladeshi family at home, grouped on the right with open space on the left for the existing headline.
- `public/images/lifestyle/hand-washing.webp`: close-up of two hands being washed with soap at a residential basin, natural light, neutral and olive palette.

Both prompts specified realistic editorial photography, correct anatomy, no logos, no text, no products and no invented facility/employee depiction. The original 22 supplied product PNGs remain byte-for-byte unchanged. Administrators can change lifestyle image URLs and alt text in **Lifestyle imagery**. Font license notices are distributed under `/licenses/`.
