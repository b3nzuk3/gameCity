import type { VercelRequest, VercelResponse } from '@vercel/node'

type Product = {
  _id: string
  name: string
  description?: string
  image: string
  images?: string[]
  brand?: string
  category?: string
  price: number
}

const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://www.gamecityelectronics.co.ke'
const API_BASE = process.env.API_BASE_URL || `${SITE_ORIGIN}/api`

export default async function handler(req: VercelRequest, res: VercelResponse) {
  try {
    const slug = String(req.query.slug || '').trim()
    if (!slug) {
      res.status(400).send('Missing slug')
      return
    }

    const productRes = await fetch(`${API_BASE}/products/slug/${encodeURIComponent(slug)}`)
    if (!productRes.ok) {
      res.status(404).send('Product not found')
      return
    }
    const product: Product = await productRes.json()

    const title = `${product.name} | GameCity Electronics`
    const description = (product.description || '').replace(/\s+/g, ' ').slice(0, 200) ||
      'Buy in Nairobi, Kenya. Fast delivery, best prices.'
    const image = product.image || (product.images && product.images[0]) || `${SITE_ORIGIN}/og-image.png`
    const url = `${SITE_ORIGIN}/product/${slug}`

    const html = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <link rel="canonical" href="${url}" />

    <meta property="og:type" content="product" />
    <meta property="og:url" content="${url}" />
    <meta property="og:title" content="${escapeHtml(title)}" />
    <meta property="og:description" content="${escapeHtml(description)}" />
    <meta property="og:image" content="${image}" />
    <meta property="og:image:width" content="1200" />
    <meta property="og:image:height" content="630" />
    <meta property="og:site_name" content="GameCity Electronics" />

    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${url}" />
    <meta name="twitter:title" content="${escapeHtml(title)}" />
    <meta name="twitter:description" content="${escapeHtml(description)}" />
    <meta name="twitter:image" content="${image}" />

    <meta http-equiv="refresh" content="0; url=${url}" />
  </head>
  <body>
    <p>Redirecting to <a href="${url}">${url}</a>…</p>
  </body>
</html>`

    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    // Cache bots for a bit, allow revalidation
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch (err: any) {
    res.status(500).send(err?.message || 'Server error')
  }
}

function escapeHtml(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}


