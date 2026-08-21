/**
 * Vercel serverless function: GET /google-merchant-feed.xml
 *
 * Serves a Google Merchant Center RSS 2.0 product feed built from the same
 * bulk catalog API the website uses. Isolated feature — does not touch
 * sitemap, robots, routing, prerendering or any SEO output.
 */

import { SITE_URL, buildMerchantFeed, fetchAllProducts } from '../lib/google-merchant-feed'

export const config = {
  maxDuration: 30,
}

const CACHE_CONTROL = 'public, max-age=1800'

interface HandlerRequest {
  method?: string
}

interface HandlerResponse {
  statusCode?: number
  status(code: number): HandlerResponse
  setHeader(name: string, value: string): HandlerResponse
  end(body?: string): void
}

export default async function handler(req: HandlerRequest, res: HandlerResponse) {
  if (req.method === 'OPTIONS') {
    res.status(204).end()
    return
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.setHeader('Allow', 'GET, HEAD')
    res.status(405).setHeader('Content-Type', 'application/json').end('{"error":"Method not allowed"}')
    return
  }

  const apiUrl = normalizeApiBase(
    process.env.API_BASE_URL ||
      process.env.VITE_API_URL ||
      process.env.VITE_BACKEND_URL ||
      process.env.BACKEND_URL ||
      ''
  )

  try {
    if (!apiUrl) {
      throw new Error('Catalog API not configured')
    }
    const products = await fetchAllProducts(apiUrl)
    const { xml, includedCount, excluded } = buildMerchantFeed(products)

    console.log(
      `Google Merchant feed generated: ${includedCount} included, ${excluded.length} excluded`
    )
    for (const item of excluded) {
      console.warn(
        `Merchant feed excluded product ${item.productId ?? '<no-id>'} (${item.name ?? '<no-name>'}): ${item.reason}`
      )
    }

    res.statusCode = 200
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', CACHE_CONTROL)
    res.end(xml)
  } catch (error) {
    console.error('Error generating Google Merchant feed:', error)

    // Never serve an invalid/partial feed to Merchant Center; fail loudly.
    const fallbackXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>GameCity Electronics</title>
    <link>${SITE_URL}</link>
    <description>Product feed temporarily unavailable</description>
  </channel>
</rss>`
    res.statusCode = 503
    res.setHeader('Content-Type', 'application/xml; charset=utf-8')
    res.setHeader('Cache-Control', 'no-store')
    res.setHeader('Retry-After', '300')
    res.end(fallbackXml)
  }
}

function normalizeApiBase(value: unknown): string {
  const base = String(value || '').replace(/\/$/, '')
  if (!base) return ''
  return base.endsWith('/api') ? base : `${base}/api`
}
