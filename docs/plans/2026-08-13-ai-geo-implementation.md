# GameCity GEO & AI-Agentic Browsing Implementation Plan

> **For Hermes:** Implement this plan task-by-task on the existing testing branches. Do not merge or push unless explicitly authorized by Hussein.

**Goal:** Make GameCity Electronics easier for search engines, AI search systems, and autonomous shopping agents to understand, cite, crawl, and navigate without rebuilding the existing application or fabricating product/business data.

**Architecture:** Preserve the current Vite + React + React Router frontend, static prerendering pipeline, Express/Mongoose product API, existing SEO fixes, and catalog-manifest-driven sitemap. Consolidate entity/metadata/schema generation into authoritative frontend utilities, improve server-rendered semantic content and links, and add automated HTML/crawlability regression checks. Backend changes should be limited to data/API support required by the frontend and sitemap.

**Tech Stack:** React 18, TypeScript, Vite 6, `vite-prerender-plugin`, React Helmet Async, React Router, Node test runner, Express, Mongoose, MongoDB, generated `catalog-manifest.json`, XML sitemap, `robots.txt`.

---

## Current Architecture Findings

- The frontend is a Vite React SPA with React Router and `vite-prerender-plugin`; `src/prerender.tsx` renders public routes to static HTML and hydrates on the client.
- Product routes are `/product/:id`, but product cards generate SEO slugs and prerendering obtains product data from the backend by slug. The backend has both ID and slug product endpoints.
- Category routes are `/category/:category`; category content is fetched client-side from the Express API, so category HTML needs special attention if it must be reliably crawlable.
- `SEO.tsx` currently emits title, description, canonical, Open Graph/Twitter metadata, Organization, ElectronicsStore, Product, BreadcrumbList, and WebSite/SearchAction JSON-LD on every page.
- Existing canonical/metadata regression tests inspect generated `dist` HTML and must remain green: exactly one title, description, canonical, `og:url`, and route-specific canonical values.
- Product pages already render visible name, price, stock, specifications, description, images, breadcrumbs, and related products, but the SEO input omits several available fields such as SKU, category, product condition, and all product images.
- `productStructuredData.ts` currently only validates aggregate ratings; the main Product schema is assembled directly inside `SEO.tsx`.
- The sitemap is generated from static routes plus `public/catalog-manifest.json`. `robots.txt` allows public routes but blocks all query URLs and includes a generic crawl delay.
- The frontend repository currently has unrelated uncommitted changes (`.gitignore` and `scripts/google_indexing.py`); preserve them. The backend repository is separately branched and currently clean.

## Branch and Repository Scope

- Frontend branch created: `test/ai-geo-implementation` in `/root/projects/client-projects/game-city/gameCity`.
- Backend branch created: `test/ai-geo-implementation` in `/root/projects/client-projects/game-city/gameCity-backend`.
- Do not merge, push, open a PR, or delete either testing branch without explicit approval.
- Keep commits scoped to the implementation work; do not include the existing frontend worktree changes in feature commits unless requested.

---

## Phase 0: Baseline and Data-Truth Audit

### Task 1: Capture the baseline

**Files:** No source changes. Record results in the implementation report or a temporary local note.

- Run frontend `npm run test:seo`, `npm run test:search`, `npm run test:middleware`, and `npm run build` from a cleanly understood worktree state.
- Run backend package tests/scripts available in `gameCity-backend/package.json`.
- Record current route count, generated product count, build result, and any pre-existing failures.
- Verify the existing branch/worktree status before staging anything.

### Task 2: Inventory trustworthy business and product fields

**Files:**
- Inspect `gameCity-backend/models/productModel.js`.
- Inspect `gameCity-backend/controllers/productController.js`.
- Inspect `gameCity-backend/routes/productRoutes.js` and `routes/sitemapRoutes.js`.
- Inspect frontend `src/services/productService.ts`, `src/services/backendService.ts`, and catalog-manifest generation.

- Map fields that genuinely exist: name, description, brand, category, price, currency, stock, condition, SKU/model/GTIN if present, images, specifications, offer dates, reviews, business contact/policy data.
- Mark absent or unreliable fields as optional; never use fallback values such as `GameCity` as a product brand or invented SKU/model/GTIN.
- Decide which business identity values are verified and which must remain out of structured data until confirmed.

---

## Phase 1: Consolidate Metadata and Structured-Data Primitives

### Task 3: Create a single verified business identity source

**Files:**
- Modify: `gameCity/src/lib/seoMetadata.ts`
- Test: `gameCity/tests/seo-metadata.test.mjs` or a new focused utility test.

- Add one typed identity configuration for name, canonical site URL, logo, verified contact URLs, address, phone/email, and official social profiles.
- Include only information already published and verified on the site.
- Replace hard-coded duplicate identity values in SEO generation with this source.
- Do not add `sameAs`, geo coordinates, opening hours, payment methods, or store imagery unless verified against current business information.

### Task 4: Add typed canonical/metadata builders

**Files:**
- Modify: `gameCity/src/lib/seoMetadata.ts`
- Test: focused metadata tests plus existing generated-HTML regression tests.

- Keep `canonicalUrl()` behavior stable and query/hash-free for indexable page canonicals.
- Add page-type helpers for homepage, category, product, informational, search, and 404 pages.
- Ensure title, description, canonical, image, `og:type`, and `og:url` are derived from the current route/entity rather than homepage defaults.
- Preserve the four existing regression requirements exactly.

### Task 5: Build one structured-data graph builder

**Files:**
- Modify or replace: `gameCity/src/lib/productStructuredData.ts`
- Modify: `gameCity/src/components/SEO.tsx`
- Test: new structured-data unit tests.

- Generate valid JSON-LD objects from actual data only: `Organization`/verified local business type, `WebSite`, optional `SearchAction`, `Product`, `Offer`, and `BreadcrumbList`.
- Add optional Product properties for SKU, category, condition, model, and multiple images only when present in the product data.
- Keep price and availability aligned with the visible effective offer price and stock state.
- Preserve the existing valid-review guard and omit ratings/reviews when values are absent or invalid.
- Prefer one `@graph` per page or another deterministic non-conflicting structure; avoid duplicate competing organization/product entities.
- Ensure JSON serialization cannot emit malformed JSON or `undefined` fields.

### Task 6: Expand the frontend Product type without inventing fields

**Files:**
- Modify: `gameCity/src/services/productService.ts` and/or `src/services/backendService.ts`
- Modify: `gameCity/src/components/SEO.tsx`
- Test: type/build checks and structured-data tests.

- Add optional fields only where the API/model exposes them, such as `sku`, `model`, `gtin`, `condition`, `currency`, and normalized image arrays.
- Remove SEO fallbacks that assert unsupported facts, especially fake product brands or fabricated values.
- Normalize API naming differences (`_id`/`id`, `countInStock`/`count_in_stock`) in one place.

---

## Phase 2: Semantic Product and Category Experiences

### Task 7: Improve ProductPage semantic HTML and accessibility

**Files:**
- Modify: `gameCity/src/pages/ProductPage.tsx`
- Modify: `gameCity/src/components/ProductCard.tsx` and related image utilities if needed.

- Add visible, crawlable product identity details: brand/model/SKU/category when available.
- Use semantic headings, a labeled specifications table, clear price/currency, availability, condition, and purchase/contact path.
- Add accurate image alt text based on the image/product, not keyword stuffing; ensure gallery images are associated with the product.
- Preserve existing behavior, offer calculations, stock controls, reviews, and related products.
- Keep breadcrumb links aligned with actual category/product URLs.

### Task 8: Make category pages useful semantic hubs

**Files:**
- Modify: `gameCity/src/pages/CategoryPage.tsx`
- Modify: category configuration or a new category metadata utility under `gameCity/src/lib/`.

- Define truthful category names, descriptions, canonical slugs, and optional subcategory/brand links from a single configuration.
- Render a concise useful category introduction, crawlable category navigation, product count/state, and descriptive links around the product grid.
- Replace ambiguous labels such as `Browse` with destination-specific accessible labels while retaining the existing visual design.
- Do not add generic AI-written filler or claim brands/products that are not in the data.

### Task 9: Improve homepage and site-wide entity navigation

**Files:**
- Modify: `gameCity/src/pages/Index.tsx`
- Modify: `gameCity/src/components/Navbar.tsx`, `Footer.tsx`, and relevant policy/contact pages.

- Add explicit semantic headings and crawlable links from the homepage to public categories, contact, policies, delivery/payment/warranty information where those pages exist.
- Ensure links use descriptive destination names rather than generic `Browse`, `Explore`, or `View Product` where the destination is known.
- Make business name, service area, support/contact method, and site purpose consistent across homepage, footer, contact page, metadata, and schema.
- Do not create unsupported FAQs or business claims.

### Task 10: Verify server-rendered content route by route

**Files:**
- Modify: `gameCity/src/prerender.tsx` and `vite.config.ts` only if required.
- Test: `gameCity/tests/seo-metadata.test.mjs` plus a new rendered-content test.

- Ensure representative product routes have data available during prerender and do not render an empty/loading-only shell in generated HTML.
- Determine whether category routes can be prerendered with catalog data; if not, document the limitation and implement the smallest safe manifest/API-assisted solution.
- Ensure missing products produce a real 404/noindex behavior rather than a misleading 200 product shell.
- Ensure public informational routes have route-specific metadata and semantic content.

---

## Phase 3: Crawlability, Sitemap, and URL Integrity

### Task 11: Harden sitemap generation

**Files:**
- Modify: `gameCity/scripts/catalog-manifest.mjs` if needed.
- Modify: `gameCity/scripts/generate-sitemap.mjs`.
- Inspect/modify: `gameCity-backend/routes/sitemapRoutes.js` only if production sitemap behavior differs.
- Test: new sitemap validation script/test.

- Include only canonical, indexable, non-redirecting public URLs.
- Reject duplicates, query/hash variants, invalid paths, and entries known to be missing or non-canonical.
- Keep product route generation identical to the canonical slug resolver.
- Validate chunked sitemap index and all child sitemap URLs when the catalog exceeds limits.
- Report incomplete manifest state clearly instead of claiming a complete catalog.

### Task 12: Audit robots and indexability controls

**Files:**
- Modify: `gameCity/public/robots.txt`.
- Modify: `gameCity/middleware.js` or Vercel configuration only if headers/redirects require it.
- Test: new robots/crawlability validation.

- Confirm product/category HTML, images, CSS, and JS required for rendering are not accidentally blocked.
- Keep admin/API/private and tracking/filter traps controlled, but do not use a broad query disallow that blocks legitimate public search/category behavior without evidence.
- Avoid speculative AI crawler allowlists or unofficial directives; use crawlable HTML, stable URLs, sitemap discovery, and valid structured data as the primary strategy.

### Task 13: Validate redirect, 404, and query behavior

**Files:**
- Inspect/modify: `gameCity/middleware.js`, `src/pages/NotFound.tsx`, router/prerender configuration, and backend route handlers as required.
- Test: extend `tests/middleware.test.mjs` and add route behavior tests.

- Verify unknown product/category routes return a correct 404/noindex outcome.
- Verify old product URL forms redirect only when a real canonical mapping exists and do not create chains.
- Verify filter, pagination, and search URLs have intentional indexability/canonical behavior.
- Verify no non-homepage route receives the homepage canonical.

---

## Phase 4: Automated GEO and AI-Agent Verification

### Task 14: Extend generated-HTML metadata tests

**Files:**
- Modify: `gameCity/tests/seo-metadata.test.mjs`.
- Create if useful: `gameCity/tests/geo-html.test.mjs`.

Verify for homepage, representative categories, representative products, contact, privacy, terms, sitemap, and 404:

- exactly one title, description, canonical, and `og:url`;
- canonical and `og:url` match the current route;
- no homepage canonical on non-homepage routes;
- visible product name/price/availability/specifications where data exists;
- product/category breadcrumbs use valid URLs;
- images have meaningful non-keyword-stuffed alt text;
- no accidental noindex or redirect output on intended public pages.

### Task 15: Validate JSON-LD against visible content

**Files:**
- Create: `gameCity/tests/structured-data.test.mjs` or a reusable validation script.

- Parse every JSON-LD script in representative built pages.
- Fail on malformed JSON, duplicate conflicting entities, unsupported fabricated fields, price mismatch, availability mismatch, and breadcrumb URL mismatch.
- Validate optional fields are omitted when the source data is absent.
- If external Schema.org/Rich Results validators are used, record their actual output rather than assuming validity.

### Task 16: Add sitemap, robots, and internal-link checks

**Files:**
- Create: `gameCity/tests/crawlability.test.mjs`.
- Modify: package scripts to expose a deterministic validation command.

- Parse sitemap XML and verify URL uniqueness, canonical host, route format, and expected public route coverage.
- Parse robots directives and verify intended public routes/resources remain crawlable.
- Crawl generated HTML locally to detect broken internal links, orphaned public routes, and product/category links that do not resolve to generated pages.
- Keep the test independent of production credentials and network access where possible.

### Task 17: Run an AI-shopping-agent simulation

**Files:**
- Create: `gameCity/tests/ai-agent-crawl.test.mjs` or a deterministic local crawler script.

Starting at `/`, follow normal HTML links and answer from rendered content:

1. What is GameCity Electronics?
2. Which categories exist?
3. Which products are available?
4. What is a representative product?
5. What does it cost and in which currency?
6. What specifications and stock state are shown?
7. What alternatives/related products exist?
8. How can a customer buy or contact the business?
9. What policies are available?
10. Where is the agent in the URL/breadcrumb hierarchy?

Fail with a concrete missing relationship or content selector, not a vague score.

---

## Phase 5: Production-Equivalent Verification and Reporting

### Task 18: Build and inspect generated artifacts

Run from `gameCity`:

```bash
npm run lint
npm run test:middleware
npm run test:seo
npm run test:search
npm run test:geo
npm run build
```

Then inspect actual `dist/` HTML, `dist/sitemap.xml` (and chunks), `dist/robots.txt`, and representative product/category pages. Confirm hydration does not remove or invalidate critical metadata/content.

### Task 19: Verify backend/API compatibility

Run the backend's available tests and exercise representative read-only endpoints against the configured test/local environment. Confirm product slug lookup, category lookup, image resolution, stock/offer fields, and sitemap data match frontend assumptions. Do not mutate production data.

### Task 20: Produce the implementation report

Report separately:

- architecture findings;
- GEO improvements;
- AI-agent navigation/discovery improvements;
- schema types implemented or improved;
- crawlability, robots, and sitemap changes;
- internal-linking changes;
- metadata/canonical behavior;
- exact test/build/route counts and outputs;
- production HTML verification evidence;
- remaining issues requiring business information, database changes, content changes, external configuration, or larger architecture work.

Do not claim a fix unless the corresponding generated HTML, route, sitemap, schema, or test output was actually verified.

---

## Acceptance Criteria

- Existing canonical and metadata regression tests remain green.
- Public product/category/information routes have route-specific title, description, canonical, Open Graph URL, and crawlable semantic HTML.
- Product JSON-LD matches visible data and omits unsupported fields; no fake reviews, ratings, prices, stock, brands, SKUs, GTINs, or business facts are emitted.
- Organization/business identity is consistent and sourced from one verified configuration.
- Breadcrumbs are visible where appropriate, use normal links, match URL hierarchy, and validate as `BreadcrumbList`.
- Sitemap contains only valid canonical indexable URLs and accurately reports incomplete catalog generation.
- Robots rules do not accidentally block important pages/resources and do not rely on speculative AI-specific directives.
- Representative generated HTML passes metadata, structured-data, crawlability, and AI-agent simulation checks.
- Existing shopping, search, authentication, cart, admin, image, and performance behavior is preserved.
- No merge, push, PR creation, or testing-branch deletion occurs without explicit user authorization.

## Out of Scope

- Rebuilding the site or migrating frameworks.
- Fabricating product/business content for SEO.
- Adding unofficial AI crawler directives solely for ranking manipulation.
- Unnecessary product/category URL changes.
- Production database migrations without explicit approval and a rollback plan.
- Merging or pushing either testing branch.

## Verification Commands Summary

```bash
# Frontend
cd /root/projects/client-projects/game-city/gameCity
npm run lint
npm run test:middleware
npm run test:seo
npm run test:search
npm run build
# Run the new GEO/crawlability scripts once added

# Backend
cd /root/projects/client-projects/game-city/gameCity-backend
npm test

# Branch/worktree safety
 git status --short --branch
 git diff --check
```

Expected final branch state: both repositories remain on `test/ai-geo-implementation`; changes are local only; no remote branch, merge, or main/master update is performed without explicit approval.

---

## Remaining Verification Checklist

The implementation is committed locally on the testing branches, but these items remain before the work can be considered fully verified or ready for merge:

- [ ] Run `hermes verify --json` successfully for the backend with a free verification port, or configure the detected recipe so its boot port matches the application port. The previous attempts were blocked by a port-5001 collision and then timed out.
- [ ] Run a fresh backend read-only API smoke test against MongoDB: health, paginated products, representative category, representative product-by-slug, image resolution, and sitemap responses.
- [ ] Reconcile the live catalog count discrepancy: API reported 142 products while the generated manifest reported 141 product routes.
- [ ] Run the frontend API-positive build against the live local backend and preserve the generated-artifact cleanup procedure afterward.
- [ ] Run metadata and GEO tests against the full live-product build, including all generated product routes.
- [ ] Validate representative generated JSON-LD with Google Rich Results Test and Schema Markup Validator using a public preview URL or pasted JSON-LD code. Localhost cannot be fetched by Google's URL tester.
- [ ] Perform a real-browser preview smoke test and inspect console output for hydration/API errors.
- [ ] Re-run `git diff --check` and inspect both repository worktrees before any merge or push decision.

### Current Verification Evidence

- Frontend API-positive build succeeded with 141 live product routes and 152 prerendered pages total.
- Representative live product HTML was inspected: title, canonical, `og:url`, visible product content, Product JSON-LD, Offer, and BreadcrumbList were present.
- Frontend SEO, GEO, middleware, and search tests passed against the full live-product build.
- Frontend full lint remains blocked by 42 pre-existing errors outside the changed files; changed-file lint and TypeScript checks pass.
- Backend booted successfully on port 5001 with MongoDB and Redis connected during manual validation.
- Backend `hermes verify --json` is not yet green because its detected readiness workflow attempted a conflicting port and timed out.

## Implementation Handoff

Implementation is committed locally on the testing branches. Continue with the remaining verification checklist before requesting merge or push approval. Preserve unrelated worktree changes and do not merge or push without explicit user authorization.

★ No merge or push will be performed unless Hussein explicitly instructs it.

---

## Commit Policy

Local commits are allowed for the testing branches after verification of the changed files. Remote push, pull request creation, merge, and testing-branch deletion remain explicitly prohibited until Hussein authorizes them.

★
