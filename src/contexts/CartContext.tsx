
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { toast } from "@/hooks/use-toast";

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

// Cart item type definition
export type CartItem = {
  product: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  id?: string;
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

  // Load cart from localStorage
  useEffect(() => {
    const savedCart = localStorage.getItem("cart");
    if (savedCart) {
      try {
        setCartItems(JSON.parse(savedCart));
      } catch (error) {
        console.error("Error parsing cart data:", error);
      }
    }
  }, []);

  // Save cart to localStorage when it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cartItems));
  }, [cartItems]);

  // Add item to cart
  const addToCart = async (product: Product, quantity = 1) => {
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
  };

  // Remove item from cart
  const removeFromCart = async (productId: string | number) => {
    const productIdStr = productId.toString();
    
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
  };

  // Update item quantity
  const updateQuantity = async (productId: string | number, quantity: number) => {
    if (quantity < 1) return;
    const productIdStr = productId.toString();
    
    setCartItems(prevItems => 
      prevItems.map(item => 
        item.product === productIdStr ? { ...item, quantity } : item
      )
    );
  };

  // Clear cart
  const clearCart = async () => {
    setCartItems([]);
    toast({
      title: "Cart cleared",
      description: "All items have been removed from your cart."
    });
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
