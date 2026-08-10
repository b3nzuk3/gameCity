import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import test from 'node:test'

const staticRoutes = [
  '/',
  '/category/graphics-cards',
  '/category/pre-built',
  '/category/processors',
  '/category/monitors',
  '/category/accessories',
  '/category/power-supply',
  '/contact',
  '/privacy',
  '/terms',
  '/sitemap',
]

const manifest = JSON.parse(readFileSync('public/catalog-manifest.json', 'utf8'))
const productRoutes = manifest.products.map((product) => product.path)
const routes = [...staticRoutes, ...productRoutes]

function htmlPath(route) {
  return route === '/' ? 'dist/index.html' : `dist${route}/index.html`
}

function readRoute(route) {
  const path = htmlPath(route)
  assert.ok(existsSync(path), `missing prerendered HTML for ${route}`)
  return readFileSync(path, 'utf8')
}

function contentCount(html, pattern) {
  return [...html.matchAll(pattern)].length
}

function canonicalFrom(html) {
  return html.match(/<link[^>]+rel="canonical"[^>]+href="([^"]+)"/)?.[1]
}

test('every public prerender has one canonical and route-specific metadata', () => {
  for (const route of routes) {
    const html = readRoute(route)
    assert.equal(contentCount(html, /<title>/g), 1, route)
    assert.equal(contentCount(html, /<meta[^>]+name="description"/g), 1, route)
    assert.equal(contentCount(html, /<link[^>]+rel="canonical"/g), 1, route)
    assert.equal(contentCount(html, /<meta[^>]+property="og:url"/g), 1, route)
    assert.equal(contentCount(html, /<meta[^>]+property="og:description"/g), 1, route)

    const expected = route === '/'
      ? 'https://www.gamecityelectronics.co.ke/'
      : `https://www.gamecityelectronics.co.ke${route}`
    assert.equal(canonicalFrom(html), expected, route)
  }
})

test('non-homepage routes do not contain the homepage canonical', () => {
  const homepage = readRoute('/')
  const homepageCanonical = canonicalFrom(homepage)
  assert.equal(homepageCanonical, 'https://www.gamecityelectronics.co.ke/')

  for (const route of routes.slice(1)) {
    assert.notEqual(canonicalFrom(readRoute(route)), homepageCanonical, route)
  }
})
