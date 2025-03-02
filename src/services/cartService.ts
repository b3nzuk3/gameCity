
import api from './api';
import axios from 'axios';
import { toast } from '@/hooks/use-toast';

// Types
export type CartItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  id?: string; // ID field from frontend
  _id?: string; // ID field from MongoDB
};

export type Cart = {
  _id: string;
  user: string;
  cartItems: CartItem[];
};

// Services
export const cartService = {
  // Get user cart
  async getCart(): Promise<Cart> {
    try {
      const { data } = await api.get('/cart');
      return data;
    } catch (error) {
      console.error('Get cart error:', error);
      throw error;
    }
  },
  
  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    try {
      const { data } = await api.post('/cart', { productId, quantity });
      toast({
        title: 'Item added',
        description: 'Item has been added to your cart',
      });
      return data;
    } catch (error) {
      console.error('Add to cart error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to add item to cart';
        toast({
          title: 'Add to cart failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Add to cart failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Update cart item quantity
  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    try {
      const { data } = await api.put(`/cart/${productId}`, { quantity });
      toast({
        title: 'Cart updated',
        description: 'Cart has been updated successfully',
      });
      return data;
    } catch (error) {
      console.error(`Update cart error (Product ID: ${productId}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to update cart';
        toast({
          title: 'Update cart failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Update cart failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Remove item from cart
  async removeFromCart(productId: string): Promise<Cart> {
    try {
      const { data } = await api.delete(`/cart/${productId}`);
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      });
      return data;
    } catch (error) {
      console.error(`Remove from cart error (Product ID: ${productId}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to remove item';
        toast({
          title: 'Remove item failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Remove item failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Clear cart
  async clearCart(): Promise<{ message: string }> {
    try {
      const { data } = await api.delete('/cart');
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      });
      return data;
    } catch (error) {
      console.error('Clear cart error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to clear cart';
        toast({
          title: 'Clear cart failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Clear cart failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  }
};

export default cartService;
