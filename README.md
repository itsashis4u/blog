### Personal blog
[![Netlify Status](https://api.netlify.com/api/v1/badges/f231fd84-65c3-4dce-a589-9126c0ea24f0/deploy-status)](https://app.netlify.com/sites/jovial-mccarthy-306d40/deploys)

Built with Eleventy.

## Local development

- `npm install`
- `npm run start`
- `npm run build`
- `npm test`

## Publishing checklist

Before shipping a new post:

- Add front matter: `title`, `description`, `date`, `tags`, and `layout`.
- Add `lastUpdated` when revising older posts.
- Add post-specific social metadata (`ogImage`, `ogImageAlt`) for new posts.
- Verify internal links and tag links.
- Run `npm test` to validate sitemap, redirects, feeds, and metadata invariants.

## Canonical and SEO conventions

- Canonical host is `https://ashishkumar.dev/`.
- Sitemap should be served at `/sitemap.xml`.
- Legacy `/sitemap/index.xml` URLs redirect to `/sitemap.xml`.
