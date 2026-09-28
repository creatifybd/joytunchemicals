# Category hero release

Six backgrounds generated using the built-in image generation tool, then converted to WebP (quality 86). Original product PNGs are separate unmodified HTML image layers, never regenerated or composited into the AI background.

Assets: `public/images/banners/{laundry,hand,kitchen,floor,glass,bathroom}.webp`.

Prompt set: premium photorealistic 16:9 household-care campaign backgrounds; uncluttered light left half for HTML headlines, empty foreground surface for original products, realistic soft daylight, no text, logos, people or product packaging. Category-specific scenes:
- Laundry: sunlit laundry room, pale blue and ivory, folded towels, pale stone counter.
- Hand: ivory and lavender spa washroom, basin and lavender stems at far right, travertine counter.
- Kitchen: sunlit ivory kitchen, dishes and lemons at far right, pale stone counter.
- Floor: low view of sage contemporary living room, clean reflective stone floor, sofa at far right.
- Glass: clear floor-to-ceiling windows, blue sky and garden, pale ivory wall and stone ledge.
- Bathroom: ivory and aquamarine bathroom, wall-hung toilet in far right background, empty stone ledge.

Studio: Hero banners controls title, category, background URL, enabled state, original product selection (1–4) and ordering. Slideshow settings controls autoplay and timing (5–20 seconds); additional collections can optionally be restored. Existing saved settings merge into new fields without overwriting old content. Preview and revision-checked publishing use the existing studio flow.

Carousel pauses for hover, focus, manual navigation, hidden document and reduced motion; manual play/pause and touch swipe supported. Category controls and previous/next are native keyboard accessible buttons. Smaller screens stack title and original product group; navigation becomes a three-column grid.

Validation: npm test, npm run build. Authenticated publishing and real mobile-device verification require a suitable signed-in session/device.
