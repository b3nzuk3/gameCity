import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import { toast } from '@/hooks/use-toast'
import { formatKESPrice } from '@/lib/currency'

// Product type definition
export type Product = {
  id: number | string
  name: string
  price: number
  image: string
  quantity?: number
  category?: string
  rating?: number
}

// Cart item type definition
export type CartItem = {
  product: string
  name: string
  price: number
  image: string
  quantity: number
  id?: string
}

// Context type definition
type CartContextType = {
  cartItems: CartItem[]
  addToCart: (product: Product, quantity?: number) => void
  removeFromCart: (productId: string | number) => void
  updateQuantity: (productId: string | number, quantity: number) => void
  clearCart: () => void
  total: number
  formatPrice: (price: number) => string
  loading: boolean
  getCartCount: () => number
}

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined)

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [loading, setLoading] = useState<boolean>(true)

  // Load cart from localStorage on initial mount
  useEffect(() => {
    const loadCart = () => {
      try {
        setLoading(true)
        const savedCart = localStorage.getItem('gamecity_cart')
        if (savedCart) {
          const parsedCart = JSON.parse(savedCart)
          setCartItems(parsedCart)
          console.log('Cart loaded from localStorage:', parsedCart)
        }
      } catch (error) {
        console.error('Error loading cart from localStorage:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCart()
  }, [])

  // Save cart to localStorage whenever cartItems changes
  useEffect(() => {
    if (!loading) {
      try {
        localStorage.setItem('gamecity_cart', JSON.stringify(cartItems))
        console.log('Cart saved to localStorage:', cartItems)
      } catch (error) {
        console.error('Error saving cart to localStorage:', error)
      }
    }
  }, [cartItems, loading])

  // Add item to cart
  const addToCart = (product: Product, quantity = 1) => {
    try {
      if (!product.id) {
        throw new Error('Product is missing an id')
      }
      const existingItem = cartItems.find(
        (item) => item.product === product.id.toString()
      )

      if (existingItem) {
        // Update quantity if item already in cart
        const updatedItems = cartItems.map((item) =>
          item.product === product.id.toString()
            ? { ...item, quantity: item.quantity + quantity }
            : item
        )

        setCartItems(updatedItems)

        toast({
          title: 'Cart updated',
          description: `${product.name} quantity updated in your cart.`,
        })
      } else {
        // Add new item to cart
        const newItem: CartItem = {
          id: `cart-${Date.now()}`,
          product: product.id.toString(),
          name: product.name,
          price: product.price,
          image: product.image,
          quantity,
        }

        setCartItems([...cartItems, newItem])

        toast({
          title: 'Added to cart',
          description: `${product.name} added to your cart.`,
        })
      }
    } catch (error) {
      console.error('Add to cart error:', error)
      toast({
        title: 'Error',
        description: 'Failed to add item to cart',
        variant: 'destructive',
      })
    }
  }

  // Remove item from cart
  const removeFromCart = (productId: string | number) => {
    try {
      const productIdStr = productId.toString()
      const itemToRemove = cartItems.find(
        (item) => item.product === productIdStr
      )

      if (!itemToRemove) return

      const updatedItems = cartItems.filter(
        (item) => item.product !== productIdStr
      )
      setCartItems(updatedItems)

      toast({
        title: 'Item removed',
        description: `${itemToRemove.name} removed from your cart.`,
      })
    } catch (error) {
      console.error('Remove from cart error:', error)
      toast({
        title: 'Error',
        description: 'Failed to remove item from cart',
        variant: 'destructive',
      })
    }
  }

  // Update item quantity
  const updateQuantity = (productId: string | number, quantity: number) => {
    try {
      if (quantity < 1) return

      const productIdStr = productId.toString()

      const updatedItems = cartItems.map((item) =>
        item.product === productIdStr ? { ...item, quantity } : item
      )

      setCartItems(updatedItems)
    } catch (error) {
      console.error('Update quantity error:', error)
      toast({
        title: 'Error',
        description: 'Failed to update cart',
        variant: 'destructive',
      })
    }
  }

  // Clear cart
  const clearCart = () => {
    try {
      setCartItems([])

      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart.',
      })
    } catch (error) {
      console.error('Clear cart error:', error)
      toast({
        title: 'Error',
        description: 'Failed to clear cart',
        variant: 'destructive',
      })
    }
  }

  // Get cart total
  const calculateTotal = () => {
    return cartItems.reduce(
      (total, item) => total + item.price * item.quantity,
      0
    )
  }

  // Get total number of items in cart
  const getCartCount = () => {
    return cartItems.reduce((total, item) => total + item.quantity, 0)
  }

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        total: calculateTotal(),
        formatPrice: formatKESPrice,
        loading,
        getCartCount,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider')
  }
  return context
}
