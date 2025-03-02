import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";
import { cartService, CartItem as ApiCartItem } from "@/services/cartService";
import { authService } from "@/services/authService";

// Product type definition
export type Product = {
  id: number | string;
  name: string;
  price: number;
  image: string;
  quantity?: number;
  category?: string;
  rating?: number;
};

// Cart item type definition (adjusted to match API format)
export type CartItem = {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  id?: string;
  _id?: string;
};

// Context type definition
type CartContextType = {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string | number) => void;
  updateQuantity: (productId: string | number, quantity: number) => void;
  clearCart: () => void;
  getCartTotal: () => number;
  getCartCount: () => number;
  loading: boolean;
};

// Create context
const CartContext = createContext<CartContextType | undefined>(undefined);

// Provider component
export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const isAuthenticated = authService.isAuthenticated();

  // Load cart from API if authenticated, otherwise from localStorage
  useEffect(() => {
    const fetchCart = async () => {
      if (isAuthenticated) {
        try {
          setLoading(true);
          const cart = await cartService.getCart();
          setCartItems(cart.cartItems);
        } catch (error) {
          console.error("Error fetching cart:", error);
        } finally {
          setLoading(false);
        }
      } else {
        // Load from localStorage for non-authenticated users
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
          try {
            setCartItems(JSON.parse(savedCart));
          } catch (error) {
            console.error("Error parsing cart data:", error);
          }
        }
      }
    };

    fetchCart();
  }, [isAuthenticated]);

  // Save cart to localStorage when it changes (for non-authenticated users)
  useEffect(() => {
    if (!isAuthenticated) {
      localStorage.setItem("cart", JSON.stringify(cartItems));
    }
  }, [cartItems, isAuthenticated]);

  // Add item to cart
  const addToCart = async (product: Product, quantity = 1) => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        const productId = product.id.toString();
        await cartService.addToCart(productId, quantity);
        
        // Refresh cart
        const cart = await cartService.getCart();
        setCartItems(cart.cartItems);
      } catch (error) {
        console.error("Error adding item to cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage logic for non-authenticated users
      setCartItems(prevItems => {
        const existingItem = prevItems.find(item => item.product === product.id.toString());
        
        if (existingItem) {
          // Update quantity if item already in cart
          const updatedItems = prevItems.map(item => 
            item.product === product.id.toString()
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          toast({
            title: "Cart updated",
            description: `${product.name} quantity updated in your cart.`
          });
          return updatedItems;
        } else {
          // Add new item to cart
          toast({
            title: "Added to cart",
            description: `${product.name} added to your cart.`
          });
          return [...prevItems, { 
            product: product.id.toString(),
            name: product.name,
            price: product.price,
            image: product.image,
            quantity
          }];
        }
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string | number) => {
    const productIdStr = productId.toString();
    
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.removeFromCart(productIdStr);
        
        // Refresh cart
        const cart = await cartService.getCart();
        setCartItems(cart.cartItems);
      } catch (error) {
        console.error("Error removing item from cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage logic for non-authenticated users
      setCartItems(prevItems => {
        const itemToRemove = prevItems.find(item => item.product === productIdStr);
        if (itemToRemove) {
          toast({
            title: "Item removed",
            description: `${itemToRemove.name} removed from your cart.`
          });
        }
        return prevItems.filter(item => item.product !== productIdStr);
      });
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity < 1) return;
    const productIdStr = productId.toString();
    
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.updateCartItem(productIdStr, quantity);
        
        // Refresh cart
        const cart = await cartService.getCart();
        setCartItems(cart.cartItems);
      } catch (error) {
        console.error("Error updating cart item quantity:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage logic for non-authenticated users
      setCartItems(prevItems => 
        prevItems.map(item => 
          item.product === productIdStr ? { ...item, quantity } : item
        )
      );
    }
  };

  // Clear cart
  const clearCart = async () => {
    if (isAuthenticated) {
      try {
        setLoading(true);
        await cartService.clearCart();
        setCartItems([]);
      } catch (error) {
        console.error("Error clearing cart:", error);
      } finally {
        setLoading(false);
      }
    } else {
      // Local storage logic for non-authenticated users
      setCartItems([]);
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart."
      });
    }
  };

  // Get cart total
  const getCartTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Get cart count (total number of items)
  const getCartCount = () => {
    return cartItems.reduce((count, item) => count + item.quantity, 0);
  };

  return (
    <CartContext.Provider
      value={{
        cartItems,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getCartTotal,
        getCartCount,
        loading
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// Custom hook to use the cart context
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
};
