import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import test from 'node:test'

const root = new URL('..', import.meta.url)

test('llms.txt contains an H1 and public Markdown links', async () => {
  const content = await readFile(new URL('public/llms.txt', root), 'utf8')

  assert.match(content, /^#\s+[^\n]+/m)
  assert.ok((content.match(/^[-*]\s+\[[^\]]+\]\(https?:\/\/[^)]+\)$/gm) ?? []).length >= 5)
  assert.match(content, /https:\/\/www\.gamecityelectronics\.co\.ke\//)
  assert.match(content, /https:\/\/www\.gamecityelectronics\.co\.ke\/sitemap\.xml/)
  assert.doesNotMatch(content, /gamecityelectronics\.co\.ke\/(?:admin|api)(?:\/|\b)/)
})

test('mobile Navbar icon-only controls have accessible names', async () => {
  const source = await readFile(new URL('src/components/Navbar.tsx', root), 'utf8')

  assert.match(source, /aria-label="Open search"/)
  assert.match(source, /to="\/cart"[\s\S]{0,120}aria-label="View cart"/)
  assert.match(source, /aria-label="Open menu"/)
})