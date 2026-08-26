import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  MOBILE_HEADER_DIRECTION_THRESHOLD,
  MOBILE_HEADER_TOP_THRESHOLD,
  isMobileHeaderAtTop,
  nextMobileHeaderScrollState,
} from '../src/lib/mobileHeader.js'

const navbar = readFileSync('src/components/Navbar.tsx', 'utf8')
const layout = readFileSync('src/components/Layout.tsx', 'utf8')
const categoryPage = readFileSync('src/pages/CategoryPage.tsx', 'utf8')

test('mobile header uses top, hidden, and compact direction states', () => {
  assert.equal(MOBILE_HEADER_TOP_THRESHOLD, 12)
  assert.equal(MOBILE_HEADER_DIRECTION_THRESHOLD, 8)
  assert.equal(isMobileHeaderAtTop(0), true)
  assert.equal(isMobileHeaderAtTop(12), true)
  assert.equal(isMobileHeaderAtTop(13), false)

  const tinyDown = nextMobileHeaderScrollState({
    scrollY: 17,
    anchorScrollY: 12,
    currentState: 'top',
  })
  assert.deepEqual(tinyDown, { state: 'top', anchorScrollY: 12 })

  const down = nextMobileHeaderScrollState({
    scrollY: 21,
    anchorScrollY: 12,
    currentState: 'top',
  })
  assert.deepEqual(down, { state: 'hidden', anchorScrollY: 21 })

  const tinyUp = nextMobileHeaderScrollState({
    scrollY: 16,
    anchorScrollY: 21,
    currentState: 'hidden',
  })
  assert.deepEqual(tinyUp, { state: 'hidden', anchorScrollY: 21 })

  const up = nextMobileHeaderScrollState({
    scrollY: 13,
    anchorScrollY: 21,
    currentState: 'hidden',
  })
  assert.deepEqual(up, { state: 'compact', anchorScrollY: 13 })

  const top = nextMobileHeaderScrollState({
    scrollY: 12,
    anchorScrollY: 13,
    currentState: 'compact',
  })
  assert.deepEqual(top, { state: 'top', anchorScrollY: 12 })
})

test('mobile header has distinct main and persistent search rows', () => {
  assert.match(navbar, /data-mobile-header-row="main"/)
  assert.match(navbar, /data-mobile-header-row="search"/)
  assert.match(navbar, /id="mobile-catalog-nav-slot"/)
  assert.match(navbar, /mobile-search-suggestions/)
  assert.match(navbar, /aria-label="Search products"/)
  assert.match(navbar, /-translate-y-\[var\(--mobile-main-height\)\]/)
  assert.match(navbar, /-translate-y-\[calc\(100%\+1px\)\]/)
  assert.match(navbar, /md:translate-y-0/)
  assert.match(navbar, /gameCityCatalogSnapshotKey/)
  assert.match(navbar, /gameCityMobileHeaderState/)
  assert.match(categoryPage, /gameCityCatalogScrollY: window\.scrollY/)
})

test('mobile transition is reduced-motion safe and layout reserves both rows', () => {
  assert.match(navbar, /motion-reduce:transition-none/)
  assert.match(layout, /pt-28 md:pt-16/)
})

test('desktop search remains present and mobile no longer uses a search launcher', () => {
  assert.match(navbar, /Search Bar - Desktop/)
  assert.doesNotMatch(navbar, /aria-label="Open search"/)
})
