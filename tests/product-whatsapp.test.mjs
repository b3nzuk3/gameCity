import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

import {
  buildProductInquiryMessage,
  buildWhatsAppUrl,
  normalizeWhatsAppPhone,
} from '../src/lib/whatsapp.js'

const productCard = readFileSync('src/components/ProductCard.tsx', 'utf8')
const desktopProductCard = readFileSync('src/components/DesktopProductCard.tsx', 'utf8')
const desktopSearchItem = readFileSync('src/components/DesktopSearchResultItem.tsx', 'utf8')
const whatsappButton = readFileSync('src/components/WhatsAppProductButton.tsx', 'utf8')

test('normalizes the configured local Kenyan business number for wa.me', () => {
  assert.equal(normalizeWhatsAppPhone('0712 248 706'), '254712248706')
  assert.equal(normalizeWhatsAppPhone('+254 712 248 706'), '254712248706')
})

test('builds a product-specific inquiry message with the public URL', () => {
  const productUrl = 'https://www.gamecityelectronics.co.ke/product/rtx-5080-nairobi'
  const message = buildProductInquiryMessage('RTX 5080', productUrl)

  assert.equal(
    message,
    `Hi GameCity Electronics, I'm interested in RTX 5080.\n${productUrl}`
  )
  assert.equal(
    buildWhatsAppUrl('0712248706', message),
    `https://wa.me/254712248706?text=${encodeURIComponent(message)}`
  )
})

test('omits the message query when opening a general WhatsApp chat', () => {
  assert.equal(buildWhatsAppUrl('254712248706'), 'https://wa.me/254712248706')
})

test('all product-card variants use the shared product inquiry button', () => {
  for (const source of [productCard, desktopProductCard, desktopSearchItem]) {
    assert.match(source, /<WhatsAppProductButton/)
  }
  assert.match(whatsappButton, /storeInfo\.phone/)
  assert.match(whatsappButton, /canonicalUrl\(productPath\)/)
  assert.match(whatsappButton, /aria-label=\{`Ask about \$\{productName\} on WhatsApp`\}/)
})

test('WhatsApp click is isolated from product navigation and cart actions', () => {
  assert.match(whatsappButton, /event\.preventDefault\(\)/)
  assert.match(whatsappButton, /event\.stopPropagation\(\)/)
  assert.match(whatsappButton, /window\.open\(buildWhatsAppUrl\(storeInfo\.phone, message\)/)
  assert.doesNotMatch(whatsappButton, /addToCart|useCart/)
})
