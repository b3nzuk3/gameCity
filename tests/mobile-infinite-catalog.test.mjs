import assert from 'node:assert/strict'
import test from 'node:test'

import {
  catalogPagePath,
  mergeCatalogPage,
  nextCatalogPage,
  parseCatalogSnapshot,
  snapshotKey,
} from '../src/lib/infiniteCatalog.js'

const product = (id) => ({ id, name: `Product ${id}` })

test('merges one page at a time without duplicate pages or products', () => {
  const initial = mergeCatalogPage([], 1, [product('a'), product('b')])
  const repeated = mergeCatalogPage(initial, 1, [product('a'), product('b')])
  const appended = mergeCatalogPage(repeated, 2, [product('b'), product('c')])

  assert.deepEqual(appended, [
    { page: 1, products: [product('a'), product('b')] },
    { page: 2, products: [product('c')] },
  ])
})

test('keeps stable crawlable page paths', () => {
  assert.equal(catalogPagePath('graphics-cards', 1), '/category/graphics-cards/page/1')
  assert.equal(catalogPagePath('graphics-cards', 3), '/category/graphics-cards/page/3')
})

test('requests only the next available page and stops at the end', () => {
  const pages = [{ page: 1, products: [product('a')] }]
  assert.equal(nextCatalogPage(pages, 3, new Set([1])), 2)
  assert.equal(nextCatalogPage(pages, 3, new Set([1, 2])), null)
  assert.equal(nextCatalogPage([{ page: 3, products: [] }], 3, new Set([3])), null)
})

test('restores only snapshots for the same category and catalogue state', () => {
  const key = snapshotKey('graphics-cards', 'in-stock|price-low')
  const valid = JSON.stringify({
    version: 1,
    key,
    pages: [{ page: 1, products: [product('a')] }],
    scrollY: 640,
    activePage: 1,
    totalPages: 3,
  })

  assert.equal(parseCatalogSnapshot(valid, key)?.scrollY, 640)
  assert.equal(parseCatalogSnapshot(valid, snapshotKey('monitors', 'in-stock|price-low')), null)
  assert.equal(parseCatalogSnapshot('{bad json', key), null)
})

test('rejects malformed or out-of-range restored pages', () => {
  const key = snapshotKey('all', 'all')
  const malformed = JSON.stringify({
    version: 1,
    key,
    pages: [{ page: 4, products: [] }],
    scrollY: -1,
    activePage: 4,
    totalPages: 3,
  })

  assert.equal(parseCatalogSnapshot(malformed, key), null)
})

test('rejects a snapshot whose active page was not restored', () => {
  const key = snapshotKey('all', 'all')
  const missingActivePage = JSON.stringify({
    version: 1,
    key,
    pages: [{ page: 1, products: [product('a')] }],
    scrollY: 120,
    activePage: 2,
    totalPages: 3,
  })

  assert.equal(parseCatalogSnapshot(missingActivePage, key), null)
})
