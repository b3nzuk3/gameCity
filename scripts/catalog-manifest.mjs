import { writeFile } from 'node:fs/promises'

export const SITE_URL = process.env.SITE_URL || 'https://www.gamecityelectronics.co.ke'
export const API_URL = (
  process.env.PRERENDER_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:5000/api'
).replace(/\/$/, '')

export const STATIC_ROUTES = [
  '/',
  '/contact',
  '/privacy',
  '/terms',
  '/sitemap',
  '/category/pre-built',
  '/category/graphics-cards',
  '/category/monitors',
  '/category/processors',
  '/category/power-supply',
  '/category/accessories',
]

const limit = Math.max(0, Number(process.env.PRERENDER_PRODUCT_LIMIT || 24))
const pageSize = Math.min(100, Math.max(1, Number(process.env.PRERENDER_PAGE_SIZE || 100)))
const timeoutMs = Math.max(1000, Number(process.env.PRERENDER_TIMEOUT_MS || 8000))
const strict = process.env.PRERENDER_STRICT === 'true'

export const slugifyProduct = (name) =>
  `${String(name)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')}-nairobi`

export const productPath = (product) => {
  const name = product?.name
  if (!name || (!product?._id && !product?.id)) return null
  return `/product/${slugifyProduct(name)}`
}

const fetchJson = async (url) => {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetch(url, { signal: controller.signal })
    if (!response.ok) throw new Error(`HTTP ${response.status}`)
    return response.json()
  } finally {
    clearTimeout(timer)
  }
}

export async function fetchCatalogManifest() {
  const products = []
  let page = 1
  let complete = true

  if (limit === 0) {
    return { products, complete: true, source: API_URL, truncated: false }
  }

  try {
    while (products.length < limit) {
      const data = await fetchJson(
        `${API_URL}/products?page=${page}&limit=${pageSize}`
      )
      const batch = Array.isArray(data.products) ? data.products : []
      products.push(...batch)
      if (!batch.length || batch.length < pageSize || page >= (data.pages || page)) break
      page += 1
    }
  } catch (error) {
    if (strict) {
      throw new Error(`Catalog manifest fetch failed from ${API_URL}: ${error.message}`)
    }
    complete = false
    console.warn(`Catalog manifest unavailable; continuing with static routes: ${error.message}`)
  }

  const unique = new Map()
  for (const product of products.slice(0, limit)) {
    const path = productPath(product)
    if (path && !unique.has(path)) {
      unique.set(path, {
        id: String(product._id || product.id),
        name: product.name,
        path,
        updatedAt: product.updatedAt || product.updated_at || null,
      })
    }
  }

  return {
    products: [...unique.values()],
    complete: complete && products.length <= limit,
    source: API_URL,
    truncated: products.length > limit,
  }
}

export async function writeCatalogManifest(output = 'public/catalog-manifest.json') {
  const manifest = await fetchCatalogManifest()
  await writeFile(
    output,
    `${JSON.stringify({
      generatedAt: new Date().toISOString(),
      siteUrl: SITE_URL,
      ...manifest,
    }, null, 2)}\n`
  )
  return manifest
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const manifest = await writeCatalogManifest()
  console.log(
    `Catalog manifest: ${manifest.products.length} products, complete=${manifest.complete}`
  )
}
