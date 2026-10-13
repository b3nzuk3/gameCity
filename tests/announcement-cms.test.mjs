import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import test from 'node:test'

const service = readFileSync('src/services/backendService.ts', 'utf8')
const announcementBar = readFileSync('src/components/AnnouncementBar.tsx', 'utf8')
const layout = readFileSync('src/components/Layout.tsx', 'utf8')

test('homepage response declares the CMS announcement contract and legacy fallback', () => {
  assert.match(service, /export type HomepageAnnouncement = \{/)
  assert.match(service, /enabled: boolean/)
  assert.match(service, /mobileText: string/)
  assert.match(service, /linkLabel: string/)
  assert.match(service, /linkHref: string/)
  assert.match(service, /announcement: HomepageAnnouncement/)
  assert.match(service, /normalizeHomepageAnnouncement\(/)
  assert.match(service, /Gaming PCs, components & accessories • Delivery across Kenya/)
})

test('layout reads the shared public homepage query and derives actual bar visibility', () => {
  assert.match(layout, /queryKey: \['homepage', 'public'\]/)
  assert.match(layout, /staleTime: 60_000/)
  assert.match(layout, /homepage\.data\?\.announcement/)
  assert.match(layout, /announcement\.enabled && isAtTop/)
  assert.match(layout, /<Navbar announcementVisible=\{announcementVisible\}/)
})

test('announcement bar renders CMS copy, safe links, and no tab stop while hidden', () => {
  assert.match(announcementBar, /config\.mobileText\.trim\(\) \|\| config\.text/)
  assert.match(announcementBar, /trimmedHref\.startsWith\('\/'\)/)
  assert.match(announcementBar, /url\.protocol === 'http:' \|\| url\.protocol === 'https:'/)
  assert.match(announcementBar, /url\.username/)
  assert.match(announcementBar, /url\.password/)
  assert.match(announcementBar, /tabIndex=\{isVisible \? 0 : -1\}/)
  assert.match(announcementBar, /if \(!config\.enabled\) return null/)
})

test('compact announcement bar leaves vertical room for glyph descenders', () => {
  assert.match(announcementBar, /flex h-8 items-center/)
  assert.match(announcementBar, /truncate leading-5/)
  assert.doesNotMatch(announcementBar, /leading-none/)
  assert.match(layout, /pt-\[9rem\] lg:pt-\[6rem\]/)
})