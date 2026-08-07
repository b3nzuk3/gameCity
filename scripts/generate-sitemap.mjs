import { readFile } from 'node:fs/promises'
import { STATIC_ROUTES, SITE_URL } from './catalog-manifest.mjs'

const escapeXml = (value) => String(value)
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;')

const normalizePath = (path) => {
  if (!path || !path.startsWith('/') || path.includes('?') || path.includes('#')) return null
  return path === '/' ? path : path.replace(/\/$/, '')
}

const isValidLastmod = (value) => {
  if (!value) return false
  return !Number.isNaN(new Date(value).valueOf())
}

const manifest = JSON.parse(await readFile('public/catalog-manifest.json', 'utf8'))
const entries = new Map()

for (const path of [...STATIC_ROUTES, ...manifest.products.map((product) => product.path)]) {
  const normalized = normalizePath(path)
  if (normalized) entries.set(normalized, {})
}

for (const product of manifest.products) {
  const path = normalizePath(product.path)
  if (path && isValidLastmod(product.updatedAt)) {
    entries.set(path, { lastmod: new Date(product.updatedAt).toISOString() })
  }
}

const maxUrls = Math.max(1, Number(process.env.SITEMAP_MAX_URLS || 50000))
const urlEntries = [...entries.entries()]
const chunks = []
for (let index = 0; index < urlEntries.length; index += maxUrls) {
  chunks.push(urlEntries.slice(index, index + maxUrls))
}

const renderUrlset = (chunk) => {
  const urls = chunk.map(([path, metadata]) => {
    const lastmod = metadata.lastmod
      ? `\n    <lastmod>${escapeXml(metadata.lastmod)}</lastmod>`
      : ''
    return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}\n  </url>`
  }).join('\n')
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
}

const { mkdir, writeFile } = await import('node:fs/promises')
await mkdir('public', { recursive: true })
if (chunks.length <= 1) {
  await writeFile('public/sitemap.xml', renderUrlset(urlEntries))
} else {
  const sitemapLinks = chunks.map((_, index) =>
    `  <sitemap>\n    <loc>${escapeXml(`${SITE_URL}/sitemap-${index + 1}.xml`)}</loc>\n  </sitemap>`
  ).join('\n')
  const indexXml = `<?xml version="1.0" encoding="UTF-8"?>\n<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapLinks}\n</sitemapindex>\n`
  await Promise.all([
    writeFile('public/sitemap.xml', indexXml),
    ...chunks.map((chunk, index) =>
      writeFile(`public/sitemap-${index + 1}.xml`, renderUrlset(chunk))
    ),
  ])
}
console.log(`Generated sitemap.xml with ${STATIC_ROUTES.length} static routes and ${manifest.products.length} product routes (complete=${manifest.complete}, files=${chunks.length})`)
if (!manifest.complete) console.warn('Sitemap does not represent the complete catalog because the manifest was truncated or unavailable.')
