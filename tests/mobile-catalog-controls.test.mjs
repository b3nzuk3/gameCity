import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import { countActiveCatalogFilters } from '../src/lib/catalogFilters.js'

const navbar = readFileSync('src/components/Navbar.tsx', 'utf8')
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')
const controls = readFileSync('src/components/MobileCatalogControls.tsx', 'utf8')

test('counts applied filter choices without treating sorting as a filter', () => {
  assert.equal(countActiveCatalogFilters({
    sortBy: 'price-low',
    filterBy: 'in-stock',
    conditionFilter: 'New',
    priceRange: [10_000, null],
    priceFilterActive: true,
    selectedBrands: ['ASUS', 'MSI'],
  }), 5)

  assert.equal(countActiveCatalogFilters({
    sortBy: 'rating',
    filterBy: 'all',
    conditionFilter: 'all',
    priceRange: [null, null],
    priceFilterActive: false,
    selectedBrands: [],
  }), 0)
})

test('mounts the mobile controls into the navbar stack', () => {
  assert.match(navbar, /id="mobile-catalog-nav-slot"/)
  assert.match(categoryPage, /createPortal/)
  assert.match(categoryPage, /mobile-catalog-nav-slot/)
  assert.match(controls, /data-mobile-catalog-bar/)
})

test('uses SEO category links in one native horizontal scroller', () => {
  assert.match(controls, /overflow-x-auto/)
  assert.match(controls, /whitespace-nowrap/)
  assert.match(controls, /to={`\/category\/\${cat\.id}`}/)
  assert.match(controls, /aria-current=/)
  assert.match(controls, /scrollIntoView/)
})

test('provides a touch filter sheet with batching and clearing actions', () => {
  assert.match(controls, /<Sheet/)
  assert.match(controls, /<SheetTitle>Filters<\/SheetTitle>/)
  assert.match(controls, />Availability</)
  assert.match(controls, />Condition</)
  assert.match(controls, />Sort by</)
  assert.match(controls, />Brand</)
  assert.match(controls, />Price</)
  assert.match(controls, />\s*Clear all\s*</)
  assert.match(controls, />\s*Show results\s*</)
})

test('uses selectable chips for availability and condition', () => {
  assert.match(controls, /data-availability-options/)
  assert.match(controls, /AVAILABILITY_OPTIONS\.map/)
  assert.match(controls, /aria-pressed={draftFilters\.filterBy === option\.value}/)
  assert.match(controls, /data-condition-options/)
  assert.match(controls, /CONDITION_OPTIONS\.map/)
  assert.match(controls, /aria-pressed={draftFilters\.conditionFilter === option\.value}/)
})

test('keeps selected brands in a six-brand collapsible preview', () => {
  assert.match(controls, /const BRAND_PREVIEW_COUNT = 6/)
  assert.match(controls, /collapsedBrandOptions/)
  assert.match(controls, /draftFilters\.selectedBrands\.includes\(brand\)/)
  assert.match(controls, /data-brand-overflow/)
  assert.match(controls, /brandListExpanded \? 'Show less' : 'See more'/)
})

test('synchronizes bounded price fields with a two-thumb range slider', () => {
  assert.match(controls, /availablePriceRange: \[number, number\]/)
  assert.match(controls, /<Slider/)
  assert.match(controls, /value={sliderPriceRange}/)
  assert.match(controls, /onValueChange={updatePriceFromSlider}/)
  assert.match(controls, /aria-label="Minimum price"/)
  assert.match(controls, /aria-label="Maximum price"/)
  assert.match(categoryPage, /availablePriceRange={availablePriceRange}/)
})

test('switches cleanly from mobile controls to desktop controls at lg', () => {
  assert.match(
    categoryPage,
    /data-desktop-category-navigation[\s\S]{0,160}className="[^"]*hidden[^"]*lg:block/
  )
  assert.match(categoryPage, /<ProductFilterSidebar/)
  assert.match(categoryPage, /className="lg:hidden"/)
  assert.doesNotMatch(categoryPage, /data-tablet-filter-toggle/)
})
