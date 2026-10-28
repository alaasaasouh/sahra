# Sahra — Yemeni Kitchen menu

A responsive, buildless HTML/CSS/JavaScript menu with a custom vector identity, 27 dish photographs, bilingual dish names, ingredient details, saved favourites, category filters, sorting, sharing, print, reduced-motion support and a PDF download.

## Deploy

Upload the **contents** of `dist/` to any static HTTPS host. `index.html` must be at the site's root; retain the `assets`, `brand` and `fonts` directories. Production serving requires no Node runtime, npm packages, API keys or third-party font connection.

The prepared `sahra-ready-to-deploy.zip` contains the same deployable files. The connected Sites publication uses the existing project recorded in `.openai/hosting.json` and preserves its access audience.

If moving to another domain, update the canonical URL and Open Graph URLs in `dist/index.html`, and the share URL in `dist/menu-runtime.js`.

## Edit the menu

Dish names, Arabic names, descriptions, ingredients, prices, category assignments and diet tags live in `dist/app.js`. After editing, run `node build-static.mjs` to refresh the readable HTML. The same templates drive static HTML and browser filtering, so they remain consistent.

Logo source assets are in `dist/brand/`. `build-brand.ps1` recreates the path-based lockups and emblem. Typeface licenses ship in `dist/fonts/`. Food art direction and original prompts are recorded in `IMAGE-PROMPTS.md` and `IMAGE-PROMPTS-EXPANSION.md`.

`build-responsive.ps1` derives web delivery sizes. `download-fonts.mjs` refreshes the self-hosted font files and licenses. Neither is required to serve the site.

## Verify

Run `node qa.mjs` in a Windows environment with Chrome at the path declared at the start of that file. It verifies menu and image loading, categories, sorting, search, favourites, keyboard focus, dialog closure, reduced motion, small-screen overflow, and no-JavaScript access. It also refreshes the branded PDF, social preview, touch icon and review screenshots.

`DESIGN-RESEARCH.md` records the primary references and design decisions.
