import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { toast } from '@/hooks/use-toast'

// Product type definition
export type FavoriteProduct = {
  id: number | string
  name: string
  price: number
  image: string
  category?: string
  rating?: number
}

// Context type definition
type FavoritesContextType = {
  favorites: FavoriteProduct[]
  addToFavorites: (product: FavoriteProduct) => void
  removeFromFavorites: (productId: string | number) => void
  isFavorite: (productId: string | number) => boolean
  loading: boolean
}

// Create context
const FavoritesContext = createContext<FavoritesContextType | undefined>(
  undefined
)

// Provider component
export const FavoritesProvider = ({ children }: { children: ReactNode }) => {
  const [favorites, setFavorites] = useState<FavoriteProduct[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Load favorites from localStorage on initial mount
  useEffect(() => {
    const loadFavorites = () => {
      try {
        setLoading(true)
        const savedFavorites = localStorage.getItem('gamecity_favorites')
        if (savedFavorites) {
          const parsedFavorites = JSON.parse(savedFavorites)
          setFavorites(parsedFavorites)
          console.log('Favorites loaded from localStorage:', parsedFavorites)
        }
      } catch (error) {
        console.error('Error loading favorites from localStorage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadFavorites()
  }, [])

  // Save favorites to localStorage whenever it changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('gamecity_favorites', JSON.stringify(favorites))
        console.log('Favorites saved to localStorage:', favorites)
      } catch (error) {
        console.error('Error saving favorites to localStorage:', error)
      }
    }
  }, [favorites, loading])

  // Add product to favorites
  const addToFavorites = (product: FavoriteProduct) => {
    try {
      const exists = favorites.some(
        (item) => item.id.toString() === product.id.toString()
      )

      if (!exists) {
        setFavorites([...favorites, product])
        toast({
          title: 'Added to favorites',
          description: `${product.name} has been added to your favorites.`,
        })
      }
    } catch (error) {
      console.error('Add to favorites error:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item to favorites',
        variant: 'destructive',
      })
    }
  }

  // Remove product from favorites
  const removeFromFavorites = (productId: string | number) => {
    try {
      const productIdStr = productId.toString()
      const itemToRemove = favorites.find(
        (item) => item.id.toString() === productIdStr
      )

      if (!itemToRemove) return

      const updatedFavorites = favorites.filter(
        (item) => item.id.toString() !== productIdStr
      )
      setFavorites(updatedFavorites)

      toast({
        title: 'Removed from favorites',
        description: `${itemToRemove.name} removed from your favorites.`,
      })
    } catch (error) {
      console.error('Remove from favorites error:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove item from favorites',
        variant: 'destructive',
      })
    }
  }

  // Check if a product is in favorites
  const isFavorite = (productId: string | number) => {
    return favorites.some((item) => item.id.toString() === productId.toString())
  }

  return (
    <FavoritesContext.Provider
      value={{
        favorites,
        addToFavorites,
        removeFromFavorites,
        isFavorite,
        loading,
      }}
    >
      {children}
    </FavoritesContext.Provider>
  )
}

// Custom hook to use the favorites context
export const useFavorites = () => {
  const context = useContext(FavoritesContext)
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider')
  }
  return context
}
