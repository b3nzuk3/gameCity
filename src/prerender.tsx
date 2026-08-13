import React from 'react'
import { renderToString } from 'react-dom/server'
import catalog from '../public/catalog-manifest.json'
import { StaticRouter } from 'react-router-dom/server.mjs'
import { dehydrate } from '@tanstack/react-query'
import type { HelmetServerState } from 'react-helmet-async'
import { AppContent } from './App'
import { createAppQueryClient } from './queryClient'
import {
  CATEGORY_PAGE_SIZE,
} from '@/services/productService'

type CatalogEntry = {
  id: string
  path: string
  category?: string | null
  data?: Record<string, unknown>
}

// The manifest is loaded once per Vercel build. All product and category routes
// reuse this snapshot instead of making route-by-route API requests.
if (!catalog.complete || catalog.truncated || catalog.products.some((entry) => !entry.data)) {
  throw new Error('Prerender catalog snapshot is incomplete or missing product data')
}

const normalizeCategory = (value: string) => value.toLowerCase().trim().replace(/\s+/g, '-')

const categoryProducts = (category: string) => {
  const normalized = normalizeCategory(category)
  return catalog.products
    .filter((entry) => normalized === 'all' || normalizeCategory(entry.category || '') === normalized)
    .map((entry) => entry.data as Record<string, unknown>)
}

export async function prerender(data: { url: string }) {
  const helmetContext = {} as { helmet?: HelmetServerState }
  const queryClient = createAppQueryClient()
  const productParam = data.url.startsWith('/product/')
    ? decodeURIComponent(data.url.slice('/product/'.length))
    : null

  if (productParam) {
    const entry = catalog.products.find((item) => item.path === data.url)
    if (!entry?.data) throw new Error(`Product route is missing from catalog snapshot: ${data.url}`)
    queryClient.setQueryData(['product-slug', productParam], entry.data)
  }

  const categoryMatch = data.url.match(/^\/category\/([^/?]+)(?:\/page\/(\d+))?(?:\?page=(\d+))?$/)
  if (categoryMatch) {
    const category = decodeURIComponent(categoryMatch[1])
    const page = Math.max(1, Number(categoryMatch[2] || categoryMatch[3] || 1))
    const allProducts = categoryProducts(category)
    const start = (page - 1) * CATEGORY_PAGE_SIZE
    const products = {
      products: allProducts.slice(start, start + CATEGORY_PAGE_SIZE),
      page,
      pages: Math.max(1, Math.ceil(allProducts.length / CATEGORY_PAGE_SIZE)),
      total: allProducts.length,
      hasMore: start + CATEGORY_PAGE_SIZE < allProducts.length,
    }
    queryClient.setQueryData(
      ['category-products', category, page, CATEGORY_PAGE_SIZE],
      products
    )
  }

  const html = renderToString(
    <AppContent
      Router={StaticRouter}
      routerProps={{ location: data.url }}
      queryClient={queryClient}
      helmetContext={helmetContext}
    />
  )

  const helmet = helmetContext.helmet
  const title = helmet?.title?.toString?.()
    ?.replace(/<[^>]*>/g, '')
    ?.replace(/&amp;/g, '&')
    ?.replace(/&quot;/g, '"')
    ?.replace(/&#x27;/g, "'")
  const head = helmet
    ? {
        title: title || undefined,
        elements: new Set([
          helmet.meta?.toString?.(),
          helmet.link?.toString?.(),
          helmet.script?.toString?.(),
        ].filter(Boolean)),
      }
    : undefined

  const publicRoutes = [
    '/',
    '/contact',
    '/privacy',
    '/terms',
    '/sitemap',
    ...readCategoryRoutes(),
  ]

  return {
    html,
    data: { queryState: dehydrate(queryClient) },
    head,
    links: new Set(publicRoutes),
  }
}

function readCategoryRoutes(): string[] {
  const counts = new Map<string, number>([['all', catalog.products.length]])
  for (const product of catalog.products) {
    const category = normalizeCategory(product.category || '')
    if (category) counts.set(category, (counts.get(category) || 0) + 1)
  }
  return [...counts.entries()].flatMap(([category, total]) => {
    const pages = Math.max(1, Math.ceil(total / CATEGORY_PAGE_SIZE))
    return [
      `/category/${category}`,
      ...Array.from({ length: pages }, (_, index) =>
        `/category/${category}/page/${index + 1}`
      ),
    ]
  })
}
