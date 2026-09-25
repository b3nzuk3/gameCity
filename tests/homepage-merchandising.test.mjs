import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const hero = readFileSync('src/components/Hero.tsx', 'utf8')
const home = readFileSync('src/pages/Index.tsx', 'utf8')
const section = readFileSync('src/components/HomepageProductSection.tsx', 'utf8')
const productCard = readFileSync('src/components/ProductCard.tsx', 'utf8')
const styles = readFileSync('src/index.css', 'utf8')
const service = readFileSync('src/services/backendService.ts', 'utf8')

test('storefront homepage uses the editorial image hero and public homepage API', () => {
  assert.doesNotMatch(hero, /<video/i)
  assert.match(hero, /lg:grid-cols-/)
  assert.match(hero, /loading="eager"/)
  assert.match(hero, /object-cover/)
  assert.match(home, /backendService\.homepage\.get/)
  assert.match(home, /hasConfiguredSections \? <HomepageSections/)
  assert.match(home, /FeaturedProducts/)
})

test('configured homepage grid and carousel omit View without changing other product cards', () => {
  assert.equal((section.match(/<ProductCard\b/g) ?? []).length, 2)
  assert.equal((section.match(/<ProductCard\b[^>]*hideViewButton/g) ?? []).length, 2)
  assert.match(productCard, /hideViewButton\?: boolean/)
  assert.match(productCard, /!hideViewButton && \(/)
  assert.match(productCard, /<WhatsAppProductButton/)
  assert.match(productCard, /onClick=\{handleAddToCart\}/)
})

test('curated homepage sections reuse the existing product card and ordered references', () => {
  assert.match(service, /GET', '\/public\/homepage'/)
  assert.match(section, /ProductCard/)
  assert.match(section, /sortOrder/)
  assert.match(section, /section\.products\.length === 0/)
  assert.match(section, /section\.layout === 'carousel'/)
  assert.match(section, /homepage-product-carousel/)
  assert.match(styles, /\.homepage-product-carousel[\s\S]*scroll-snap-type: x mandatory/)
})
