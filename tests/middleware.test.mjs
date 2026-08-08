import test from 'node:test'
import assert from 'node:assert/strict'

process.env.API_BASE_URL = 'https://api.example.test/api'
process.env.VITE_BACKEND_URL = ''

const { default: middleware, lookupProduct, productLookupUrl } = await import('../middleware.js')
const API_URL = 'https://api.example.test/api'

test('builds the canonical product lookup URL', () => {
  assert.equal(
    productLookupUrl('some product/nairobi', API_URL),
    'https://api.example.test/api/products/slug/some%20product%2Fnairobi'
  )
})

test('returns the normal path for an existing product', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('{}', { status: 200 })

  try {
    const response = await middleware(
      new Request('https://shop.example.test/product/existing-product'),
    )
    assert.equal(response, undefined)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('returns a 404 HTML shell for a confirmed missing product', async () => {
  const originalFetch = globalThis.fetch
  const calls = []
  globalThis.fetch = async (url) => {
    calls.push(String(url))
    if (String(url).includes('/products/slug/')) {
      return new Response('', { status: 404 })
    }
    return new Response('<html><body id="root"></body></html>', {
      status: 200,
      headers: { 'content-type': 'text/html; charset=utf-8' },
    })
  }

  try {
    const response = await middleware(
      new Request('https://shop.example.test/product/missing-product'),
    )
    assert.equal(response.status, 404)
    assert.equal(response.headers.get('content-type'), 'text/html; charset=utf-8')
    assert.match(await response.text(), /Product Not Found/)
    assert.deepEqual(calls, [
      'https://api.example.test/api/products/slug/missing-product',
    ])
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('fails open when the product API is unavailable', async () => {
  const originalFetch = globalThis.fetch
  globalThis.fetch = async () => new Response('', { status: 503 })

  try {
    const response = await middleware(
      new Request('https://shop.example.test/product/api-unavailable'),
    )
    assert.equal(response, undefined)
  } finally {
    globalThis.fetch = originalFetch
  }
})

test('ignores non-product routes', async () => {
  const response = await middleware(
    new Request('https://shop.example.test/category/graphics-cards'),
  )

  assert.equal(response, undefined)
})

// Directly exercise lookupProduct with a deterministic fetch implementation.
test('classifies product API responses', async () => {
  const { status: exists } = await lookupProduct('exists', async () => new Response('{}', { status: 200 }), API_URL)
  const { status: missing } = await lookupProduct('missing', async () => new Response('', { status: 404 }), API_URL)
  const { status: unavailable } = await lookupProduct('down', async () => new Response('', { status: 500 }), API_URL)

  assert.equal(exists, 'exists')
  assert.equal(missing, 'missing')
  assert.equal(unavailable, 'unavailable')
})

test('exports the product matcher', async () => {
  const { config } = await import('../middleware.js')
  assert.deepEqual(config, { matcher: ['/product/:path*'] })
})

// Keep this test file useful under Node 20, which supports the Web Fetch APIs
// used by Vercel middleware.
assert.equal(typeof Request, 'function')
assert.equal(typeof Response, 'function')
assert.equal(typeof fetch, 'function')
