import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const searchPage = readFileSync('src/pages/SearchPage.tsx', 'utf8')
const backendService = readFileSync('src/services/backendService.ts', 'utf8')


test('product search service sends server-owned sorting and filters', () => {
  assert.match(backendService, /type ProductQueryFilters/)
  assert.match(backendService, /filters\?: ProductQueryFilters/)
  assert.match(backendService, /params\.set\('sort', filters\.sort\)/)
  assert.match(backendService, /params\.set\('filterBy', filters\.filterBy\)/)
  assert.match(backendService, /params\.set\('condition', filters\.condition\)/)
  assert.match(backendService, /params\.append\('brands', brand\)/)
  assert.match(backendService, /params\.append\('categories', category\)/)
  assert.match(backendService, /params\.append\(`spec\.\$\{specificationId\}`/)
})

test('search page restores filter state from URL and resets pagination through URL updates', () => {
  assert.match(searchPage, /params\.get\('sort'\)/)
  assert.match(searchPage, /params\.get\('filterBy'\)/)
  assert.match(searchPage, /params\.getAll\('brands'\)/)
  assert.match(searchPage, /params\.getAll\('categories'\)/)
  assert.match(searchPage, /key\.startsWith\('spec\.'\)/)
  assert.match(searchPage, /setSearchParams\(/)
  assert.match(searchPage, /nextParams\.set\('page', '1'\)/)
  assert.match(searchPage, /setSearchParams\(nextParams\)/)
  assert.doesNotMatch(searchPage, /const sortedProducts =/)
})

test('empty filtered search retains the filter controls and a clear action', () => {
  assert.match(searchPage, /products\.length > 0 \|\| Boolean\(searchTerm\.trim\(\)\)/)
  assert.match(searchPage, /onClear=\{clearDesktopFilters\}/)
})

test('mobile search starts at API page one and can continue with 50-item pages', () => {
  assert.match(searchPage, /const requestPage = isMobile \? 1 : currentPage/)
  assert.match(searchPage, /MOBILE_SEARCH_PAGE_SIZE/)
  assert.match(searchPage, /loadMoreSearchResults/)
  assert.match(searchPage, /mobileLoadedPage < totalPages/)
  assert.match(searchPage, /setProducts\(\(current\) => mergeProducts\(current, data\.products\)\)/)
})
