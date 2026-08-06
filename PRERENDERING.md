# Static prerendering

The production build uses `vite-prerender-plugin` to render the React application to HTML at build time. The client entry point uses `hydrateRoot` when prerendered markup exists, so navigation, cart, authentication, search, and other interactive behavior continue to run as before.

## Prerendered routes

The build always prerenders the home page and the public informational routes `/contact`, `/privacy`, `/terms`, and `/sitemap`. The prerender plugin follows same-origin links discovered in the generated HTML, so linked public category routes are also included. Authenticated routes (`/admin` and `/profile`) are deliberately excluded.

The product catalog is API-backed and potentially large. Product URLs are not enumerated at build time; they use the normal SPA fallback and hydrate client-side. This avoids making builds dependent on catalog size or live API availability. A future selective product strategy can add routes through `additionalPrerenderRoutes` after fetching a controlled list of high-value product URLs.

## Metadata

Public pages already use the shared `SEO` component. During prerendering, `react-helmet-async` metadata is collected and injected into each generated document, including title, description, canonical, Open Graph/Twitter tags, and JSON-LD where supplied by the page.

## Sitemap and robots

`npm run build` runs `scripts/generate-sitemap.mjs` before Vite. It writes `public/sitemap.xml` using the public route list. `public/robots.txt` remains a static file and should reference `/sitemap.xml` in production.

When adding a new public route:

1. Add the route to `src/routes.tsx`.
2. Add it to `additionalPrerenderRoutes` in `vite.config.ts` if it is not linked from another prerendered page.
3. Add it to `scripts/generate-sitemap.mjs`.
4. Add page-level `SEO` metadata.

## Deployment notes

Deploy the generated `dist/` directory as a normal Vite static site. The host must serve the generated route directories/files and provide the existing SPA fallback for routes that are not prerendered, especially dynamic product URLs. Never prerender authenticated pages because their output must not be shared between users.

The prerender process executes the app in Node. Browser-only work is kept in effects and therefore does not run during the server render. If a new component accesses browser globals during render, move that access into `useEffect` or guard it with `typeof window !== 'undefined'`.

## Verification

Run `npm run build`, inspect generated route HTML under `dist/`, and check the title/meta tags with a plain-text search before deploying.

The build currently uses the existing API architecture; it does not fetch product data during the build. Consequently, dynamic product pages receive SEO metadata after client hydration unless a selective product route list is added later.

## Limitations

React Router's `BrowserRouter` remains the client router. The prerender entry uses `StaticRouter` only during the build, preserving the existing runtime architecture. The application continues to use client-side data fetching for catalog pages, so only static page content and page-level metadata are guaranteed before JavaScript for those pages.

The build's generated HTML can contain loading states for API-backed pages if their data is not available to the prerender process. This is intentional and keeps builds reliable when the backend is unavailable.

Generated `dist/sitemap.xml` is currently the public-route sitemap. Product URLs should be added through a backend-generated or controlled catalog sitemap when the catalog URL inventory is available.

No merge to `main` is performed by this implementation.

## Testing branch

This implementation is on `feat/static-prerendering-seo`.

Before merging, run the production build and preview it with `npm run preview`, then inspect public routes and authenticated flows in a browser.

The project currently reports npm audit findings during installation; those are dependency advisories and are separate from the prerender implementation.
