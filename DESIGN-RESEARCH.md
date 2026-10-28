# Sahra — identity and menu experience

Research completed 28 October 2026. This document records the design rationale and source material; it is not part of the customer-facing menu.

## Identity

The original emblem combines an architectural arch, a serving bowl and rising steam. The arch and restrained geometric lines are an interpretation of Sana'a's architectural detail. UNESCO documents the city's geometric brick and white-gypsum decoration: https://whc.unesco.org/en/list/385 . No existing restaurant logo or UNESCO artwork was copied.

The wordmark is outlined lettering, accompanied by an original vector emblem. Both logo versions contain SVG paths and require no font download. The gold version works on forest ink; the ink version works on parchment, print and light backgrounds. The icon simplifies the identity for browser tabs and touch bookmarks.

- `dist/brand/sahra-logo-dark.svg` — gold lockup for dark surfaces.
- `dist/brand/sahra-logo-light.svg` — ink lockup for light surfaces and print.
- `dist/brand/sahra-mark.svg` — standalone emblem.
- `dist/logo.svg` — matching favicon.

## Menu research

- Mandi House's published menu uses recognizable dish categories, descriptive names, and clearly separated breads, stews, rice plates and drinks: https://www.mandihouse.com/menu . This informed the menu's category architecture.
- Dishoom's own published delivery menu pairs short dish descriptions with prices and visible dietary marks: https://www.dishoom.com/menu/delivery/ . This informed clear price placement and concise dietary labels; no descriptions or prices were copied.
- Dishoom's linked allergen experience allows searching by dish and opening details: https://app.served-app.com/dishoom?menu=all-day . Sahra similarly keeps ingredient detail one step away, without making allergen-free guarantees.

## Usability and accessibility

- W3C target-size guidance: https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum . Main controls use generous touch areas, and the mobile menu provides a native category selector rather than relying solely on horizontal tabs.
- W3C contrast guidance: https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html . Dark ink, parchment, warm saffron and terracotta were selected for readable text and clear hierarchy.
- W3C modal dialog pattern: https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/ . The native dialog moves focus to the dish heading, keeps keyboard focus inside, supports Escape, and returns focus to the initiating dish after closing.
- W3C animation guidance: https://www.w3.org/WAI/WCAG22/Understanding/animation-from-interactions.html . Effects respect device reduced-motion settings; visitors can also turn motion off from the menu itself.

This is not a claim of independently certified WCAG conformance. Browser checks cover the implemented interactions, responsive widths, font and image loading, reduced motion, JavaScript-free reading, and keyboard behavior.

## Deployment preparation

All typefaces and their SIL Open Font License files are self-hosted. Photography has 480px, 800px and full-size renditions with native responsive image selection and lazy loading. All 27 menu entries are included in the HTML, so the menu remains readable without JavaScript. A branded PDF, social sharing preview, touch icon, canonical metadata and working share/print actions accompany the page.
