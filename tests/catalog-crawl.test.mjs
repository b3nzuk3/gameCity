import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const manifest = JSON.parse(readFileSync('public/catalog-manifest.json', 'utf8'))

test('production catalog manifest is complete and not truncated', () => {
  assert.equal(manifest.complete, true)
  assert.notEqual(manifest.truncated, true)
  assert.ok(manifest.products.length > 0)
})

test('sitemap product URLs are discoverable from prerendered category HTML', () => {
  const sitemapProducts = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>([^<]+\/product\/[^<]+)<\/loc>/g)]
    .map((match) => new URL(match[1]).pathname)
  const htmlProducts = new Set()

  const categoryCounts = new Map([['all', manifest.products.length]])
  for (const product of manifest.products) {
    const category = String(product.category || '').trim().toLowerCase().replace(/\s+/g, '-')
    if (category) categoryCounts.set(category, (categoryCounts.get(category) || 0) + 1)
  }
  for (const [category, total] of categoryCounts) {
    const pages = Math.max(1, Math.ceil(total / 12))
    for (let page = 1; page <= pages; page += 1) {
      const suffix = page === 1 ? '' : `?page=${page}`
      const html = readFileSync(`dist/category/${category}${suffix}/index.html`, 'utf8')
      for (const match of html.matchAll(/href="([^\"]*\/product\/[^\"]+)"/g)) {
        htmlProducts.add(new URL(match[1], 'https://www.gamecityelectronics.co.ke').pathname)
      }
    }
  }

  assert.ok(htmlProducts.size > 0)
  const missing = sitemapProducts.filter((path) => !htmlProducts.has(path))
  assert.deepEqual(missing, [])
})

test('representative pagination pages expose distinct product links', () => {
  const pageOne = readFileSync('dist/category/graphics-cards/index.html', 'utf8')
  const pageTwo = readFileSync('dist/category/graphics-cards?page=2/index.html', 'utf8')
  const links = (html) => new Set(
    [...html.matchAll(/href="([^\"]*\/product\/[^\"]+)"/g)]
      .map((match) => new URL(match[1], 'https://www.gamecityelectronics.co.ke').pathname)
  )
  const first = links(pageOne)
  const second = links(pageTwo)

  assert.equal(first.size, 12)
  assert.equal(second.size, 12)
  assert.equal([...first].some((path) => second.has(path)), false)
})
