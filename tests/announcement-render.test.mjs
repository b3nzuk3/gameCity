import assert from 'node:assert/strict'
import { Buffer } from 'node:buffer'
import { readFileSync } from 'node:fs'
import { createRequire } from 'node:module'
import { pathToFileURL } from 'node:url'
import test from 'node:test'
import ts from 'typescript'

const require = createRequire(import.meta.url)
const { createElement } = require('react')
const { renderToStaticMarkup } = require('react-dom/server')
const { StaticRouter } = require('react-router-dom/server')
const service = readFileSync('src/services/backendService.ts', 'utf8')
const normalizationSource = service.slice(service.indexOf('export type HomepageAnnouncement'), service.indexOf('export type HomepageSectionProduct'))
function compile(source) {
  return ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText
}
const normalization = await import(`data:text/javascript;base64,${Buffer.from(compile(normalizationSource)).toString('base64')}`)
const componentSource = compile(readFileSync('src/components/AnnouncementBar.tsx', 'utf8')).replace(/from ["']([^"']+)["']/g, (_, module) => `from ${JSON.stringify(pathToFileURL(require.resolve(module)).href)}`)
const { default: AnnouncementBar } = await import(`data:text/javascript;base64,${Buffer.from(componentSource).toString('base64')}`)
const config = { enabled: true, text: 'Desktop sale', mobileText: 'Mobile sale', linkLabel: 'Browse', linkHref: '/category/all' }
const render = (patch = {}, isVisible = true) => renderToStaticMarkup(createElement(StaticRouter, { location: '/' }, createElement(AnnouncementBar, { config: { ...config, ...patch }, isVisible })))

test('announcement normalization keeps disabled state and empty optional fields', () => {
  const { normalizeHomepageAnnouncement, DEFAULT_HOMEPAGE_ANNOUNCEMENT } = normalization
  assert.deepEqual(normalizeHomepageAnnouncement(), DEFAULT_HOMEPAGE_ANNOUNCEMENT)
  assert.deepEqual(normalizeHomepageAnnouncement({ ...config, enabled: false, mobileText: '', linkLabel: '', linkHref: '' }), { ...config, enabled: false, mobileText: '', linkLabel: '', linkHref: '' })
})

test('announcement renders saved desktop and mobile copy, hides when disabled, and removes hidden CTA from tab order', () => {
  assert.match(render(), /Desktop sale/)
  assert.match(render(), /Mobile sale/)
  assert.equal(render({ enabled: false }), '')
  assert.match(render({}, false), /aria-hidden="true"/)
  assert.match(render({}, false), /tabindex="-1"/)
  assert.equal((render({ mobileText: '' }).match(/Desktop sale/g) || []).length, 2)
})

test('announcement supports optional local/external CTA and suppresses unsafe destinations', () => {
  assert.match(render(), /href="\/category\/all"/)
  assert.match(render({ linkHref: 'https://example.com/sale' }), /target="_blank"/)
  assert.match(render({ linkHref: 'https://example.com/sale' }), /rel="noopener noreferrer"/)
  for (const linkHref of ['', 'javascript:alert(1)', '//example.com', '/\\example.com', 'https://user:pass@example.com']) assert.doesNotMatch(render({ linkHref }), /<a /)
  assert.doesNotMatch(render({ linkLabel: '' }), /<a /)
})
