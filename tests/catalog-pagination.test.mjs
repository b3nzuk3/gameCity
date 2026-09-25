import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  buildPaginationHref,
  getPaginationItems,
} from '../src/lib/catalogPagination.js'
import {
  DESKTOP_PRODUCT_PAGE_SIZE,
  MOBILE_CATEGORY_PAGE_SIZE,
  MOBILE_SEARCH_PAGE_SIZE,
} from '../src/config/catalog.js'

const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const searchPage = readFileSync('src/pages/SearchPage.tsx', 'utf8')
const backendService = readFileSync('src/services/backendService.ts', 'utf8')
const productService = readFileSync('src/services/productService.ts', 'utf8')

test('desktop catalog page size is 25 without changing mobile batch sizes', () => {
  assert.equal(DESKTOP_PRODUCT_PAGE_SIZE, 25)
  assert.equal(MOBILE_CATEGORY_PAGE_SIZE, 12)
  assert.equal(MOBILE_SEARCH_PAGE_SIZE, 50)
})

test('pagination handles one, two, and three pages without ellipses', () => {
  assert.deepEqual(getPaginationItems(1, 1), [1])
  assert.deepEqual(getPaginationItems(1, 2), [1, 2])
  assert.deepEqual(getPaginationItems(2, 3), [1, 2, 3])
})

test('pagination gives beginning, middle, and end context for large catalogues', () => {
  assert.deepEqual(getPaginationItems(1, 10), [1, 2, 3, 'ellipsis', 10])
  assert.deepEqual(getPaginationItems(5, 10), [1, 'ellipsis', 4, 5, 6, 'ellipsis', 10])
  assert.deepEqual(getPaginationItems(10, 10), [1, 'ellipsis', 8, 9, 10])
})

test('pagination clamps invalid current pages to the available range', () => {
  assert.deepEqual(getPaginationItems(0, 4), [1, 2, 3, 4])
  assert.deepEqual(getPaginationItems(99, 4), [1, 2, 3, 4])
})

test('pagination hrefs preserve filters and query state for path- and query-based routes', () => {
  assert.equal(
    buildPaginationHref(
      '/category/all/page/3',
      '?brand=Acme&sort=price&page=2',
      3,
      { hash: '#products' }
    ),
    '/category/all/page/3?brand=Acme&sort=price#products'
  )
  assert.equal(
    buildPaginationHref('/search', '?q=rtx&sort=name&page=2', 3, {
      queryKey: 'page',
      hash: '#results',
    }),
    '/search?q=rtx&sort=name&page=3#results'
  )
})

test('category listings request 25-item desktop pages and retain 12-item mobile batches', () => {
  assert.match(categoryPage, /DESKTOP_PRODUCT_PAGE_SIZE/)
  assert.match(categoryPage, /MOBILE_CATEGORY_PAGE_SIZE/)
  assert.match(categoryPage, /fetchProductsByCategory\(categoryParam, page, MOBILE_CATEGORY_PAGE_SIZE\)/)
  assert.match(categoryPage, /useCategoryProducts\([\s\S]*?categoryPageSize/)
  assert.match(categoryPage, /const totalPages = categoryQuery\.data\?\.pages \|\| 1/)
  assert.match(productService, /limit = CATEGORY_PAGE_SIZE/)
  assert.match(productService, /\?page=\$\{pageNumber\}&limit=\$\{limit\}/)
})

test('search uses the desktop page size and preserves query parameters in page links', () => {
  assert.match(searchPage, /DESKTOP_PRODUCT_PAGE_SIZE/)
  assert.match(searchPage, /MOBILE_SEARCH_PAGE_SIZE/)
  assert.match(searchPage, /buildPaginationHref\(currentUrl\.pathname, currentUrl\.search/)
  assert.match(categoryPage, /buildPaginationHref\(/)
  assert.match(backendService, /limit: String\(limit\)/)
  assert.match(backendService, /pages: number[\s\S]*?total: number/)
})
