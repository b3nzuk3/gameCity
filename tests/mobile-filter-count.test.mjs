import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const require = createRequire(import.meta.url)
const { buildProductFilterQuery } = require(
  '../../gameCity-backend/utils/productFilters.js'
)
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const productService = readFileSync('src/services/productService.ts', 'utf8')
const mobileControls = readFileSync(
  'src/components/MobileCatalogControls.tsx',
  'utf8'
)

test('backend count query applies every existing catalogue filter', () => {
  assert.deepEqual(
    buildProductFilterQuery({
      filterBy: 'in-stock',
      condition: 'New',
      brands: ['ASUS', 'MSI'],
      minPrice: '10000',
      maxPrice: '50000',
    }),
    {
      countInStock: { $gt: 0 },
      condition: 'New',
      brand: { $in: ['ASUS', 'MSI'] },
      price: { $gte: 10000, $lte: 50000 },
    }
  )
  assert.deepEqual(buildProductFilterQuery({ filterBy: 'out-of-stock' }), {
    countInStock: 0,
  })
})

test('filtered count request is keyed by filters and aborts stale requests', () => {
  assert.match(productService, /useCategoryProductCount/)
  assert.match(productService, /category-product-count/)
  assert.match(productService, /signal/)
  assert.match(productService, /fetchCategoryProductCount/)
})

test('mobile listing and drawer consume the authoritative filtered total', () => {
  assert.match(categoryPage, /useCategoryProductCount/)
  assert.match(categoryPage, /mobileResultCount/)
  assert.match(categoryPage, /resultCount={mobileResultCount}/)
  assert.match(categoryPage, /resultCountLoading=/)
  assert.match(mobileControls, /resultCount: number \| null/)
  assert.match(mobileControls, /products found/)
  assert.doesNotMatch(categoryPage, /filteredProducts\.length} products found/)
})
