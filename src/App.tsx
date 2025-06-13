import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { Toaster } from '@/components/ui/toaster'
import { BrowserRouter as Router } from 'react-router-dom'
import AppRoutes from './routes'
import { CartProvider } from '@/contexts/CartContext'
import { AuthProvider } from '@/contexts/AuthContext'
import { FavoritesProvider } from '@/contexts/FavoritesContext'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
})

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <CartProvider>
          <FavoritesProvider>
            <Router>
              <div className="min-h-screen bg-background">
                <AppRoutes />
                <Toaster />
              </div>
            </Router>
          </FavoritesProvider>
        </CartProvider>
      </AuthProvider>
    </QueryClientProvider>
  )
}

export default App
