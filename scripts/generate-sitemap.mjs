import { mkdir, writeFile } from 'node:fs/promises'

const siteUrl = 'https://www.gamecityelectronics.co.ke'
const publicRoutes = [
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

const urls = publicRoutes
  .map(
    (route) => `  <url>\n    <loc>${siteUrl}${route}</loc>\n  </url>`
  )
  .join('\n')

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`

await mkdir('public', { recursive: true })
await writeFile('public/sitemap.xml', sitemap)
console.log(`Generated sitemap.xml with ${publicRoutes.length} public routes`)
