import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const productCard = readFileSync('src/components/ProductCard.tsx', 'utf8')
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const searchPage = readFileSync('src/pages/SearchPage.tsx', 'utf8')
const skeleton = readFileSync('src/components/ui/product-skeleton.tsx', 'utf8')

test('listing cards use a compact mobile image-and-details layout', () => {
  assert.match(productCard, /variant\?: 'default' \| 'listing'/)
  assert.match(productCard, /grid-cols-\[minmax\(112px,38%\)_minmax\(0,1fr\)\]/)
  assert.match(productCard, /object-contain/)
  assert.match(productCard, /line-clamp-3/)
})

test('mobile listing cards hide View and use a charcoal image panel', () => {
  assert.match(productCard, /hidden md:inline-flex/)
  assert.match(productCard, /bg-\[#1b1b27\] md:bg-gray-100/)
  assert.doesNotMatch(productCard, /isListing \? '.*bg-white/)
})

test('category and search results opt into one-column mobile listing cards', () => {
  assert.match(categoryPage, /grid-cols-1 md:grid-cols-3 lg:grid-cols-4/)
  assert.match(categoryPage, /variant="listing"/)
  assert.match(searchPage, /grid-cols-1 md:grid-cols-3 lg:grid-cols-4/)
  assert.match(searchPage, /variant="listing"/)
})

test('listing skeletons reserve the same horizontal mobile geometry', () => {
  assert.match(skeleton, /variant\?: 'default' \| 'listing'/)
  assert.match(skeleton, /grid-cols-\[minmax\(112px,38%\)_minmax\(0,1fr\)\]/)
  assert.match(skeleton, /bg-\[#1b1b27\] md:bg-muted/)
  assert.match(categoryPage, /<ProductSkeleton[^>]*variant="listing"/s)
  assert.match(searchPage, /<ProductSkeleton[^>]*variant="listing"/s)
})
