export default async function handler(req, res) {
  try {
    const SITE_ORIGIN = process.env.SITE_ORIGIN || 'https://www.gamecityelectronics.co.ke'
    const API_BASE = process.env.API_BASE_URL || process.env.VITE_API_URL || ''

    const slug = String((req.query && req.query.slug) || '').trim()
    if (!slug) {
      res.status(400).send('Missing slug')
      return
    }

    const apiBases = [API_BASE, `${SITE_ORIGIN}/api`, 'http://localhost:5000/api'].filter(Boolean)

    let product = null
    let lastError
    for (const base of apiBases) {
      try {
        const r = await fetch(`${base}/products/slug/${encodeURIComponent(slug)}`)
        if (r.ok) {
          product = await r.json()
          break
        }
        lastError = `Status ${r.status} from ${base}`
      } catch (e) {
        lastError = (e && e.message) || e
      }
    }

    const title = product ? `${product.name} | GameCity Electronics` : `${toTitle(slug)} | GameCity Electronics`
    const description = product && product.description
      ? product.description.replace(/\s+/g, ' ').slice(0, 200)
      : 'Find detailed specs and best prices in Nairobi, Kenya. Fast delivery across Kenya.'
    const image = product && (product.image || (product.images && product.images[0]))
      ? (product.image || product.images[0])
      : `${SITE_ORIGIN}/gamecity.png`
    const url = `${SITE_ORIGIN}/product/${slug}`

    const html = buildHtml({ title, description, image, url })

    if (!product && lastError) res.setHeader('X-OG-Fallback', String(lastError))
    res.setHeader('Content-Type', 'text/html; charset=utf-8')
    res.setHeader('Cache-Control', 'public, max-age=300, s-maxage=600, stale-while-revalidate=86400')
    res.status(200).send(html)
  } catch (err) {
    res.status(500).send((err && err.message) || 'Server error')
  }
}

function buildHtml({ title, description, image, url }) {
  return `<!doctype html>
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
}

function escapeHtml(input) {
  return String(input)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function toTitle(slug) {
  return String(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (m) => m.toUpperCase())
}
