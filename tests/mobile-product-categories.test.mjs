import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const categoryData = readFileSync('src/lib/productCategories.ts', 'utf8')
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const productPage = readFileSync('src/pages/ProductPage.tsx', 'utf8')
const navbar = readFileSync('src/components/Navbar.tsx', 'utf8')
const mobileNavigation = readFileSync(
  'src/components/MobileMenuCategories.tsx',
  'utf8'
)

test('catalogue and hamburger navigation reuse one category source', () => {
  assert.match(categoryData, /export const PRODUCT_CATEGORIES/)
  assert.match(categoryPage, /PRODUCT_CATEGORIES as CATEGORIES/)
  assert.match(mobileNavigation, /PRODUCT_CATEGORIES/)
  assert.match(navbar, /<MobileMenuCategories/)
})

test('product content no longer contains the misplaced category navigation', () => {
  assert.doesNotMatch(productPage, /MobileProductCategories/)
  assert.doesNotMatch(productPage, /data-mobile-product-categories/)
})

test('hamburger category navigation shows a compact preview including All Products', () => {
  assert.match(mobileNavigation, /const MOBILE_CATEGORY_PREVIEW_COUNT = 5/)
  assert.match(mobileNavigation, /previewCategories/)
  assert.match(
    mobileNavigation,
    /PRODUCT_CATEGORIES\.slice\(\s*0,\s*MOBILE_CATEGORY_PREVIEW_COUNT\s*\)/
  )
  assert.match(mobileNavigation, /data-mobile-menu-categories/)
  assert.match(categoryData, /{ id: 'all', name: 'All Products' }/)
})

test('category links retain existing SEO-safe routes and identify the current category', () => {
  assert.match(mobileNavigation, /const categoryPath = `\/category\/\${category\.id}`/)
  assert.match(mobileNavigation, /to={categoryPath}/)
  assert.match(mobileNavigation, /aria-current={isActive \? 'page' : undefined}/)
  assert.match(mobileNavigation, /min-h-11/)
})

test('remaining categories expand smoothly with an accessible reversible control', () => {
  assert.match(mobileNavigation, /data-mobile-menu-category-overflow/)
  assert.match(mobileNavigation, /grid-rows-\[0fr\]/)
  assert.match(mobileNavigation, /grid-rows-\[1fr\]/)
  assert.match(mobileNavigation, /aria-expanded={isExpanded}/)
  assert.match(mobileNavigation, /aria-controls="mobile-menu-category-overflow"/)
  assert.match(
    mobileNavigation,
    /isExpanded \? 'Show less' : 'See all categories'/
  )
})

test('every category link closes the hamburger menu before navigation', () => {
  assert.match(mobileNavigation, /onNavigate: \(\) => void/)
  assert.match(mobileNavigation, /onClick={onNavigate}/)
  assert.match(navbar, /onNavigate={\(\) => setIsMobileMenuOpen\(false\)}/)
})
