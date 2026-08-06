# Static prerendering

The production build uses `vite-prerender-plugin` to render the React application to HTML at build time. The client entry point restores the serialized TanStack Query state before calling `hydrateRoot`, so prerendered product pages begin with the same public data used during the Node render.

## Current implementation

- React, Vite, TypeScript, React Router, and the existing API architecture are unchanged.
- Public static/category routes and a configurable product selection are prerendered.
- Product query data is prefetched in Node, dehydrated into `#prerender-data`, and hydrated before the first client render.
- Auth, cart, and favorites remain browser-owned and are never serialized into public HTML.
- Product detail requests are cached for the duration of a build.
- Authenticated routes such as `/admin` and `/profile` are excluded.

## Build configuration

The build runs:

```bash
node scripts/catalog-manifest.mjs
npm run generate:sitemap
vite build
```

Environment variables:

| Variable | Default | Meaning |
|---|---:|---|
| `PRERENDER_API_URL` | `http://localhost:5001/api` | Public catalog API used at build time |
| `VITE_API_URL` | same API fallback | Existing client API base URL |
| `PRERENDER_PRODUCT_LIMIT` | `24` | Maximum products selected for prerendering; `0` traverses the complete catalog |
| `PRERENDER_PAGE_SIZE` | `100` | API page size, capped at 100 |
| `PRERENDER_TIMEOUT_MS` | `8000` | Per-request timeout |
| `PRERENDER_STRICT` | `false` | Fail instead of falling back to static routes when the catalog API is unavailable |
| `SITE_URL` | `https://www.gamecityelectronics.co.ke` | Canonical site origin for the sitemap |

Examples:

```bash
# Bounded local/CI build
PRERENDER_API_URL=http://localhost:5001/api PRERENDER_PRODUCT_LIMIT=24 npm run build

# Full catalog manifest and sitemap
PRERENDER_API_URL=http://localhost:5001/api PRERENDER_PRODUCT_LIMIT=0 npm run build

# Inspect selected product routes without building Vite
PRERENDER_API_URL=http://localhost:5001/api PRERENDER_PRODUCT_LIMIT=10 node scripts/catalog-manifest.mjs --inspect

# Require the catalog API
PRERENDER_STRICT=true PRERENDER_API_URL=http://localhost:5001/api npm run build
```

A positive product limit is intentionally incomplete when the API reports additional pages. The manifest and sitemap report `complete=false` in that case. `PRERENDER_PRODUCT_LIMIT=0` is complete only when all API pages are successfully traversed.

## Product data and hydration

For a product route, `src/prerender.tsx` fetches the product by ID or slug and seeds the exact TanStack Query key used by `ProductPage`. The query client is dehydrated into the plugin's JSON payload. `src/main.tsx` validates and removes that payload, hydrates a fresh client, then calls `hydrateRoot`.

Only public product query data is included. Authentication tokens, user data, cart contents, favorites, and other browser state are not included in the payload.

If a product detail request fails, no product query is seeded. The normal client not-found behavior remains responsible for the route, and the product is not added to the manifest unless the catalog record was valid.

## Catalog and sitemap behavior

`scripts/catalog-manifest.mjs` follows the API's pagination metadata (`pages`/`hasMore`), normalizes and deduplicates safe product URLs, applies the configured limit, and reports whether traversal was complete. Product route selection is deterministic.

`scripts/generate-sitemap.mjs` combines static/category routes with manifest product routes. It removes query-string, fragment, invalid, private, and duplicate paths; escapes XML; and emits normalized `<lastmod>` values only for valid timestamps. An incomplete or unavailable manifest is never described as a complete catalog sitemap.

The current sitemap generator emits one sitemap file. Add chunk/index support before the catalog approaches the sitemap protocol URL limit; the manifest already exposes completeness and deterministic ordering needed for that change.

## Deployment and fallback

Deploy the generated `dist/` directory as a normal Vite static site. The host must serve generated route directories/files and retain the existing SPA fallback for product routes not selected for prerendering.

When the API is unavailable and `PRERENDER_STRICT` is not `true`, the build continues with static routes and produces an explicitly incomplete manifest/sitemap. Strict production SEO builds should set `PRERENDER_STRICT=true` so missing catalog data fails clearly instead of silently reducing SEO coverage.

Never prerender authenticated pages because their output must not be shared between users.

## Verification

Required checks:

```bash
npx tsc --noEmit
PRERENDER_API_URL=http://localhost:5001/api PRERENDER_PRODUCT_LIMIT=3 npm run build
PRERENDER_API_URL=http://127.0.0.1:9 npm run build
PRERENDER_STRICT=true PRERENDER_API_URL=http://127.0.0.1:9 npm run build
npm run lint
npm run preview -- --host 127.0.0.1
```

Inspect raw HTML under `dist/` or with `curl`. A selected product page should contain its name, description, price/availability, canonical URL, and Product JSON-LD before JavaScript runs. The built HTML should contain `id="prerender-data"` on prerendered pages.

Use a real browser against preview to check the console for hydration warnings and verify product navigation, fallback product routes, cart, authentication, search, filters, checkout, and refresh behavior. In this WSL environment no Chromium/Playwright browser runner is installed, so browser hydration verification remains explicitly unverified; raw preview HTML, API-positive builds, fallback builds, strict failure behavior, typecheck, and changed-file lint were verified instead.

Changed-file lint and TypeScript checks are the implementation gates. The repository's full lint command may still report unrelated baseline errors; record those separately.

## Adding a public route

1. Add the route to `src/routes.tsx`.
2. Add it to `STATIC_ROUTES` in `scripts/catalog-manifest.mjs` if it is not discovered from links.
3. Add page-level `SEO` metadata.
4. Verify the raw generated HTML and sitemap behavior.

No merge to `main` or `master`, and no remote push, is performed by this work.

## Local branches

- Frontend: `feat/static-prerendering-seo`
- Backend local CORS testing: `test/preview-cors`

The backend testing branch allows preview origins `http://localhost:4173` and `http://127.0.0.1:4173`; it must remain separate from production branches.
