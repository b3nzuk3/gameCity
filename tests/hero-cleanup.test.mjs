import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const hero = readFileSync('src/components/Hero.tsx', 'utf8')

test('hero uses an editorial split layout without the old video or welcome badge', () => {
  assert.doesNotMatch(hero, /Welcome to Gamecity/i)
  assert.doesNotMatch(hero, /<video/i)
  assert.doesNotMatch(hero, /inline-block mb-6 px-3 py-1 rounded-full/)
  assert.match(hero, /<h1 className="text-4xl md:text-6xl lg:text-7xl/)
  assert.match(hero, /lg:grid-cols-\[minmax\(0,0\.9fr\)_minmax\(0,1\.1fr\)\]/)
  assert.match(hero, /object-cover/)
})

test('hero keeps valid default copy and responsive calls to action', () => {
  assert.match(hero, /title: 'Build Your Ultimate Dream Machine'/)
  assert.match(hero, /description: 'Discover premium computer components/)
  assert.match(hero, /primaryCtaLabel: 'Shop Now'/)
  assert.match(hero, /secondaryCtaLabel: 'Build Your PC'/)
  assert.match(hero, /href\.startsWith\('\/'\)/)
  assert.match(hero, /sm:flex-row/)
})
