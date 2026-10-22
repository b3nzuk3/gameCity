import assert from 'node:assert/strict'
import { createRequire, Module } from 'node:module'
import path from 'node:path'
import test from 'node:test'
import { build } from 'esbuild'

const require = createRequire(import.meta.url)
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { StaticRouter } = require('react-router-dom/server')
const { outputFiles } = await build({
  entryPoints: ['src/components/Hero.tsx'],
  bundle: true,
  write: false,
  platform: 'node',
  format: 'cjs',
  packages: 'external',
  alias: { '@': path.resolve('src') },
})
const component = new Module(path.resolve('hero-render.cjs'))
component.filename = path.resolve('hero-render.cjs')
component.paths = require.resolve.paths('react')
component._compile(outputFiles[0].text, component.filename)
const Hero = component.exports.default
const config = {
  eyebrow: 'GameCity', title: 'Build Your Ultimate Setup', highlightText: 'Made to Perform',
  description: 'Choose your hardware.', primaryCtaLabel: 'Shop', primaryCtaHref: '/category/all',
  secondaryCtaLabel: '', secondaryCtaHref: '', imageUrl: '/hero.webp', imageAlt: 'Gaming PC', enabled: true,
}
const render = (patch = {}) => renderToStaticMarkup(createElement(StaticRouter, { location: '/' }, createElement(Hero, { config: { ...config, ...patch } })))
const heading = (patch) => render(patch).match(/<h1[^>]*>(.*?)<\/h1>/s)[1]

test('a separate saved highlighted phrase appears after the title', () => {
  assert.equal(heading(), 'Build Your Ultimate Setup <span class="block text-yellow-400">Made to Perform</span>')
})

test('a phrase already in the title is highlighted once without changing title casing', () => {
  assert.equal(heading({ title: 'Build Your Dream Machine', highlightText: ' dream machine ' }), 'Build Your <span class="block text-yellow-400">Dream Machine</span>')
  assert.equal(heading({ title: 'Play and Play', highlightText: 'Play' }), 'Play and <span class="block text-yellow-400">Play</span>')
})

test('empty optional phrases leave the title unchanged', () => {
  for (const highlightText of ['', '   ']) assert.equal(heading({ highlightText }), 'Build Your Ultimate Setup')
})

test('separate phrases are trimmed and rendered as text rather than HTML', () => {
  assert.equal(heading({ highlightText: '  <em>Fast & Ready</em>  ' }), 'Build Your Ultimate Setup <span class="block text-yellow-400">&lt;em&gt;Fast &amp; Ready&lt;/em&gt;</span>')
})

test('disabled hero stays hidden', () => {
  assert.equal(render({ enabled: false }), '')
})
