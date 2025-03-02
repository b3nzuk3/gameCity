
import api from './api';
import { toast } from '@/hooks/use-toast';

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
      const { data } = await api.post('/orders', orderData);
      toast({
        title: 'Order placed',
        description: 'Your order has been placed successfully',
      });
      return data;
    } catch (error) {
      console.error('Create order error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to place order';
        toast({
          title: 'Order failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Order failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Get order by ID
  async getOrderById(id: string): Promise<Order> {
    try {
      const { data } = await api.get(`/orders/${id}`);
      return data;
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
      const { data } = await api.put(`/orders/${id}/pay`, paymentResult);
      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed successfully',
      });
      return data;
    } catch (error) {
      console.error(`Payment update error (Order ID: ${id}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Payment processing failed';
        toast({
          title: 'Payment failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Payment failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Update order to delivered (admin)
  async updateOrderToDelivered(id: string): Promise<Order> {
    try {
      const { data } = await api.put(`/orders/${id}/deliver`, {});
      toast({
        title: 'Order updated',
        description: 'Order marked as delivered',
      });
      return data;
    } catch (error) {
      console.error(`Delivery update error (Order ID: ${id}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to update delivery status';
        toast({
          title: 'Update failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Update order status (admin)
  async updateOrderStatus(
    id: string,
    status: 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled'
  ): Promise<Order> {
    try {
      const { data } = await api.put(`/orders/${id}/status`, { status });
      toast({
        title: 'Order updated',
        description: `Order status changed to ${status}`,
      });
      return data;
    } catch (error) {
      console.error(`Status update error (Order ID: ${id}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to update order status';
        toast({
          title: 'Update failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Update failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Get logged in user orders
  async getMyOrders(): Promise<Order[]> {
    try {
      const { data } = await api.get('/orders/myorders');
      return data;
    } catch (error) {
      console.error('Get my orders error:', error);
      throw error;
    }
  },
  
  // Get all orders (admin)
  async getOrders(): Promise<Order[]> {
    try {
      const { data } = await api.get('/orders');
      return data;
    } catch (error) {
      console.error('Get all orders error:', error);
      throw error;
    }
  }
};

export default orderService;
