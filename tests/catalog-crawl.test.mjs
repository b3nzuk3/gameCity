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
      const html = readFileSync(`dist/category/${category}/page/${page}/index.html`, 'utf8')
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
  const pageOneStable = readFileSync('dist/category/graphics-cards/page/1/index.html', 'utf8')
  const pageTwo = readFileSync('dist/category/graphics-cards/page/2/index.html', 'utf8')
  const pageThree = readFileSync('dist/category/graphics-cards/page/3/index.html', 'utf8')
  const links = (html) => new Set(
    [...html.matchAll(/href="([^\"]*\/product\/[^\"]+)"/g)]
      .map((match) => new URL(match[1], 'https://www.gamecityelectronics.co.ke').pathname)
  )
  const first = links(pageOne)
  const firstStable = links(pageOneStable)
  const second = links(pageTwo)
  const third = links(pageThree)

  const graphicsCardsTotal = manifest.products.filter((product) =>
    ['graphics cards', 'graphics'].includes(String(product.category || '').trim().toLowerCase())
  ).length
  const expectedPages = Math.ceil(graphicsCardsTotal / 12)

  assert.equal(first.size, Math.min(12, graphicsCardsTotal))
  assert.deepEqual(firstStable, first)
  assert.equal(second.size, Math.min(12, Math.max(0, graphicsCardsTotal - 12)))
  assert.equal(third.size, Math.min(12, Math.max(0, graphicsCardsTotal - 24)))
  assert.ok(expectedPages >= 3)
  assert.equal([...first].some((path) => second.has(path)), false)
  assert.equal([...first].some((path) => third.has(path)), false)
  assert.equal([...second].some((path) => third.has(path)), false)
})

test('stable pagination pages keep self-referencing canonicals', () => {
  for (const page of [1, 2, 3]) {
    const html = readFileSync(`dist/category/graphics-cards/page/${page}/index.html`, 'utf8')
    const canonical = html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
    assert.equal(
      canonical,
      `https://www.gamecityelectronics.co.ke/category/graphics-cards/page/${page}`
    )
  }
})

test('every category pagination page matches its catalog slice', () => {
  const categoryEntries = new Map([['all', manifest.products]])
  for (const product of manifest.products) {
    const category = String(product.category || '').trim().toLowerCase().replace(/\s+/g, '-')
    if (category) categoryEntries.set(category, [
      ...(categoryEntries.get(category) || []),
      product,
    ])
  }

  for (const [category, entries] of categoryEntries) {
    const pages = Math.max(1, Math.ceil(entries.length / 12))
    const seen = new Set()
    for (let page = 1; page <= pages; page += 1) {
      const html = readFileSync(`dist/category/${category}/page/${page}/index.html`, 'utf8')
      const links = new Set(
        [...html.matchAll(/href="([^\"]*\/product\/[^\"]+)"/g)]
          .map((match) => new URL(match[1], 'https://www.gamecityelectronics.co.ke').pathname)
      )
      const expected = new Set(entries.slice((page - 1) * 12, page * 12).map((entry) => entry.path))
      assert.deepEqual(links, expected, `${category} page ${page} has the wrong product slice`)
      assert.equal([...seen].some((path) => links.has(path)), false, `${category} page ${page} overlaps an earlier page`)
      for (const link of links) seen.add(link)
    }
    assert.equal(seen.size, entries.length, `${category} does not expose every catalog product exactly once`)
  }
})
