import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const home = readFileSync('src/pages/Index.tsx', 'utf8')
const featuredProducts = readFileSync(
  'src/components/FeaturedProducts.tsx',
  'utf8'
)

test('homepage does not render the removed Why Choose GameCity section', () => {
  assert.match(home, /data-home-sections[^>]*className="[^"]*flex flex-col/)
  assert.doesNotMatch(home, /data-home-features-section/)
  assert.doesNotMatch(home, />\s*Why Choose Gamecity\?\s*</)
})

test('mobile orders featured products directly before shop by category', () => {
  assert.match(
    home,
    /data-home-featured-section[^>]*className="[^"]*order-1[^\"]*md:order-2/
  )
  assert.match(
    home,
    /id="shop-by-category"[^>]*className="[^"]*order-2[^\"]*md:order-4/
  )
  assert.match(
    home,
    /data-home-reviews-section[^>]*className="[^"]*order-3[^\"]*md:order-3/
  )
})

test('featured product cards stay fully clickable and become compact on mobile', () => {
  assert.match(featuredProducts, /data-featured-product-card/)
  assert.match(featuredProducts, /data-featured-product-card[\s\S]{0,500}onClick=/)
  assert.match(featuredProducts, /min-h-0[^\"]*md:min-h-\[400px\]/)
  assert.match(featuredProducts, /space-y-1[^\"]*md:space-y-2/)
  assert.match(
    featuredProducts,
    /data-featured-product-spacer[^>]*className="[^"]*hidden[^\"]*md:flex-grow/
  )
})

test('fallback homepage product cards omit View on every screen while retaining Add to Cart and card navigation', () => {
  assert.doesNotMatch(featuredProducts, /data-featured-product-view|>\s*View\s*</)
  assert.match(featuredProducts, /onClick=\{\(e\) => handleAddToCart\(e, product\)\}/)
  assert.match(featuredProducts, /data-featured-product-card[\s\S]{0,500}onClick=/)
  assert.match(featuredProducts, /View All Products/)
})
