import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const robots = readFileSync('public/robots.txt', 'utf8')

test('robots exposes the sitemap and keeps public catalog routes crawlable', () => {
  assert.match(robots, /^Sitemap:\s+https:\/\/www\.gamecityelectronics\.co\.ke\/sitemap\.xml$/m)
  assert.match(robots, /^Allow:\s+\/category\/$/m)
  assert.match(robots, /^Allow:\s+\/product\/$/m)
  assert.doesNotMatch(robots, /^Crawl-delay:/m)
})

test('generated public HTML has one consolidated JSON-LD graph', () => {
  const html = readFileSync('dist/index.html', 'utf8')
  const scripts = [...html.matchAll(/<script[^>]+type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)]
  assert.equal(scripts.length, 1)
  const graph = JSON.parse(scripts[0][1])
  assert.equal(graph['@context'], 'https://schema.org')
  assert.ok(Array.isArray(graph['@graph']))
  assert.equal(graph['@graph'].filter((entity) => entity['@type'] === 'Organization').length, 1)
  assert.equal(graph['@graph'].filter((entity) => entity['@type'] === 'WebSite').length, 1)
})

test('not-found metadata is noindex in the source', () => {
  const source = readFileSync('src/pages/NotFound.tsx', 'utf8')
  assert.match(source, /noindex/)
})

