import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const productService = readFileSync('src/services/productService.ts', 'utf8')

test('desktop category state is parsed from URL and writes page-one URLs while preserving unknown params', () => {
  assert.match(categoryPage, /parseDesktopCategoryFilters/)
  assert.match(categoryPage, /updateDesktopUrl/)
  assert.match(categoryPage, /params\.delete\('page'\)/)
  assert.match(categoryPage, /navigate\(/)
  assert.match(categoryPage, /spec\./)
})

test('desktop category requests send the server filter contract and mobile keeps the legacy query', () => {
  assert.match(productService, /params\.set\('sort', desktopOptions\.sort \|\| 'name'\)/)
  assert.match(productService, /params\.append\(`spec\.\$\{id\}`/)
  assert.match(productService, /desktopOptions\.brands[\s\S]*?params\.append\('brands'/)
  assert.match(categoryPage, /<SelectItem value="-price">/)
  assert.match(productService, /useCategoryProducts[\s\S]*desktopOptions/)
  assert.match(categoryPage, /fetchProductsByCategory\(categoryParam, page, MOBILE_CATEGORY_PAGE_SIZE\)/)
})

test('mobile intersection observer reattaches after the loading sentinel becomes visible', () => {
  assert.match(categoryPage, /<div ref=\{loadSentinelRef\}/)
  assert.match(categoryPage, /\[isMobile, isLoadingMore, loadMoreError, loadNextPage, mobileBatches\]/)
})

test('desktop results are server-filtered while mobile retains local infinite-scroll filtering', () => {
  assert.match(categoryPage, /isMobile !== true/)
  assert.match(categoryPage, /if \(isMobile !== true\) return batchProducts/)
  assert.match(categoryPage, /mobileBatches/)
  assert.match(categoryPage, /MOBILE_CATEGORY_PAGE_SIZE/)
})
