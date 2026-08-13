import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.mjs'
import { dehydrate } from '@tanstack/react-query'
import type { HelmetServerState } from 'react-helmet-async'
import { AppContent } from './App'
import { createAppQueryClient } from './queryClient'
import {
  CATEGORY_PAGE_SIZE,
  fetchProductById,
  fetchProductBySlug,
  fetchProductsByCategory,
} from '@/services/productService'

const productRequestCache = new Map<string, Promise<unknown>>()

export async function prerender(data: { url: string }) {
  const helmetContext = {} as { helmet?: HelmetServerState }
  const queryClient = createAppQueryClient()
  const productParam = data.url.startsWith('/product/')
    ? decodeURIComponent(data.url.slice('/product/'.length))
    : null

  if (productParam) {
    try {
      const isObjectId = /^[a-f\d]{24}$/i.test(productParam)
      const cacheKey = `${isObjectId ? 'id' : 'slug'}:${productParam}`
      let request = productRequestCache.get(cacheKey)
      if (!request) {
        request = isObjectId
          ? fetchProductById(productParam)
          : fetchProductBySlug(productParam)
        productRequestCache.set(cacheKey, request)
      }
      const product = await request
      queryClient.setQueryData(
        [isObjectId ? 'product' : 'product-slug', productParam],
        product
      )
    } catch {
      // The client fallback handles unavailable or missing product data.
    }
  }

  const categoryMatch = data.url.match(/^\/category\/([^/?]+)(?:\?page=(\d+))?$/)
  if (categoryMatch) {
    const category = decodeURIComponent(categoryMatch[1])
    const page = Math.max(1, Number(categoryMatch[2] || 1))
    const products = await fetchProductsByCategory(category, page, CATEGORY_PAGE_SIZE)
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
    '/category/pre-built',
    '/category/graphics-cards',
    '/category/monitors',
    '/category/processors',
    '/category/power-supply',
    '/category/accessories',
  ]

  return {
    html,
    data: { queryState: dehydrate(queryClient) },
    head,
    links: new Set(publicRoutes),
  }
}
