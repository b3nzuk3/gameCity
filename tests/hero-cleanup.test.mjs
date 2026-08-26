import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const hero = readFileSync('src/components/Hero.tsx', 'utf8')

test('hero starts with its main heading and has no welcome badge', () => {
  assert.doesNotMatch(hero, /Welcome to Gamecity/i)
  assert.doesNotMatch(hero, /inline-block mb-6 px-3 py-1 rounded-full/)
  assert.match(hero, /<h1 className="text-4xl md:text-6xl lg:text-7xl/)
})

test('hero copy and calls to action remain intact', () => {
  assert.match(hero, /Build Your Ultimate/)
  assert.match(hero, /Dream Machine/)
  assert.match(hero, /Discover premium computer components/)
  assert.match(hero, />\s*Shop Now/)
  assert.match(hero, />Build Your PC</)
})
