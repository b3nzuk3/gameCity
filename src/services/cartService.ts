
import { toast } from '@/hooks/use-toast';

// Types
export type CartItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  id?: string;
  _id?: string;
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
      const cartStr = localStorage.getItem('cart');
      const cartItems = cartStr ? JSON.parse(cartStr) : [];
      
      // Create a cart object that mimics the MongoDB structure
      return {
        _id: 'cart_local',
        user: 'current_user',
        cartItems
      };
    } catch (error) {
      console.error('Get cart error:', error);
      return {
        _id: 'cart_local',
        user: 'current_user',
        cartItems: []
      };
    }
  },
  
  // Add item to cart
  async addToCart(productId: string, quantity: number = 1): Promise<Cart> {
    try {
      const cartStr = localStorage.getItem('cart');
      const cartItems: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      
      // Check if product already exists in cart
      const existingItemIndex = cartItems.findIndex(item => item.product === productId);
      
      if (existingItemIndex !== -1) {
        // Update quantity if product already in cart
        cartItems[existingItemIndex].quantity += quantity;
      } else {
        // This is a simplified approach. In a real app, you'd fetch product details
        // from a product service.
        // For now, we'll just add the product ID and update it later when displaying
        cartItems.push({
          product: productId,
          name: 'Product',
          image: '/placeholder.svg',
          price: 0,
          quantity
        });
      }
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast({
        title: 'Item added',
        description: 'Item has been added to your cart',
      });
      
      return {
        _id: 'cart_local',
        user: 'current_user',
        cartItems
      };
    } catch (error) {
      console.error('Add to cart error:', error);
      toast({
        title: 'Add to cart failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update cart item quantity
  async updateCartItem(productId: string, quantity: number): Promise<Cart> {
    try {
      const cartStr = localStorage.getItem('cart');
      const cartItems: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      
      // Find the item index
      const itemIndex = cartItems.findIndex(item => item.product === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }
      
      // Update quantity
      if (quantity > 0) {
        cartItems[itemIndex].quantity = quantity;
      } else {
        // Remove the item if quantity is 0 or negative
        cartItems.splice(itemIndex, 1);
      }
      
      localStorage.setItem('cart', JSON.stringify(cartItems));
      
      toast({
        title: 'Cart updated',
        description: 'Cart has been updated successfully',
      });
      
      return {
        _id: 'cart_local',
        user: 'current_user',
        cartItems
      };
    } catch (error) {
      console.error(`Update cart error (Product ID: ${productId}):`, error);
      toast({
        title: 'Update cart failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Remove item from cart
  async removeFromCart(productId: string): Promise<Cart> {
    try {
      const cartStr = localStorage.getItem('cart');
      const cartItems: CartItem[] = cartStr ? JSON.parse(cartStr) : [];
      
      // Remove the item
      const updatedCartItems = cartItems.filter(item => item.product !== productId);
      
      localStorage.setItem('cart', JSON.stringify(updatedCartItems));
      
      toast({
        title: 'Item removed',
        description: 'Item has been removed from your cart',
      });
      
      return {
        _id: 'cart_local',
        user: 'current_user',
        cartItems: updatedCartItems
      };
    } catch (error) {
      console.error(`Remove from cart error (Product ID: ${productId}):`, error);
      toast({
        title: 'Remove item failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Clear cart
  async clearCart(): Promise<{ message: string }> {
    try {
      localStorage.setItem('cart', JSON.stringify([]));
      
      toast({
        title: 'Cart cleared',
        description: 'All items have been removed from your cart',
      });
      
      return { message: 'Cart cleared' };
    } catch (error) {
      console.error('Clear cart error:', error);
      toast({
        title: 'Clear cart failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  }
};

export default cartService;
