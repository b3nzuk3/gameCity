import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const home = readFileSync('src/pages/Index.tsx', 'utf8')

test('mobile category heading keeps only the section title', () => {
  assert.match(
    home,
    /data-home-category-badge[\s\S]{0,160}className="[^"]*hidden[^"]*md:inline-flex/
  )
  assert.match(
    home,
    /data-home-category-description[\s\S]{0,160}className="[^"]*hidden[^"]*md:block/
  )
  assert.match(home, />\s*Shop By Category\s*</)
})

test('mobile categories use two square image-first columns', () => {
  assert.match(home, /data-home-category-container/)
  assert.match(home, /px-0 md:px-8/)
  assert.match(home, /data-home-category-grid/)
  assert.match(home, /grid-cols-2[^"]*md:grid-cols-3/)
  assert.match(home, /aspect-square/)
  assert.match(home, /bg-\[#1b1b27\]/)
  assert.match(home, /!object-contain[^"]*md:!object-cover/)
})

test('the full mobile card links to the existing route and shows only its title', () => {
  assert.match(home, /data-mobile-category-link/)
  assert.match(home, /to={category\.path}/)
  assert.match(home, /data-mobile-category-title/)
  assert.match(home, /data-mobile-category-title[\s\S]{0,120}md:hidden/)
})

test('desktop category descriptions and actions remain available', () => {
  assert.match(home, /data-desktop-category-content/)
  assert.match(
    home,
    /data-desktop-category-content[\s\S]{0,180}className="[^"]*hidden[^"]*md:block/
  )
  assert.match(home, /View {category\.title}/)
  assert.match(home, /{category\.description}/)
})
