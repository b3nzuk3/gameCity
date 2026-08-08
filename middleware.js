const PRODUCT_ROUTE = /^\/product\/([^/]+)\/?$/

const API_BASE_URL = () => {
  const configured = (
    process.env.API_BASE_URL ||
    process.env.VITE_API_URL ||
    process.env.VITE_BACKEND_URL ||
    process.env.PRERENDER_API_URL ||
    process.env.BACKEND_URL ||
    ''
  ).replace(/\/$/, '')

  if (!configured) return ''
  return configured.endsWith('/api') ? configured : `${configured}/api`
}

export function productLookupUrl(slug, apiBaseUrl = API_BASE_URL()) {
  if (!apiBaseUrl) return null
  return `${apiBaseUrl}/products/slug/${encodeURIComponent(slug)}`
}

export async function lookupProduct(slug, fetchImpl = fetch, apiBaseUrl = API_BASE_URL()) {
  const url = productLookupUrl(slug, apiBaseUrl)
  if (!url) return { status: 'unconfigured' }

  try {
    const response = await fetchImpl(url, {
      headers: { Accept: 'application/json' },
      // Product existence may change when products are deleted or restored.
      cache: 'no-store',
    })

    if (response.status === 404) return { status: 'missing' }
    if (!response.ok) return { status: 'unavailable', code: response.status }
    return { status: 'exists' }
  } catch (error) {
    return { status: 'unavailable', error }
  }
}

export default async function middleware(request) {
  const match = new URL(request.url).pathname.match(PRODUCT_ROUTE)
  if (!match) return undefined

  const result = await lookupProduct(match[1], fetch, API_BASE_URL())

  // Only a confirmed backend 404 should become a page 404. If the catalog API
  // is unavailable, fail open so a transient API outage does not take down the
  // storefront or valid prerendered product pages.
  if (result.status === 'missing') {
    const body = `<!doctype html>
<html lang="en-KE">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="robots" content="noindex">
    <title>404 - Product Not Found | GameCity Electronics</title>
  </head>
  <body>
    <main>
      <h1>404 - Product Not Found</h1>
      <p>The product you are looking for does not exist or has been removed.</p>
      <a href="/">Return to GameCity Electronics</a>
    </main>
  </body>
</html>`

    return new Response(body, {
      status: 404,
      headers: {
        'Cache-Control': 'public, max-age=60, s-maxage=60',
        'Content-Type': 'text/html; charset=utf-8',
      },
    })
  }

  return undefined
}

export const config = {
  matcher: ['/product/:path*'],
}
