<img src="dist/brand/sahra-logo-light.svg" width="250" alt="Sahra — Yemeni Kitchen">

# Sahra — Yemeni Kitchen

A responsive restaurant menu built with HTML, CSS and vanilla JavaScript. Includes 27 photographed dishes, bilingual names, ingredient details, saved favourites, dietary filtering, price sorting, sharing, a branded PDF menu and accessible motion controls.

## Project structure

```text
dist/       Complete website, ready for static hosting
scripts/    Build, asset preparation and verification utilities
docs/       Design research, branding decisions and image prompts
.openai/    Existing Sites hosting configuration
release/    Local deployment ZIP, excluded from Git
```

## Run locally

Serve `dist/` with any static web server. The menu can also be opened directly from `dist/index.html`; sharing features work best over HTTPS. The menu remains readable with JavaScript disabled.

## Deploy

Upload the **contents of `dist/`** to a static HTTPS host, with `index.html` at the root. Keep the `assets/`, `brand/` and `fonts/` directories and `sahra-menu.pdf` together. Production serving requires no Node runtime, npm dependencies, API keys or third-party font requests.

For GitHub Pages or another hosting provider, configure `dist/` as the published output directory. If changing domains, update the canonical and Open Graph URLs in `dist/index.html`, plus the share URL in `dist/menu-runtime.js`.

The local deployment ZIP is kept at `release/sahra-ready-to-deploy.zip`. It is not committed because its contents are already present in `dist/`.

## Edit the menu

Edit dish names, Arabic names, prices, ingredients, descriptions, category assignments and dietary tags in `dist/app.js`. Then regenerate the static HTML:

```sh
node scripts/build-static.mjs
```

Browser filtering and the static menu share the templates in `dist/menu-render.js`.

## Check the website

```sh
node scripts/validate-site.mjs
```

This verifies local file references, all 27 static entries, fonts, responsive photos, the PDF, social artwork and touch icon.

The full browser check uses Chrome on Windows, at the path configured in `scripts/qa.mjs`:

```sh
node scripts/qa.mjs
```

It checks search, category selection, sorting, saved dishes, dialog focus, keyboard dismissal, motion preferences, layouts from 320px to 1440px, and JavaScript-free access. It also refreshes the PDF menu, social card and touch icon. Temporary browser files and screenshots are excluded from Git.

## Brand and assets

- Original SVG logo variants and emblem: `dist/brand/`.
- Favicon: `dist/logo.svg`.
- Branded printable menu: `dist/sahra-menu.pdf`.
- Self-hosted typefaces and their licenses: `dist/fonts/`.
- Full-size and responsive dish photos: `dist/assets/`.
- Research and art direction: [`docs/DESIGN-RESEARCH.md`](docs/DESIGN-RESEARCH.md).
- Image-generation prompts: [`docs/IMAGE-PROMPTS.md`](docs/IMAGE-PROMPTS.md) and [`docs/IMAGE-PROMPTS-EXPANSION.md`](docs/IMAGE-PROMPTS-EXPANSION.md).

Asset utilities are in `scripts/`; run them from the project root. The PowerShell image and logo utilities use Windows drawing APIs. These utilities are optional and are not required to host the finished site.
