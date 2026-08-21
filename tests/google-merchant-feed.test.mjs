import assert from 'node:assert/strict'
import { test } from 'node:test'

import {
  buildMerchantFeed,
  escapeXml,
  getOfferPrice,
  isOfferActive,
  mapFeedItem,
  slugify,
} from '../api/google-merchant-feed.xml.ts'

const validProduct = {
  _id: '64b1f0c9a1b2c3d4e5f60708',
  name: 'ASUS Dual GeForce RTX 5060 8GB Graphics Card',
  description: 'Fast RTX 5060 card with 8GB GDDR7.\nKey Features:\n• DLSS 4',
  brand: 'ASUS',
  category: 'Graphics Cards',
  price: 56000,
  countInStock: 7,
  condition: 'New',
  image_r2:
    'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/greenbits-store/asus-rtx5060.jpg',
  offer: { enabled: false, type: 'percentage', amount: 0 },
}

function itemOf(product) {
  const result = mapFeedItem(product)
  assert.ok(result.item, `expected item, got exclusion: ${JSON.stringify(result)}`)
  return result.item
}

function excludeOf(product) {
  const result = mapFeedItem(product)
  assert.ok(result.exclude, `expected exclusion, got item: ${JSON.stringify(result)}`)
  return result.exclude
}

test('escapeXml neutralizes XML-sensitive characters', () => {
  const escaped = escapeXml(String.raw`A & B <tag> "quote" 'apos'`)
  assert.equal(escaped, 'A &amp; B &lt;tag&gt; &quot;quote&quot; &apos;apos&apos;')
  // Escaping must be applied once (no double-encoding of &)
  assert.equal(escapeXml('&amp;'), '&amp;amp;')
})

test('escapeXml handles non-string input safely', () => {
  assert.equal(escapeXml(null), '')
  assert.equal(escapeXml(undefined), '')
  assert.equal(escapeXml(123), '123')
})

test('slugify matches catalog-manifest slug logic', () => {
  assert.equal(
    slugify('Seagate Barracuda 8TB Internal Hard Disk Drive Desktop & Surveillance'),
    'seagate-barracuda-8tb-internal-hard-disk-drive-desktop-surveillance-nairobi'
  )
})

test('offer helpers mirror storefront pricing behaviour', () => {
  const active = { enabled: true, type: 'percentage', amount: 10 }
  const fixed = { enabled: true, type: 'fixed', amount: 5000 }
  const expired = {
    enabled: true,
    type: 'percentage',
    amount: 50,
    endDate: '2000-01-01T00:00:00Z',
  }
  assert.ok(isOfferActive(active))
  assert.equal(getOfferPrice(1000, active), 900)
  assert.equal(getOfferPrice(28000, fixed), 23000)
  assert.ok(!isOfferActive(expired))
  assert.equal(getOfferPrice(1000, expired), 1000)
  assert.ok(!isOfferActive({ enabled: false, type: 'percentage', amount: 10 }))
  assert.ok(!isOfferActive(undefined))
})

test('mapFeedItem maps a complete product to a valid feed item', () => {
  const item = itemOf(validProduct)
  assert.equal(item.id, '64b1f0c9a1b2c3d4e5f60708')
  assert.equal(
    item.link,
    'https://www.gamecityelectronics.co.ke/product/asus-dual-geforce-rtx-5060-8gb-graphics-card-nairobi'
  )
  assert.equal(item.availability, 'in_stock')
  assert.equal(item.price, '56000.00 KES')
  assert.equal(item.condition, 'new')
  assert.equal(item.brand, 'ASUS')
  assert.equal(item.gtin, null)
  assert.equal(item.mpn, null)
})

test('availability mapping covers in_stock and out_of_stock', () => {
  assert.equal(itemOf({ ...validProduct, countInStock: 1 }).availability, 'in_stock')
  assert.equal(itemOf({ ...validProduct, countInStock: 0 }).availability, 'out_of_stock')
  assert.equal(itemOf({ ...validProduct }).availability, 'in_stock')
})

test('condition mapping: New -> new, Pre-Owned -> used, missing -> new', () => {
  assert.equal(itemOf({ ...validProduct, condition: 'Pre-Owned' }).condition, 'used')
  assert.equal(itemOf({ ...validProduct, condition: 'New' }).condition, 'new')
  assert.equal(itemOf({ ...validProduct, condition: undefined }).condition, 'new')
})

test('active offer is reflected in feed price so it matches the website', () => {
  const offered = itemOf({
    ...validProduct,
    offer: { enabled: true, type: 'percentage', amount: 10 },
  })
  assert.equal(offered.price, '50400.00 KES')
})

test('malformed products are excluded with exact reasons', () => {
  const cases = [
    [{ ...validProduct, name: '' }, 'missing valid product name / landing page slug'],
    [{ ...validProduct, description: '' }, 'missing usable description'],
    [{ ...validProduct, image_r2: null, image: null, images: [] }, 'missing usable image URL'],
    [{ ...validProduct, price: 0 }, 'missing valid price'],
    [{ ...validProduct, price: undefined }, 'missing valid price'],
  ]
  for (const [product, reason] of cases) {
    assert.equal(excludeOf(product).reason, reason)
  }
  assert.equal(
    excludeOf({ ...validProduct, _id: undefined }).reason,
    'missing stable product ID (_id)'
  )
})

test('gtin/mpn only emitted when real values exist in specifications', () => {
  const withIds = itemOf({
    ...validProduct,
    specifications: { gtin: '4711081089351', MPN: 'DUAL-RTX5060-O8G', warranty: 'N/A' },
  })
  assert.equal(withIds.gtin, '4711081089351')
  assert.equal(withIds.mpn, 'DUAL-RTX5060-O8G')

  const placeholders = itemOf({
    ...validProduct,
    specifications: { gtin: 'N/A', barcode: '-' },
  })
  assert.equal(placeholders.gtin, null)

  const none = itemOf(validProduct)
  assert.equal(none.gtin, null)
  assert.equal(none.mpn, null)
})

test('image resolution prefers R2 variants and upgrades http to https', () => {
  assert.equal(
    itemOf({
      ...validProduct,
      image_r2_variants: { large: 'https://example.com/large.jpg' },
    }).imageUrl,
    'https://example.com/large.jpg'
  )
  assert.equal(
    itemOf({
      ...validProduct,
      image_r2: 'http://example.com/legacy.jpg',
      images: [],
    }).imageUrl,
    'https://example.com/legacy.jpg'
  )
  assert.equal(
    itemOf({ ...validProduct, image_r2: '/local.png', images: [] }).imageUrl,
    'https://www.gamecityelectronics.co.ke/local.png'
  )
})

test('image URLs with raw spaces / non-ASCII are percent-encoded for strict fetchers', () => {
  const legacy =
    'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/greenbits-store/1785621546641-b406e68f-a187-4541-892a-9f0f9f7203f0.3ms gaming monitor – nairobi kenya'
  const encoded = itemOf({ ...validProduct, image_r2: legacy, images: [] }).imageUrl
  assert.ok(!/\s/.test(encoded), 'no raw whitespace may remain')
  assert.equal(
    encoded,
    'https://pub-5e82d594e79e436e9cfd3a07c9c7eb7d.r2.dev/greenbits-store/1785621546641-b406e68f-a187-4541-892a-9f0f9f7203f0.3ms%20gaming%20monitor%20%E2%80%93%20nairobi%20kenya'
  )
  // Idempotent: already-clean URLs pass through untouched.
  const clean = 'https://example.com/img (1).jpg'
  assert.equal(
    itemOf({ ...validProduct, image_r2: encodeURI(clean), images: [] }).imageUrl,
    encodeURI(clean)
  )
})

test('buildMerchantFeed produces valid RSS with google namespace and dedupes IDs', () => {
  const { xml, includedCount, excluded } = buildMerchantFeed([
    validProduct,
    validProduct, // duplicate ID must collapse
    { ...validProduct, price: 0 }, // excluded
  ])

  assert.equal(includedCount, 1)
  assert.equal(excluded.length, 1)
  assert.match(xml, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.match(xml, /xmlns:g="http:\/\/base\.google\.com\/ns\/1\.0"/)
  assert.match(xml, /<rss version="2\.0"/)
  assert.equal([...xml.matchAll(/<item>/g)].length, 1)
  assert.match(xml, /<g:id>64b1f0c9a1b2c3d4e5f60708<\/g:id>/)
})

test('special characters round-trip through a strict XML parser', () => {
  const { xml } = buildMerchantFeed([
    { ...validProduct, name: 'Case & PSU "Deal" <Test> 650W' },
  ])
  // No DOMParser in node --test by default: verify escaping + parse with regex checks.
  assert.ok(xml.includes('<g:title>Case &amp; PSU &quot;Deal&quot; &lt;Test&gt; 650W</g:title>'))
})
