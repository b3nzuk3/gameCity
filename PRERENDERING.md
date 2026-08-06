# Static prerendering

The production build uses `vite-prerender-plugin` to render the React application to HTML at build time. The client entry point uses `hydrateRoot` when prerendered markup exists, so navigation, cart, authentication, search, and other interactive behavior continue to run as before.

## Current implementation status

The local API-positive build has been verified with the backend on port `5001`: 24 products were discovered and 35 pages were prerendered. The default product limit is bounded, so the manifest reports `complete=false` when more catalog pages exist.

The implementation is not finished for production browser use. Prerendered pages currently produce React hydration errors (`#418`/`#423`) because the initial client render is not identical to the server-rendered HTML. Query state must be dehydrated into the document and restored before `hydrateRoot`, followed by browser verification of cart, authentication, search, filters, checkout, and fallback routes.

## Prerendered routes

The build always prerenders the home page and the public informational routes `/contact`, `/privacy`, `/terms`, and `/sitemap`. The prerender plugin follows same-origin links discovered in the generated HTML, so linked public category routes are also included. Authenticated routes (`/admin` and `/profile`) are deliberately excluded.

The product catalog is discovered from the public API during the build. A bounded selection is added to `additionalPrerenderRoutes`; products outside that selection use the normal SPA fallback. Use `PRERENDER_PRODUCT_LIMIT` to control the selection size.

## Metadata

Public pages already use the shared `SEO` component. During prerendering, `react-helmet-async` metadata is collected and injected into each generated document, including title, description, canonical, Open Graph/Twitter tags, and JSON-LD where supplied by the page.

## Sitemap and robots

`npm run build` runs the catalog manifest fetcher, then `scripts/generate-sitemap.mjs`, before Vite. It writes `public/catalog-manifest.json` and `public/sitemap.xml` with static and selected product routes. `public/robots.txt` remains a static file and should reference `/sitemap.xml` in production.

When adding a new public route:

1. Add the route to `src/routes.tsx`.
2. Add it to the shared route/manifest logic and `additionalPrerenderRoutes` if it is not discovered automatically.
3. Add it to the sitemap source.
4. Add page-level `SEO` metadata.

## Deployment notes

Deploy the generated `dist/` directory as a normal Vite static site. The host must serve the generated route directories/files and provide the existing SPA fallback for routes that are not prerendered, especially dynamic product URLs. Never prerender authenticated pages because their output must not be shared between users.

The prerender process executes the app in Node. Browser-only work is kept in effects and therefore does not run during the server render. If a new component accesses browser globals during render, move that access into `useEffect` or guard it with `typeof window !== 'undefined'`.

## Verification

Run `PRERENDER_API_URL=http://localhost:5001/api npm run build`, inspect generated route HTML under `dist/`, check title/meta tags, and use browser DevTools to check hydration warnings before deploying.

The build uses the existing API architecture and fetches a bounded product manifest during the build. Product pages in that manifest receive server-rendered content and metadata. Product query-state hydration remains a required follow-up because browser hydration currently reports React mismatch errors.

## Limitations

React Router's `BrowserRouter` remains the client router. The prerender entry uses `StaticRouter` only during the build, preserving the existing runtime architecture. The application continues to use client-side data fetching for catalog pages, so only static page content and page-level metadata are guaranteed before JavaScript for those pages.

The build's generated HTML can contain loading states for API-backed pages if their data is not available to the prerender process. This is intentional and keeps builds reliable when the backend is unavailable.

Generated `dist/sitemap.xml` contains static routes and selected catalog product URLs. It is not a complete catalog sitemap while the manifest is truncated or the API is unavailable. Strict mode (`PRERENDER_STRICT=true`) fails the build when the catalog cannot be fetched.

No merge to `main` is performed by this implementation.

## Testing branch

This implementation is on `feat/static-prerendering-seo`.

Before merging, run the production build and preview it with `npm run preview`, then inspect public routes and authenticated flows in a browser.

The project currently reports npm audit findings during installation; those are dependency advisories and are separate from the prerender implementation.
