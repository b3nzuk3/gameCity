
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';
import { authService } from './authService';

// Types
export type OrderItem = {
  product: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
};

export type ShippingAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

export type Order = {
  _id: string;
  user: string;
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  paymentResult?: {
    id: string;
    status: string;
    update_time: string;
    email_address: string;
  };
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
  isPaid: boolean;
  paidAt?: Date;
  isDelivered: boolean;
  deliveredAt?: Date;
  status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';
  createdAt: Date;
  updatedAt: Date;
};

export type OrderCreate = {
  orderItems: OrderItem[];
  shippingAddress: ShippingAddress;
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
};

// Services
export const orderService = {
  // Create new order
  async createOrder(orderData: OrderCreate): Promise<Order> {
    try {
      // Check if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        throw new Error('User not authenticated');
      }
      
      const userId = session.user.id;
      
      // Start a transaction using RPC (future enhancement: use proper transactions)
      // 1. Create the order
      const { data: orderResult, error: orderError } = await supabase
        .from('orders')
        .insert({
          user_id: userId,
          payment_method: orderData.paymentMethod,
          tax_price: orderData.taxPrice,
          shipping_price: orderData.shippingPrice,
          total_price: orderData.totalPrice,
          status: 'Processing'
        })
        .select()
        .single();
        
      if (orderError) throw orderError;
      
      // 2. Add shipping address
      const { error: shippingError } = await supabase
        .from('shipping_addresses')
        .insert({
          order_id: orderResult.id,
          street: orderData.shippingAddress.street,
          city: orderData.shippingAddress.city,
          state: orderData.shippingAddress.state,
          postal_code: orderData.shippingAddress.postalCode,
          country: orderData.shippingAddress.country
        });
        
      if (shippingError) throw shippingError;
      
      // 3. Add order items
      const orderItems = orderData.orderItems.map(item => ({
        order_id: orderResult.id,
        product_id: item.product,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity
      }));
      
      const { error: itemsError } = await supabase
        .from('order_items')
        .insert(orderItems);
        
      if (itemsError) throw itemsError;
      
      // 4. Clear the user's cart
      const { error: cartError } = await supabase
        .from('cart_items')
        .delete()
        .eq('user_id', userId);
        
      if (cartError) console.error('Error clearing cart:', cartError);
      
      toast({
        title: 'Order placed',
        description: 'Your order has been placed successfully',
      });
      
      // Return the created order in the format our app expects
      return {
        _id: orderResult.id,
        user: userId,
        orderItems: orderData.orderItems,
        shippingAddress: orderData.shippingAddress,
        paymentMethod: orderData.paymentMethod,
        taxPrice: orderData.taxPrice,
        shippingPrice: orderData.shippingPrice,
        totalPrice: orderData.totalPrice,
        isPaid: false,
        isDelivered: false,
        status: 'Processing',
        createdAt: new Date(orderResult.created_at),
        updatedAt: new Date(orderResult.updated_at)
      };
    } catch (error) {
      console.error('Create order error:', error);
      toast({
        title: 'Order failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      // Get order details
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
        
      if (orderError) throw orderError;
      
      // Get order items
      const { data: orderItems, error: itemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', id);
        
      if (itemsError) throw itemsError;
      
      // Get shipping address
      const { data: shippingAddress, error: addressError } = await supabase
        .from('shipping_addresses')
        .select('*')
        .eq('order_id', id)
        .single();
        
      if (addressError) throw addressError;
      
      // Get payment result if paid
      let paymentResult = undefined;
      if (order.is_paid) {
        const { data: payment, error: paymentError } = await supabase
          .from('payment_results')
          .select('*')
          .eq('order_id', id)
          .single();
          
        if (!paymentError && payment) {
          paymentResult = {
            id: payment.payment_id,
            status: payment.status,
            update_time: payment.update_time,
            email_address: payment.email_address
          };
        }
      }
      
      // Map to our app's Order format
      return {
        _id: order.id,
        user: order.user_id,
        orderItems: orderItems.map(item => ({
          product: item.product_id,
          name: item.name,
          image: item.image,
          price: item.price,
          quantity: item.quantity
        })),
        shippingAddress: {
          street: shippingAddress.street,
          city: shippingAddress.city,
          state: shippingAddress.state,
          postalCode: shippingAddress.postal_code,
          country: shippingAddress.country
        },
        paymentMethod: order.payment_method,
        paymentResult,
        taxPrice: order.tax_price,
        shippingPrice: order.shipping_price,
        totalPrice: order.total_price,
        isPaid: order.is_paid,
        paidAt: order.paid_at ? new Date(order.paid_at) : undefined,
        isDelivered: order.is_delivered,
        deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      };
    } catch (error) {
      console.error(`Get order error (ID: ${id}):`, error);
      throw error;
    }
  },
  
  // Update order to paid
  async updateOrderToPaid(
    id: string,
    paymentResult: {
      id: string;
      status: string;
      update_time: string;
      payer: { email_address: string };
    }
  ): Promise<Order> {
    try {
      // Update order paid status
      const { error: orderError } = await supabase
        .from('orders')
        .update({
          is_paid: true,
          paid_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (orderError) throw orderError;
      
      // Add payment result
      const { error: paymentError } = await supabase
        .from('payment_results')
        .insert({
          order_id: id,
          payment_id: paymentResult.id,
          status: paymentResult.status,
          update_time: paymentResult.update_time,
          email_address: paymentResult.payer.email_address
        });
        
      if (paymentError) throw paymentError;
      
      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed successfully',
      });
      
      // Get the updated order
      return this.getOrderById(id);
    } catch (error) {
      console.error(`Payment update error (Order ID: ${id}):`, error);
      toast({
        title: 'Payment failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update order to delivered (admin)
  async updateOrderToDelivered(id: string): Promise<Order> {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          is_delivered: true,
          delivered_at: new Date().toISOString(),
          status: 'Delivered',
          updated_at: new Date().toISOString()
        })
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Order updated',
        description: 'Order marked as delivered',
      });
      
      // Get the updated order
      return this.getOrderById(id);
    } catch (error) {
      console.error(`Delivery update error (Order ID: ${id}):`, error);
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Update order status (admin)
  async updateOrderStatus(
    id: string,
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  ): Promise<Order> {
    try {
      const updates: any = {
        status,
        updated_at: new Date().toISOString()
      };
      
      // If status is Delivered, update isDelivered as well
      if (status === 'Delivered') {
        updates.is_delivered = true;
        updates.delivered_at = new Date().toISOString();
      }
      
      const { error } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id);
        
      if (error) throw error;
      
      toast({
        title: 'Order updated',
        description: `Order status changed to ${status}`,
      });
      
      // Get the updated order
      return this.getOrderById(id);
    } catch (error) {
      console.error(`Status update error (Order ID: ${id}):`, error);
      toast({
        title: 'Update failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      throw error;
    }
  },
  
  // Get logged in user orders
  async getMyOrders(): Promise<Order[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return [];
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // For simplicity, we're returning basic order details
      // In a real app, you might want to fetch items and addresses too
      return orders.map(order => ({
        _id: order.id,
        user: order.user_id,
        orderItems: [],  // Would require additional queries to populate
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        paymentMethod: order.payment_method,
        taxPrice: order.tax_price,
        shippingPrice: order.shipping_price,
        totalPrice: order.total_price,
        isPaid: order.is_paid,
        paidAt: order.paid_at ? new Date(order.paid_at) : undefined,
        isDelivered: order.is_delivered,
        deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      }));
    } catch (error) {
      console.error('Get my orders error:', error);
      return [];
    }
  },
  
  // Get all orders (admin)
  async getOrders(): Promise<Order[]> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        return [];
      }
      
      // Check if user is admin (for security)
      const isAdmin = await authService.isAdmin();
      if (!isAdmin) {
        throw new Error('Unauthorized');
      }
      
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) throw error;
      
      // For simplicity, we're returning basic order details
      return orders.map(order => ({
        _id: order.id,
        user: order.user_id,
        orderItems: [],  // Would require additional queries to populate
        shippingAddress: {
          street: '',
          city: '',
          state: '',
          postalCode: '',
          country: ''
        },
        paymentMethod: order.payment_method,
        taxPrice: order.tax_price,
        shippingPrice: order.shipping_price,
        totalPrice: order.total_price,
        isPaid: order.is_paid,
        paidAt: order.paid_at ? new Date(order.paid_at) : undefined,
        isDelivered: order.is_delivered,
        deliveredAt: order.delivered_at ? new Date(order.delivered_at) : undefined,
        status: order.status,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at)
      }));
    } catch (error) {
      console.error('Get all orders error:', error);
      return [];
    }
  }
};

export default orderService;
