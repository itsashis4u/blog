# ashishkumar.dev

[![Netlify Status](https://api.netlify.com/api/v1/badges/f231fd84-65c3-4dce-a589-9126c0ea24f0/deploy-status)](https://app.netlify.com/sites/jovial-mccarthy-306d40/deploys)

Personal field journal and engineering notes of **Ashish Kumar Badtiya** ([ashishkumar.dev](https://www.ashishkumar.dev/)), built with [Eleventy (11ty)](https://www.11ty.dev/).

## Highlights

- **Switchable Aesthetic Cartridges (`Journal` · `Pokédex` · `Unicorn`):** Defaults to a warm editorial field journal (`Newsreader` + `JetBrains Mono`) with instant switching into an interactive Pokédex companion mode or Unicorn gradient mode, persisted in `localStorage` with full light/dark support.
- **Sticky Marginalia & Reading Rail:** Desktop articles pair a 66ch prose column with a sticky right-hand rail featuring live scroll progress, `IntersectionObserver` active-heading navigation, and structured frontmatter marginalia (`shipsWith`, `requires`, `note`).
- **Interactive Engineering Widgets:** Includes an interactive React Native Cold-Start Budget Simulator (`[data-budget-sim]`) and one-click copy buttons on all syntax-highlighted code blocks.
- **Principal Engineer Dossier (`/about/`):** Features a 10-year career arc bar (`2016 – 2026`), selected architecture cards, stack pills, a small-form-factor PC build blueprint, and a `@media print` CV stylesheet.
- **SEO & LLM Discovery Guardrails:** Automated verification via `scripts/verify-seo.js` for `sitemap.xml`, `robots.txt`, `_redirects`, `llms.txt`, and JSON-LD (`Person` and `BlogPosting`).

## Commands

```bash
# Install dependencies
npm install

# Run local dev server with live reload
npm start

# Build production site and run SEO verification assertions
npm test
```
