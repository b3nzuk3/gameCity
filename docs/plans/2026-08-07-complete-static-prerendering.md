# Complete Static Prerendering Implementation Plan

> **For Hermes:** Implement this plan task-by-task on the testing branch only. Do not push or merge.

**Goal:** Make SEO-important product pages selectively prerendered with real catalog data and generate the sitemap from the catalog instead of a fixed product-free list.

**Architecture:** Keep React, Vite, React Router, TanStack Query, and the existing API. A build preflight fetches a bounded public catalog manifest, writes it to `public/catalog-manifest.json`, and generates the sitemap. Vite reads that manifest to add selected product routes. The prerender entry seeds the React Query cache with the matching product before rendering, while non-selected products retain the SPA fallback.

**Tech Stack:** React 18, Vite 6, TypeScript, React Router 6, TanStack Query, vite-prerender-plugin, Node ESM build scripts.

---

## Task 1: Establish catalog URL and manifest utilities

**Files:**
- Create: `scripts/catalog-manifest.mjs`
- Create: `src/config/publicRoutes.ts`
- Modify: `scripts/generate-sitemap.mjs`

Implement shared URL normalization in the Node build utility and a bounded manifest fetcher. Read `VITE_API_URL`/`PRERENDER_API_URL`, use `GET /products?page=N&limit=L`, follow pagination, normalize product IDs/names/slugs, deduplicate URLs, and support `PRERENDER_PRODUCT_LIMIT`. Use fallback static routes when the API is unavailable unless `PRERENDER_STRICT=true`.

Add tests/fixtures for duplicate products, malformed records, URL escaping, and API failure policy before implementation. Keep the output deterministic.

## Task 2: Make the build pipeline generate the manifest before Vite

**Files:**
- Modify: `package.json`
- Modify: `vite.config.ts`
- Create/modify: `scripts/build-catalog.mjs`
- Generate: `public/catalog-manifest.json`

Change production build to run the catalog/sitemap preflight before `vite build`. Vite reads the generated manifest and passes bounded product URLs to `vite-prerender-plugin` in addition to static routes. Never add authenticated routes.

Verify with a fixture/no-backend mode and strict mode. The generated manifest must state whether it is complete, the source, product count, and generation timestamp.

## Task 3: Make product fetching safe and seedable during prerender

**Files:**
- Modify: `src/services/productService.ts`
- Modify: `src/prerender.tsx`
- Modify: `src/pages/ProductPage.tsx`

Export a prerender-safe product fetcher and make the axios auth interceptor guard browser-only `localStorage`. Refactor `ProductPage` so all hooks execute unconditionally; use `enabled` query options for ID/slug selection. In the prerender function, load the manifest record/product data, seed the exact TanStack Query key, then render the existing route.

If a product cannot be loaded, do not emit a valid product page or product JSON-LD. Preserve normal client fallback behavior for non-prerendered product routes.

## Task 4: Ensure product HTML metadata is complete

**Files:**
- Modify: `src/components/SEO.tsx`
- Modify: `src/pages/ProductPage.tsx`
- Modify: `src/pages/CategoryPage.tsx`
- Modify: `src/pages/Contact.tsx`
- Modify: `src/pages/PrivacyPolicy.tsx`
- Modify: `src/pages/TermsOfService.tsx`
- Modify: `src/pages/Sitemap.tsx`

Verify one title, description, canonical, Open Graph/Twitter tags, and valid JSON-LD per page. Product pages must include name, description, image, price, availability, brand, and canonical URL in server-rendered HTML. Missing-product output must not claim a product exists.

## Task 5: Make sitemap generation data-driven and scalable

**Files:**
- Modify: `scripts/generate-sitemap.mjs`
- Modify: `public/robots.txt` if required

Generate static, category, and manifest product URLs. Escape XML, deduplicate, exclude query/private URLs, and include valid `lastmod` values. Add sitemap index/chunking when URL count approaches protocol limits. Report counts and whether the product manifest is complete. Never claim full catalog coverage when the API fetch fell back.

## Task 6: Document configuration and deployment behavior

**Files:**
- Modify: `PRERENDERING.md`
- Modify: `render.md` only if implementation-specific assumptions change

Document `PRERENDER_API_URL`, `PRERENDER_PRODUCT_LIMIT`, `PRERENDER_STRICT`, API availability, selected-product policy, fallback routes, sitemap completeness, rebuild/cache invalidation, and how to inspect generated HTML. State clearly that no remote push or main merge is part of this task.

## Task 7: Verification and browser smoke test

Run:

```bash
npx tsc --noEmit
npx eslint <all changed source/config files>
npm run build
PRERENDER_STRICT=true PRERENDER_API_URL=http://127.0.0.1:9 npm run build
npm run preview -- --host 127.0.0.1
```

Assert that:

- Static and selected product HTML files exist.
- Product HTML contains meaningful body content, canonical metadata, and Product JSON-LD.
- Sitemap URLs are unique and XML-valid.
- Private routes are absent from prerender output and sitemap.
- API-unavailable behavior matches strict/fallback configuration.
- Browser console has no hydration mismatch warnings on static, product, and fallback routes.
- Cart, search, filters, authentication, and navigation still work.

Full repository lint may retain unrelated baseline failures; report them separately without weakening lint configuration.

## Acceptance Criteria

- Product pages in the bounded manifest are prerendered with real product content.
- Sitemap product URLs come from the fetched catalog manifest.
- Non-selected product pages keep working through SPA hydration.
- Missing, malformed, private, and deleted products are excluded.
- Builds remain deterministic and have explicit API failure behavior.
- Metadata and structured data are present before JavaScript on representative routes.
- Typecheck and changed-file lint pass.
- Changes remain local on the testing branch; no push and no merge.

## Out of Scope

- Migrating to Next.js or replacing React Router.
- Rewriting business logic or checkout.
- Fixing unrelated repository-wide lint failures.
- Adding SSR/ISR infrastructure without a separate architectural review.
- Pushing to GitHub or merging into `main`/`master`.

## Implementation Notes

The backend currently exposes `GET /api/products` with pagination and `GET /api/products/slug/:slug`. Product URLs use the existing `generateProductUrl()` convention. The implementation must confirm these shapes during Task 1 rather than inventing a new endpoint.

Commit each completed task locally with a conventional commit. Do not push.
