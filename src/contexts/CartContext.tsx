
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
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
  const [loading, setLoading] = useState<boolean>(true);
  const [userId, setUserId] = useState<string | null>(null);

  // Check auth status and load cart
  useEffect(() => {
    const checkAuthAndLoadCart = async () => {
      try {
        setLoading(true);
        
        // Listen for auth changes
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
              if (session?.user?.id) {
                setUserId(session.user.id);
                await loadCartFromSupabase(session.user.id);
              }
            } else if (event === 'SIGNED_OUT') {
              setUserId(null);
              setCartItems([]);
              
              // If signed out, load cart from localStorage as fallback
              const savedCart = localStorage.getItem("cart");
              if (savedCart) {
                try {
                  setCartItems(JSON.parse(savedCart));
                } catch (error) {
                  console.error("Error parsing cart data:", error);
                }
              }
            }
          }
        );
        
        // Check current session on initial load
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user?.id) {
          setUserId(session.user.id);
          await loadCartFromSupabase(session.user.id);
        } else {
          // Not logged in, use localStorage as fallback
          const savedCart = localStorage.getItem("cart");
          if (savedCart) {
            try {
              setCartItems(JSON.parse(savedCart));
            } catch (error) {
              console.error("Error parsing cart data:", error);
            }
          }
          setLoading(false);
        }
        
        return () => {
          subscription.unsubscribe();
        };
      } catch (error) {
        console.error("Cart initialization error:", error);
        setLoading(false);
      }
    };
    
    checkAuthAndLoadCart();
  }, []);

  // Load cart items from Supabase
  const loadCartFromSupabase = async (userId: string) => {
    try {
      setLoading(true);
      
      const { data: cartData, error } = await supabase
        .from('cart_items')
        .select('id, product_id, quantity, products(id, name, price, image)')
        .eq('user_id', userId);
        
      if (error) {
        throw error;
      }
      
      // Map Supabase data to our CartItem format
      const mappedCart: CartItem[] = cartData.map(item => ({
        id: item.id,
        product: item.product_id,
        name: item.products.name,
        price: item.products.price,
        image: item.products.image,
        quantity: item.quantity
      }));
      
      setCartItems(mappedCart);
    } catch (error) {
      console.error("Error loading cart from Supabase:", error);
      toast({
        title: "Error",
        description: "Failed to load your cart",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  // Save cart to appropriate storage
  const saveCart = async (items: CartItem[]) => {
    // Always update state
    setCartItems(items);
    
    if (userId) {
      // User is logged in, sync with Supabase
      // No need to do anything here as individual operations will update the DB
    } else {
      // User is not logged in, save to localStorage
      localStorage.setItem("cart", JSON.stringify(items));
    }
  };

  // Add item to cart
  const addToCart = async (product: Product, quantity = 1) => {
    try {
      const existingItem = cartItems.find(item => item.product === product.id.toString());
      
      if (userId) {
        // User is logged in, update Supabase
        if (existingItem) {
          // Update quantity if item already in cart
          const { error } = await supabase
            .from('cart_items')
            .update({ quantity: existingItem.quantity + quantity })
            .eq('user_id', userId)
            .eq('product_id', product.id);
            
          if (error) throw error;
          
          // Update local state
          const updatedItems = cartItems.map(item => 
            item.product === product.id.toString()
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          
          setCartItems(updatedItems);
          
          toast({
            title: "Cart updated",
            description: `${product.name} quantity updated in your cart.`
          });
        } else {
          // Add new item to cart
          const { data, error } = await supabase
            .from('cart_items')
            .insert({
              user_id: userId,
              product_id: product.id,
              quantity
            })
            .select('id')
            .single();
            
          if (error) throw error;
          
          // Add to local state
          setCartItems([
            ...cartItems,
            {
              id: data.id,
              product: product.id.toString(),
              name: product.name,
              price: product.price,
              image: product.image,
              quantity
            }
          ]);
          
          toast({
            title: "Added to cart",
            description: `${product.name} added to your cart.`
          });
        }
      } else {
        // User not logged in, use localStorage
        if (existingItem) {
          // Update quantity if item already in cart
          const updatedItems = cartItems.map(item => 
            item.product === product.id.toString()
              ? { ...item, quantity: item.quantity + quantity } 
              : item
          );
          
          saveCart(updatedItems);
          
          toast({
            title: "Cart updated",
            description: `${product.name} quantity updated in your cart.`
          });
        } else {
          // Add new item to cart
          saveCart([
            ...cartItems,
            {
              product: product.id.toString(),
              name: product.name,
              price: product.price,
              image: product.image,
              quantity
            }
          ]);
          
          toast({
            title: "Added to cart",
            description: `${product.name} added to your cart.`
          });
        }
      }
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive"
      });
    }
  };

  // Remove item from cart
  const removeFromCart = async (productId: string | number) => {
    try {
      const productIdStr = productId.toString();
      const itemToRemove = cartItems.find(item => item.product === productIdStr);
      
      if (!itemToRemove) return;
      
      if (userId) {
        // User is logged in, update Supabase
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId)
          .eq('product_id', productId);
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedItems = cartItems.filter(item => item.product !== productIdStr);
      saveCart(updatedItems);
      
      toast({
        title: "Item removed",
        description: `${itemToRemove.name} removed from your cart.`
      });
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart",
        variant: "destructive"
      });
    }
  };

  // Update item quantity
  const updateQuantity = async (productId: string | number, quantity: number) => {
    try {
      if (quantity < 1) return;
      
      const productIdStr = productId.toString();
      
      if (userId) {
        // User is logged in, update Supabase
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', userId)
          .eq('product_id', productId);
          
        if (error) throw error;
      }
      
      // Update local state
      const updatedItems = cartItems.map(item => 
        item.product === productIdStr ? { ...item, quantity } : item
      );
      
      saveCart(updatedItems);
    } catch (error) {
      console.error("Update quantity error:", error);
      toast({
        title: "Error",
        description: "Failed to update cart",
        variant: "destructive"
      });
    }
  };

  // Clear cart
  const clearCart = async () => {
    try {
      if (userId) {
        // User is logged in, clear cart in Supabase
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', userId);
          
        if (error) throw error;
      }
      
      // Clear local state
      saveCart([]);
      
      toast({
        title: "Cart cleared",
        description: "All items have been removed from your cart."
      });
    } catch (error) {
      console.error("Clear cart error:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart",
        variant: "destructive"
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
