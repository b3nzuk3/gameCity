/**
 * Google Merchant Center product feed generation.
 *
 * Isolated feature: reads ONLY the bulk catalog API (same single source of
 * truth the website uses) and renders an RSS 2.0 feed with the Google
 * Merchant namespace. It does not touch sitemap, robots, routing,
 * prerendering or any SEO output.
 *
 * Product data rules (mirrors the storefront):
 * - price: active offers are applied exactly like src/lib/utils.ts
 *   getOfferPrice(), so <g:price> always matches the website price.
 * - availability: countInStock > 0 => in_stock, otherwise out_of_stock.
 * - id: stable Mongo _id (never regenerated between feed runs).
 * - condition: catalog "New" => new, "Pre-Owned" => used. No invented values.
 * - gtin/mpn: only emitted when a real value exists in specifications.
 */

export interface CatalogProduct {
  _id?: string | { toString(): string }
  id?: string
  name?: string
  description?: string
  brand?: string
  category?: string
  price?: number
  countInStock?: number
  condition?: string
  image_r2?: string | null
  images_r2?: string[]
  image?: string | null
  images?: string[]
  image_r2_variants?: { large?: string; medium?: string; thumbnail?: string } | null
  updatedAt?: string
  offer?: {
    enabled?: boolean
    type?: 'percentage' | 'fixed'
    amount?: number
    startDate?: string | Date | null
    endDate?: string | Date | null
  } | null
  specifications?: Record<string, unknown> | null
}

export interface ManifestProduct {
  id: string
  name: string
  path: string
  category?: string | null
  updatedAt?: string | null
  data?: CatalogProduct
}

export const SITE_URL = 'https://www.gamecityelectronics.co.ke'
export const FEED_TITLE = 'GameCity Electronics'
export const DEFAULT_CONDITION = 'new'

/** Escape a value for safe inclusion in XML text/attribute content. */
export function escapeXml(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

/**
 * Offer helpers — ported from src/lib/utils.ts so feed prices match the
 * website exactly (percentage/fixed, date-bounded).
 */
export function isOfferActive(offer?: CatalogProduct['offer']): boolean {
  if (!offer || !offer.enabled) return false
  const now = Date.now()
  const start = offer.startDate ? new Date(offer.startDate).getTime() : undefined
  const end = offer.endDate ? new Date(offer.endDate).getTime() : undefined
  if (start !== undefined && Number.isNaN(start)) return false
  if (end !== undefined && Number.isNaN(end)) return false
  if (start !== undefined && now < start) return false
  if (end !== undefined && now > end) return false
  return (offer.amount ?? 0) > 0 && (!!offer.type || offer.type === 'fixed')
}

export function getOfferPrice(original: number, offer?: CatalogProduct['offer']): number {
  if (!isOfferActive(offer)) return original
  const amount = offer?.amount ?? 0
  if (offer?.type === 'fixed') return Math.max(0, original - amount)
  const discount = Math.min(100, Math.max(0, amount))
  return Math.max(0, Math.round(original * (1 - discount / 100)))
}

function formatPrice(price: number): string {
  return `${price.toFixed(2)} KES`
}

function mapAvailability(countInStock: unknown): string {
  return typeof countInStock === 'number' && countInStock > 0 ? 'in_stock' : 'out_of_stock'
}

function mapCondition(condition: unknown): string {
  const normalized = String(condition || '').trim().toLowerCase()
  if (normalized === 'pre-owned' || normalized === 'used') return 'used'
  // Catalog enum is ['New', 'Pre-Owned']; anything else falls back to 'new'.
  return DEFAULT_CONDITION
}

function resolveImageUrl(product: CatalogProduct): string | null {
  const candidates = [
    product.image_r2_variants?.large,
    product.image_r2_variants?.medium,
    product.image_r2,
    Array.isArray(product.images_r2) ? product.images_r2[0] : undefined,
    Array.isArray(product.images) ? product.images[0] : undefined,
    product.image,
  ].filter((url): url is string => Boolean(url))

  for (const raw of candidates) {
    const url = String(raw).trim()
    if (!url) continue
    if (/^https?:\/\//i.test(url)) {
      // Some legacy rows store URLs with raw spaces / non-ASCII characters
      // (e.g. "...0f0.3ms gaming monitor – nairobi kenya"). Strict fetchers
      // reject those as malformed. Only URLs that actually contain such
      // characters are percent-encoded; already-clean URLs (including ones
      // with existing %-escapes) are passed through untouched to avoid
      // double-encoding.
      const normalized = url.replace(/^http:/i, 'https:')
      let hasUnsafeRawChars = false
      for (let i = 0; i < normalized.length; i += 1) {
        const code = normalized.charCodeAt(i)
        if (code < 33 || code > 126) {
          hasUnsafeRawChars = true
          break
        }
      }
      if (hasUnsafeRawChars) {
        try {
          return encodeURI(normalized)
        } catch {
          return normalized
        }
      }
      return normalized
    }
    if (url.startsWith('/')) return `${SITE_URL}${url}`
  }
  return null
}

/** Look for real GTIN/MPN values in the free-form specifications object. */
function findIdentifier(
  specs: Record<string, unknown> | null | undefined,
  patterns: RegExp
): string | null {
  if (!specs || typeof specs !== 'object') return null
  for (const [key, value] of Object.entries(specs)) {
    if (value === null || value === undefined) continue
    if (patterns.test(key)) {
      const str = String(value).trim()
      // Reject placeholder-ish values ("N/A", "-", "TBD", empty)
      if (str && !/^(n\/?a|none|tbd|tbc|-+|\?)$/i.test(str) && /^[\w-]{4,20}$/.test(str)) {
        return str
      }
    }
  }
  return null
}

export interface ExcludedProduct {
  productId: string | null
  name: string | null
  reason: string
}

interface FeedItem {
  id: string
  dedupeId: string
  title: string
  description: string
  link: string
  imageUrl: string
  availability: string
  price: string
  condition: string
  brand: string
  gtin: string | null
  mpn: string | null
}

const GTIN_KEY = /gtin|ean|upc|isbn|barcode/i
const MPN_KEY = /^(mpn|manufacturer.*part.*(no|number)?|part.?number|model.?number)$/i

/**
 * Map one catalog product to a feed item, or return an exclusion reason.
 * Pure function — no I/O.
 */
export function mapFeedItem(product: CatalogProduct): { item: FeedItem } | { exclude: ExcludedProduct } {
  const rawId = product._id ?? product.id
  const id = rawId ? String(rawId) : null

  const name = typeof product.name === 'string' ? product.name.trim() : ''
  const description =
    typeof product.description === 'string'
      ? product.description.replace(/\s+/g, ' ').trim()
      : ''
  const link = name && id ? `${SITE_URL}/product/${slugify(name)}` : null
  const imageUrl = resolveImageUrl(product)
  const price = typeof product.price === 'number' && product.price > 0 ? product.price : null

  if (!id) {
    return { exclude: { productId: null, name: name || null, reason: 'missing stable product ID (_id)' } }
  }
  if (!name || !link) {
    return { exclude: { productId: id, name: name || null, reason: 'missing valid product name / landing page slug' } }
  }
  if (!description) {
    return { exclude: { productId: id, name, reason: 'missing usable description' } }
  }
  if (!imageUrl) {
    return { exclude: { productId: id, name, reason: 'missing usable image URL' } }
  }
  if (price === null) {
    return { exclude: { productId: id, name, reason: 'missing valid price' } }
  }

  const finalPrice = getOfferPrice(price, product.offer)

  return {
    item: {
      id,
      dedupeId: id,
      title: name.slice(0, 150),
      description: description.slice(0, 5000),
      link,
      imageUrl,
      availability: mapAvailability(product.countInStock),
      price: formatPrice(finalPrice),
      condition: mapCondition(product.condition),
      brand: String(product.brand || '').trim(),
      gtin: findIdentifier(product.specifications, GTIN_KEY),
      mpn: findIdentifier(product.specifications, MPN_KEY),
    },
  }
}

/**
 * Build the complete RSS 2.0 + Google Merchant namespace feed from products.
 * Returns the XML document and per-product exclusion details.
 */
export function buildMerchantFeed(products: CatalogProduct[]): {
  xml: string
  includedCount: number
  excluded: ExcludedProduct[]
} {
  const items: FeedItem[] = []
  const excluded: ExcludedProduct[] = []

  for (const product of products) {
    const result = mapFeedItem(product)
    if ('item' in result) items.push(result.item)
    else excluded.push(result.exclude)
  }

  // Mirror scripts/catalog-manifest.mjs: when two products share a base
  // slug, the first (API order) keeps the plain slug and later ones get
  // `-<mongoId>` appended before the -nairobi suffix. The site's slug
  // resolver (GET /api/products/slug/:slug) understands that id suffix,
  // so these links resolve to the exact product.
  const seenSlugs = new Map<string, number>()
  const withLinks = items.map((item) => {
    const base = item.link!
    let link = base
    const count = seenSlugs.get(base) ?? 0
    seenSlugs.set(base, count + 1)
    if (count > 0 && item.dedupeId) {
      link = base.replace(/-nairobi$/, `-${item.dedupeId}-nairobi`)
    }
    return { ...item, link }
  })

  // Stable IDs are required by Merchant Center; de-duplicate defensively.
  const seen = new Set<string>()
  const uniqueItems = withLinks.filter((item) => {
    if (seen.has(item.id)) return false
    seen.add(item.id)
    return true
  })

  const escapedItems = uniqueItems.map(
    (item) => `  <item>
    <g:id>${escapeXml(item.id)}</g:id>
    <g:title>${escapeXml(item.title)}</g:title>
    <g:description>${escapeXml(item.description)}</g:description>
    <g:link>${escapeXml(item.link)}</g:link>
    <g:image_link>${escapeXml(item.imageUrl)}</g:image_link>
    <g:availability>${escapeXml(item.availability)}</g:availability>
    <g:price>${escapeXml(item.price)}</g:price>
    <g:condition>${escapeXml(item.condition)}</g:condition>
    <g:brand>${escapeXml(item.brand)}</g:brand>${
      item.gtin ? `\n    <g:gtin>${escapeXml(item.gtin)}</g:gtin>` : ''
    }${item.mpn ? `\n    <g:mpn>${escapeXml(item.mpn)}</g:mpn>` : ''}
  </item>`
  )

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>${escapeXml(FEED_TITLE)}</title>
    <link>${escapeXml(SITE_URL)}</link>
    <description>${escapeXml('Google Merchant Center product feed for GameCity Electronics')}</description>
${escapedItems.join('\n')}
  </channel>
</rss>`

  return { xml, includedCount: uniqueItems.length, excluded }
}

/** Slug logic identical to scripts/catalog-manifest.mjs / sitemap generation. */
export function slugify(text: string): string {
  return `${String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')}-nairobi`
}

interface ApiProductsResponse {
  products?: CatalogProduct[]
  pages?: number
  hasMore?: boolean
}

async function fetchJson(url: string, timeoutMs: number): Promise<ApiProductsResponse> {
  const response = await fetch(url, {
    headers: { Accept: 'application/json' },
    signal: AbortSignal.timeout(timeoutMs),
  })
  if (!response.ok) throw new Error(`HTTP ${response.status} from ${url}`)
  return (await response.json()) as ApiProductsResponse
}

/**
 * Fetch the full catalog through the existing bulk paginated API
 * (`GET /api/products`) with a bounded page count as a runaway guard.
 */
export async function fetchAllProducts(apiUrl: string, timeoutMs = 10000): Promise<CatalogProduct[]> {
  const base = apiUrl.replace(/\/$/, '')
  const pageSize = 100
  const maxPages = 50 // runaway guard; 143 products currently need 2 requests
  const all: CatalogProduct[] = []

  for (let page = 1; page <= maxPages; page += 1) {
    const data = await fetchJson(`${base}/products?page=${page}&limit=${pageSize}`, timeoutMs)
    const batch = Array.isArray(data.products) ? data.products : []
    all.push(...batch)
    const hasMore = data.hasMore === true || page < Number(data.pages || page)
    if (!batch.length || !hasMore) break
  }
  return all
}
