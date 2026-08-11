import assert from 'node:assert/strict'
import test from 'node:test'

function searchRequest(page = 1, search = '') {
  return `/products?${new URLSearchParams({
    page: String(page),
    ...(search.trim() ? { search: search.trim() } : {}),
  }).toString()}`
}

test('builds a product search request for product names', () => {
  assert.equal(searchRequest(1, 'RTX 5060'), '/products?page=1&search=RTX+5060')
})

test('builds a product search request for keywords', () => {
  assert.equal(searchRequest(1, 'gaming mouse'), '/products?page=1&search=gaming+mouse')
})

test('does not send an empty search filter', () => {
  assert.equal(searchRequest(), '/products?page=1')
  assert.equal(searchRequest(1, '   '), '/products?page=1')
})
