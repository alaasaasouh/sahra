<img src="dist/brand/sahra-logo-light.svg" width="250" alt="Sahra — Yemeni Kitchen">

# Sahra — Yemeni Kitchen

**Live menu:** https://alaasaasouh.github.io/sahra/

A responsive restaurant menu built with HTML, CSS and vanilla JavaScript. Includes 27 photographed dishes, bilingual names, ingredient details, saved favourites, dietary filtering, price sorting, sharing, a branded PDF menu and accessible motion controls.

## Project structure

```text
dist/       Complete website, ready for static hosting
scripts/    Build, asset preparation and verification utilities
docs/       Design research, branding decisions and image prompts
.openai/    Existing Sites hosting configuration
release/    Local deployment ZIP, excluded from Git
vercel.json Vercel build and output configuration
```

## Run locally

Serve `dist/` with any static web server. The menu can also be opened directly from `dist/index.html`; sharing features work best over HTTPS. The menu remains readable with JavaScript disabled.

## Deploy to Vercel

Import **`alaasaasouh/sahra`** from GitHub into Vercel. Keep the **Root Directory** at the repository root (`.`). Vercel reads the checked-in `vercel.json` automatically:

| Setting | Value |
| --- | --- |
| Framework Preset | Other |
| Build Command | `node scripts/build-static.mjs && node scripts/validate-site.mjs` |
| Output Directory | `dist` |
| Install Command | Skipped |

No npm dependencies or required secrets are needed. `dist/` contains every deployed file. The `.vercelignore` file excludes temporary browser data, local archives, documentation and unrelated hosting metadata from Vercel uploads.

Canonical and social-image URLs are set during the build. The build uses `SITE_URL` when explicitly provided; otherwise it uses Vercel's production URL, then the current deployment URL. For a custom canonical domain, add an optional **`SITE_URL=https://your-domain.com/`** environment variable in Vercel and redeploy. Keep Vercel's automatic system environment variables enabled. The Share button uses the current website address.

Preview deployments use the production canonical URL when Vercel provides it. Outside Vercel, the default remains the existing GitHub Pages URL.

## Other static hosting and GitHub Pages

Upload the **contents of `dist/`** to a static HTTPS host, with `index.html` at the root. Keep the `assets/`, `brand/` and `fonts/` directories and `sahra-menu.pdf` together. Production serving requires no Node runtime, npm dependencies, API keys or third-party font requests.

GitHub Pages publishes automatically from `main` using [`.github/workflows/pages.yml`](.github/workflows/pages.yml). The workflow prepares and validates the menu, uploads the complete `dist/` folder, then publishes it at **https://alaasaasouh.github.io/sahra/**. In the repository's **Settings → Pages**, the publishing source is **GitHub Actions**.

Every website asset is committed: all photographs and responsive versions, SVG logos, fonts and licenses, the PDF menu, social preview, CSS and JavaScript. Temporary browser caches and local archive copies are not needed for hosting.

When building for another static host, set `SITE_URL` to its public URL before running `node scripts/build-static.mjs`. The Share button automatically uses the current site's URL.

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

To verify metadata for Vercel production, preview deployments, a custom domain, and the GitHub Pages subdirectory:

```sh
node scripts/check-deployment.mjs
```

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
