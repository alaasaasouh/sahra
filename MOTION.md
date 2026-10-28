# Menu motion

The menu uses CSS and vanilla JavaScript, with no animation dependencies.

- Clipped word reveal on the menu heading, followed by the intro line.
- Slowly rotating spice stars and a stamp that responds to scroll.
- Page reading progress in a thin saffron / terracotta accent line.
- Sliding category indicator that follows the selected filter.
- Scroll reveals for headings, descriptions and every dish photograph, with staggered delays.
- Subtle photo tilt on pointer devices, image zoom, warm colour emphasis and arrow rotation on hover.
- Heart and saved-count feedback when adding a favourite.
- Dialog entrance and exit, including animated Escape and backdrop dismissal.
- `prefers-reduced-motion` disables continuous and entrance animation, pointer tilt, and smooth scrolling.
- Print mode reveals every card and disables effects.

The complete browser checks live in `qa.mjs`. They cover all photos, search, category filters, vegetarian dishes, saved dishes, dialog behaviour, wording, mobile overflow and reduced motion.
