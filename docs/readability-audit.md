# Website readability audit — 23 September 2026

## Findings and changes
- Measured public product-page navigation at 13px, detail helper text at 9px, footer legal text at 10px. Public body copy now 16–17px, metadata 13–15px, section labels 12px. The compact logo subtitle remains 9px.
- Mobile theme rules reduced some category labels to 8px and descriptions to 10px. Category cards now use normal document flow; captions cannot collide with absolutely positioned images. Single-column category cards at 600px and below.
- Four product columns were cramped near laptop/tablet widths. Added 4/3/2/1-column breakpoints (1100/900/400px); text is never reduced to fit the grid.
- Footer location was hidden below 900px. It is now visible at every breakpoint.
- Dark partnership panels inherited dark heading text. Explicit white heading, readable body and high-contrast focus outlines now applied.
- Header navigation now switches to a keyboard-accessible menu at 1100px; expanded menu traps focus, supports Escape and restores focus. Query navigation closes menus without scrolling on every search keystroke.
- Inputs remain at least 16px; buttons and icon controls are at least 44px. Forms stack on phones. Category filters wrap instead of hiding options off-screen.
- Product galleries/dialogs stack at 900px, wrap thumbnails and support viewport-height scrolling. Long contact details and managed content wrap.
- Existing lifestyle images and original product PNGs retained. No additional marketing copy introduced.
- Admin field labels, controls, help text and product cards enlarged; editor actions wrap and the mobile toolbar no longer consumes sticky viewport space.

## Verification boundary
Build and automated catalogue/content/deployment tests run before publishing. The PHP integration test runs in CI (PHP unavailable locally). Public desktop browser review covers home, catalogue, detail, about and contact with measured computed text sizes and overflow checks. Responsive rules reviewed for 320–1920px layouts; this cloud browser has no viewport/device-emulation capability, so physical-phone/tablet rendering and touch behavior are not claimed as tested. Authenticated admin save/publish remains dependent on Google sign-in.
