import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const productPage = readFileSync('src/pages/ProductPage.tsx', 'utf8')

test('mobile product descriptions default to a measured collapsed preview', () => {
  assert.match(
    productPage,
    /const \[isDescriptionExpanded, setIsDescriptionExpanded\] = useState\(false\)/
  )
  assert.match(productPage, /data-product-description-content/)
  assert.match(productPage, /max-h-28/)
  assert.match(productPage, /md:max-h-none/)
  assert.match(productPage, /ResizeObserver/)
})

test('the mobile description disclosure is accessible and reversible', () => {
  assert.match(productPage, /data-product-description-toggle/)
  assert.match(productPage, /type="button"/)
  assert.match(productPage, /aria-expanded={isDescriptionExpanded}/)
  assert.match(productPage, /aria-controls="product-description-content"/)
  assert.match(productPage, /isDescriptionExpanded \? 'Show less' : 'See more'/)
  assert.match(
    productPage,
    /data-product-description-toggle[\s\S]{0,1000}className="[^"]*md:hidden/
  )
})

test('description content remains complete and continues to be sanitized', () => {
  assert.match(
    productPage,
    /dangerouslySetInnerHTML={{ __html: sanitizeHtml\(product\.description\) }}/
  )
  assert.match(productPage, /description: product\.description/)
})
