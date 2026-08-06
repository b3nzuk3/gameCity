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

const manifest = JSON.parse(await readFile('public/catalog-manifest.json', 'utf8'))
const entries = new Map()

for (const path of [...STATIC_ROUTES, ...manifest.products.map((product) => product.path)]) {
  const normalized = normalizePath(path)
  if (normalized) entries.set(normalized, {})
}

for (const product of manifest.products) {
  const path = normalizePath(product.path)
  if (path && product.updatedAt) entries.set(path, { lastmod: product.updatedAt })
}

const urls = [...entries.entries()].map(([path, metadata]) => {
  const lastmod = metadata.lastmod ? `\n    <lastmod>${escapeXml(metadata.lastmod)}</lastmod>` : ''
  return `  <url>\n    <loc>${escapeXml(`${SITE_URL}${path}`)}</loc>${lastmod}\n  </url>`
}).join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
await import('node:fs/promises').then(({ mkdir, writeFile }) => mkdir('public', { recursive: true }).then(() => writeFile('public/sitemap.xml', sitemap)))
console.log(`Generated sitemap.xml with ${STATIC_ROUTES.length} static routes and ${manifest.products.length} product routes (complete=${manifest.complete})`)
if (!manifest.complete) console.warn('Sitemap does not represent the complete catalog because the manifest was truncated or unavailable.')
