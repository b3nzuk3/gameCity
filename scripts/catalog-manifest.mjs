import { writeFile } from 'node:fs/promises'

export const SITE_URL = process.env.SITE_URL || 'https://www.gamecityelectronics.co.ke'
export const API_URL = (
  process.env.PRERENDER_API_URL ||
  process.env.VITE_API_URL ||
  'http://localhost:5001/api'
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

// Fetch the complete catalog by default. Set PRERENDER_PRODUCT_LIMIT explicitly for a bounded preview build.
const limit = Math.max(0, Number(process.env.PRERENDER_PRODUCT_LIMIT || 0))
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

export const productPath = (product, suffix = '') => {
  const name = product?.name
  if (!name || (!product?._id && !product?.id)) return null
  return `/product/${slugifyProduct(name).replace(/-nairobi$/, '')}${suffix}-nairobi`
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

  try {
    while (true) {
      const data = await fetchJson(
        `${API_URL}/products?page=${page}&limit=${pageSize}`
      )
      const batch = Array.isArray(data.products) ? data.products : []
      products.push(...batch)
      const hasMore = data.hasMore === true || page < Number(data.pages || page)
      if (!batch.length || !hasMore || (limit > 0 && products.length >= limit)) {
        if (limit > 0 && products.length >= limit && hasMore) complete = false
        break
      }
      page += 1
    }
  } catch (error) {
    if (strict) {
      throw new Error(`Catalog manifest fetch failed from ${API_URL}: ${error.message}`)
    }
    complete = false
    console.warn(`Catalog manifest unavailable; continuing with static routes: ${error.message}`)
  }

  const selectedProducts = limit > 0 ? products.slice(0, limit) : products
  const unique = new Map()
  for (const product of selectedProducts) {
    const basePath = productPath(product)
    const path = basePath && unique.has(basePath)
      ? productPath(product, `-${String(product._id || product.id)}`)
      : basePath
    if (path && !unique.has(path)) {
      unique.set(path, {
        id: String(product._id || product.id),
        name: product.name,
        path,
        category: product.category || null,
        updatedAt: product.updatedAt || product.updated_at || null,
        // Keep the single catalog response available to the prerenderer. This
        // prevents product/category HTML generation from refetching the API.
        data: product,
      })
    }
  }

  return {
    products: [...unique.values()],
    complete,
    source: API_URL,
    truncated: limit > 0 && products.length > limit,
  }
}

export function categoryRoutesFromManifest(manifest, pageSize = 12) {
  const counts = new Map([['all', manifest.products.length]])
  for (const product of manifest.products) {
    const category = String(product.category || '').trim().toLowerCase().replace(/\s+/g, '-')
    if (category) counts.set(category, (counts.get(category) || 0) + 1)
  }

  return [...counts.entries()].flatMap(([category, total]) => {
    const pages = Math.max(1, Math.ceil(total / pageSize))
    return Array.from({ length: pages }, (_, index) =>
      `/category/${category}${index === 0 ? '' : `?page=${index + 1}`}`
    )
  })
}

export async function writeCatalogManifest(output = 'public/catalog-manifest.json') {
  const manifest = await fetchCatalogManifest()
  if (strict && (!manifest.complete || manifest.truncated)) {
    throw new Error('Production catalog is incomplete; refusing to write a prerender manifest')
  }
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
  if (process.argv.includes('--inspect')) {
    for (const product of manifest.products) console.log(product.path)
  }
}
