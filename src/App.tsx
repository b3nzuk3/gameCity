import type * as React from 'react'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { BrowserRouter, type BrowserRouterProps } from 'react-router-dom'
import { HelmetProvider, type HelmetProviderContext } from 'react-helmet-async'
import AppRoutes from './routes'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'
import PerformanceMonitor from '@/components/PerformanceMonitor'
import { createAppQueryClient } from './queryClient'

export type AppRouterProps = BrowserRouterProps & {
  children: React.ReactNode
}

export function AppContent({ Router = BrowserRouter, routerProps, queryClient, helmetContext }: {
  Router?: React.ComponentType<AppRouterProps>
  routerProps?: Omit<AppRouterProps, 'children'>
  queryClient?: QueryClient
  helmetContext?: HelmetProviderContext
}) {
  const client = queryClient ?? createAppQueryClient()
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={client}>
        <AuthProvider>
          <CartProvider>
            <FavoritesProvider>
              <Router {...routerProps}>
                <div className="min-h-screen bg-background">
                  <PerformanceMonitor />
                  <AppRoutes />
                  <Toaster />
                </div>
              </Router>
            </FavoritesProvider>
          </CartProvider>
        </AuthProvider>
      </QueryClientProvider>
    </HelmetProvider>
  )
}

function App() {
  return <AppContent />
}

export default App
