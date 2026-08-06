import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router-dom/server.mjs'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { HelmetProvider, type HelmetServerState } from 'react-helmet-async'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import AppRoutes from './routes'
import { Toaster } from '@/components/ui/toaster'
import { fetchProductById, fetchProductBySlug } from '@/services/productService'

export async function prerender(data: { url: string }) {
  const helmetContext: { helmet?: HelmetServerState } = {}
  const queryClient = new QueryClient()
  const productParam = data.url.startsWith('/product/')
    ? decodeURIComponent(data.url.slice('/product/'.length))
    : null

  if (productParam) {
    try {
      const isObjectId = /^[a-f\d]{24}$/i.test(productParam)
      const product = isObjectId
        ? await fetchProductById(productParam)
        : await fetchProductBySlug(productParam)
      queryClient.setQueryData(
        [isObjectId ? 'product' : 'product-slug', productParam],
        product
      )
    } catch {
      // The client fallback handles unavailable or missing product data.
    }
  }

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <StaticRouter location={data.url}>
                <div className="min-h-screen bg-background">
                  <AppRoutes />
                  <Toaster />
                </div>
              </StaticRouter>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
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

  return { html, head, links: new Set(publicRoutes) }
}
