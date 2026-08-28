import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const resultItem = readFileSync('src/components/DesktopSearchResultItem.tsx', 'utf8')
const resultList = readFileSync('src/components/DesktopSearchResultList.tsx', 'utf8')
const searchPage = readFileSync('src/pages/SearchPage.tsx', 'utf8')
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const sidebar = readFileSync('src/components/ProductFilterSidebar.tsx', 'utf8')
const specificationFilters = readFileSync('src/lib/productSpecificationFilters.ts', 'utf8')

test('desktop search keeps purchase details below the title and specs', () => {
  assert.match(resultList, /DesktopSearchResultItem/)
  assert.match(resultItem, /grid-cols-\[clamp\(170px,18vw,260px\)_minmax\(0,1fr\)\]/)
  assert.doesNotMatch(resultItem, /border-l border-gray-800/)
  assert.match(resultItem, /mt-4 flex w-full max-w-\[210px\] flex-col/)
  assert.match(resultItem, /line-clamp-2/)
  assert.match(resultItem, /Add to cart/)
  assert.doesNotMatch(resultItem, /product\.description/)
})

test('desktop list is separated from the existing mobile result cards at lg', () => {
  assert.match(searchPage, /className="grid grid-cols-1 gap-2 lg:hidden"/)
  assert.match(searchPage, /className="hidden items-start gap-5 [^"]*lg:flex"/)
  assert.match(searchPage, /<ProductCard[^>]*variant="listing"/s)
  assert.match(searchPage, /<DesktopSearchResultList products={desktopProducts}/)
})

test('specification filters use centralized category mappings and useful values only', () => {
  assert.match(specificationFilters, /CATEGORY_SPECIFICATION_FILTERS/)
  assert.match(specificationFilters, /buildAvailableSpecificationFilters/)
  assert.match(specificationFilters, /representedFilterIds = new Set/)
  assert.match(specificationFilters, /if \(options\.length < 2\) return undefined/)
  assert.match(specificationFilters, /matchesSpecificationFilters/)
  assert.match(searchPage, /availableCategories={availableCategories}/)
  assert.match(searchPage, /availableSpecificationFilters={availableSpecificationFilters}/)
  assert.match(categoryPage, /availableSpecificationFilters={availableSpecificationFilters}/)
  const mobileControlsCall = categoryPage.match(/<MobileCatalogControls[\s\S]*?\/>/)?.[0] || ''
  const desktopSidebarCall = categoryPage.match(/<ProductFilterSidebar[\s\S]*?\/>/)?.[0] || ''
  assert.doesNotMatch(mobileControlsCall, /availableSpecificationFilters/)
  assert.match(desktopSidebarCall, /availableSpecificationFilters={availableSpecificationFilters}/)
})

test('desktop filter counts and collapsible long option lists are rendered in the sidebar', () => {
  assert.match(sidebar, /option\.count/)
  assert.match(sidebar, /options\.slice\(0, 6\)/)
  assert.match(sidebar, /expanded \? 'See less' : 'See more'/)
})

test('desktop catalog content uses Amazon-like listing proportions without changing mobile cards', () => {
  const desktopCard = readFileSync('src/components/DesktopProductCard.tsx', 'utf8')
  const desktopGrid = readFileSync('src/components/DesktopProductGrid.tsx', 'utf8')
  assert.match(sidebar, /w-\[280px\]/)
  assert.match(categoryPage, /lg:mx-\[clamp\(1\.25rem,1\.9vw,2\.25rem\)\]/)
  assert.match(desktopGrid, /grid-cols-3 gap-2 xl:grid-cols-5/)
  assert.match(desktopCard, /aspect-\[1\.08\/1\]/)
  assert.match(desktopCard, /bg-\[#232334\] p-3/)
  assert.match(desktopCard, /line-clamp-2 min-h-\[2\.8rem\] text-\[15px\]/)
  assert.match(desktopCard, /text-lg font-bold leading-6 text-\[#FDB813\]/)
  assert.match(desktopCard, /ml-1 text-xs font-normal text-gray-400/)
  assert.match(desktopCard, /mt-auto pt-4/)
  assert.match(desktopCard, />ex VAT</)
})

test('desktop sidebar radios use a black custom background', () => {
  assert.match(sidebar, /appearance-none rounded-full border border-gray-500 bg-black/)
  assert.doesNotMatch(sidebar, /accent-\[#FDB813\]/)
})

test('desktop filter sections share one vertical spacing system', () => {
  assert.match(sidebar, /const FilterSection =/)
  assert.match(sidebar, /border-b border-gray-800 pb-4 pt-\[18px\] last:border-b-0/)
  assert.match(sidebar, /className="mb-1 text-sm font-semibold text-white"/)
  assert.match(sidebar, /<FilterSection label="Availability">/)
  assert.match(sidebar, /<FilterSection label="Condition">/)
  assert.match(sidebar, /<FilterSection label={label}>/)
  assert.match(sidebar, /<FilterSection label="Price">/)
  assert.doesNotMatch(sidebar, /<legend/)
  assert.doesNotMatch(sidebar, /relative top-1/)
})

test('desktop price filter follows condition and uses the themed range control', () => {
  assert.match(sidebar, /<FilterSection label="Condition">[\s\S]*?<FilterSection label="Price">[\s\S]*?availableCategories/)
  assert.match(sidebar, /<Slider[\s\S]*?thumbLabels={\['Desktop minimum price', 'Desktop maximum price'\]}/)
  assert.match(sidebar, /\[&>span:first-child>span\]:bg-\[#FDB813\]/)
  assert.match(categoryPage, /availablePriceRange={availablePriceRange}/)
  assert.match(searchPage, /availablePriceRange={availablePriceRange}/)
})
