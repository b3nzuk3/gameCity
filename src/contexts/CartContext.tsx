import React, { createContext, useState, useEffect, useContext } from 'react';
import { Product, CartItem } from '@/types';
import { useUser } from '@/hooks/useUser';
import { supabase } from '@/integrations/supabase/client';
import { toast } from "@/hooks/use-toast";

interface CartContextType {
  cart: CartItem[];
  addToCart: (productId: string, quantity?: number) => Promise<void>;
  removeFromCart: (productId: string) => Promise<void>;
  updateCartItemQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => Promise<void>;
  isLoading: boolean;
  cartTotal: number;
  itemCount: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

  useEffect(() => {
    const loadCart = async () => {
      setIsLoading(true);
      try {
        if (user) {
          const { data, error } = await supabase
            .from('cart_items')
            .select('product_id, quantity')
            .eq('user_id', user.id);

          if (error) {
            console.error("Error fetching cart items:", error);
            toast({
              title: "Error",
              description: "Failed to load cart items.",
              variant: "destructive",
            })
          } else {
            setCart(data.map(item => ({ product_id: item.product_id.toString(), quantity: item.quantity })));
          }
        } else {
          const storedCart = localStorage.getItem('guest_cart');
          if (storedCart) {
            setCart(JSON.parse(storedCart));
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    loadCart();
  }, [user]);

  useEffect(() => {
    if (!user) {
      localStorage.setItem('guest_cart', JSON.stringify(cart));
    }
  }, [cart, user]);

  const cartTotal = cart.reduce((total, item) => {
    return total + (item.product?.price || 0) * item.quantity;
  }, 0);

  const itemCount = cart.reduce((count, item) => count + item.quantity, 0);

  const addToCart = async (productId: string, quantity: number = 1) => {
    try {
      setIsLoading(true);
      
      if (user) {
        const { data: existingItem, error: checkError } = await supabase
          .from('cart_items')
          .select('*')
          .eq('user_id', user.id)
          .eq('product_id', productId.toString())
          .single();
          
        if (checkError && checkError.code !== 'PGRST116') {
          console.error("Error checking existing cart item:", checkError);
          toast({
            title: "Error",
            description: "Failed to add item to cart.",
            variant: "destructive",
          })
          return;
        }
        
        if (existingItem) {
          const newQuantity = existingItem.quantity + quantity;
          await updateCartItemQuantity(productId, newQuantity);
        } else {
          const newItem: CartItem = {
            product_id: productId,
            quantity: quantity
          };
          await upsertCartItem(newItem);
          setCart(prevCart => [...prevCart, newItem]);
        }
      } else {
        const existingItemIndex = cart.findIndex(item => item.product_id === productId);
        
        if (existingItemIndex !== -1) {
          const newCart = [...cart];
          newCart[existingItemIndex].quantity += quantity;
          setCart(newCart);
        } else {
          const newItem: CartItem = {
            product_id: productId,
            quantity: quantity
          };
          setCart(prevCart => [...prevCart, newItem]);
        }
      }
      
      toast({
        title: "Success",
        description: "Item added to cart!",
      })
    } catch (error) {
      console.error("Add to cart error:", error);
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const upsertCartItem = async (item: CartItem) => {
    const { data, error } = await supabase
      .from('cart_items')
      .upsert({
        user_id: user!.id,
        product_id: item.product_id.toString(),
        quantity: item.quantity
      })
      .select();
      
    if (error) {
      console.error("Error upserting cart item:", error);
      toast({
        title: "Error",
        description: "Failed to update cart item.",
        variant: "destructive",
      })
    } else {
      setCart(prevCart => {
        const existingItemIndex = prevCart.findIndex(cartItem => cartItem.product_id === item.product_id);
        if (existingItemIndex !== -1) {
          const newCart = [...prevCart];
          newCart[existingItemIndex] = item;
          return newCart;
        } else {
          return [...prevCart, item];
        }
      });
    }
  };

  const removeFromCart = async (productId: string) => {
    try {
      setIsLoading(true);
      
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id)
          .eq('product_id', productId.toString());
          
        if (error) {
          console.error("Error removing cart item:", error);
          toast({
            title: "Error",
            description: "Failed to remove item from cart.",
            variant: "destructive",
          })
        } else {
          setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
        }
      } else {
        setCart(prevCart => prevCart.filter(item => item.product_id !== productId));
      }
      
      toast({
        title: "Success",
        description: "Item removed from cart!",
      })
    } catch (error) {
      console.error("Remove from cart error:", error);
      toast({
        title: "Error",
        description: "Failed to remove item from cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const updateCartItemQuantity = async (productId: string, quantity: number) => {
    try {
      setIsLoading(true);
      
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .update({ quantity })
          .eq('user_id', user.id)
          .eq('product_id', productId.toString());
          
        if (error) {
          console.error("Error updating cart item quantity:", error);
          toast({
            title: "Error",
            description: "Failed to update cart item quantity.",
            variant: "destructive",
          })
        } else {
          setCart(prevCart => {
            const updatedCart = prevCart.map(item =>
              item.product_id === productId ? { ...item, quantity: quantity } : item
            );
            return updatedCart;
          });
        }
      } else {
        setCart(prevCart => {
          const updatedCart = prevCart.map(item =>
            item.product_id === productId ? { ...item, quantity: quantity } : item
          );
          return updatedCart;
        });
      }
      
      toast({
        title: "Success",
        description: "Cart item quantity updated!",
      })
    } catch (error) {
      console.error("Update cart item quantity error:", error);
      toast({
        title: "Error",
        description: "Failed to update cart item quantity.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const clearCart = async () => {
    setIsLoading(true);
    try {
      if (user) {
        const { error } = await supabase
          .from('cart_items')
          .delete()
          .eq('user_id', user.id);

        if (error) {
          console.error("Error clearing cart:", error);
          toast({
            title: "Error",
            description: "Failed to clear cart.",
            variant: "destructive",
          })
        }
      }
      setCart([]);
      toast({
        title: "Success",
        description: "Cart cleared!",
      })
    } catch (error) {
      console.error("Clear cart error:", error);
      toast({
        title: "Error",
        description: "Failed to clear cart.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false);
    }
  };

  const value: CartContextType = {
    cart,
    addToCart,
    removeFromCart,
    updateCartItemQuantity,
    clearCart,
    isLoading,
    cartTotal,
    itemCount,
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
