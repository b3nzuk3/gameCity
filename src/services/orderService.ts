
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

// LocalStorage helper functions
const getOrders = (): Order[] => {
  const ordersStr = localStorage.getItem('orders');
  return ordersStr ? JSON.parse(ordersStr) : [];
};

const saveOrders = (orders: Order[]): void => {
  localStorage.setItem('orders', JSON.stringify(orders));
};

// Services
export const orderService = {
  // Create new order
  async createOrder(orderData: OrderCreate): Promise<Order> {
    try {
      const currentUser = authService.getCurrentUser();
      const userId = currentUser ? currentUser._id : 'guest_user';
      
      const newOrder: Order = {
        _id: 'order_' + Date.now(),
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
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const orders = getOrders();
      orders.push(newOrder);
      saveOrders(orders);
      
      // Clear cart after order is created
      localStorage.setItem('cart', JSON.stringify([]));
      
      toast({
        title: 'Order placed',
        description: 'Your order has been placed successfully',
      });
      
      return newOrder;
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
      const orders = getOrders();
      const order = orders.find(o => o._id === id);
      
      if (!order) {
        throw new Error('Order not found');
      }
      
      return order;
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
      const orders = getOrders();
      const orderIndex = orders.findIndex(o => o._id === id);
      
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      orders[orderIndex].isPaid = true;
      orders[orderIndex].paidAt = new Date();
      orders[orderIndex].paymentResult = {
        id: paymentResult.id,
        status: paymentResult.status,
        update_time: paymentResult.update_time,
        email_address: paymentResult.payer.email_address
      };
      orders[orderIndex].updatedAt = new Date();
      
      saveOrders(orders);
      
      toast({
        title: 'Payment successful',
        description: 'Your payment has been processed successfully',
      });
      
      return orders[orderIndex];
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
      const orders = getOrders();
      const orderIndex = orders.findIndex(o => o._id === id);
      
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      orders[orderIndex].isDelivered = true;
      orders[orderIndex].deliveredAt = new Date();
      orders[orderIndex].status = 'Delivered';
      orders[orderIndex].updatedAt = new Date();
      
      saveOrders(orders);
      
      toast({
        title: 'Order updated',
        description: 'Order marked as delivered',
      });
      
      return orders[orderIndex];
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
      const orders = getOrders();
      const orderIndex = orders.findIndex(o => o._id === id);
      
      if (orderIndex === -1) {
        throw new Error('Order not found');
      }
      
      orders[orderIndex].status = status;
      orders[orderIndex].updatedAt = new Date();
      
      // If status is Delivered, update isDelivered as well
      if (status === 'Delivered') {
        orders[orderIndex].isDelivered = true;
        orders[orderIndex].deliveredAt = new Date();
      }
      
      saveOrders(orders);
      
      toast({
        title: 'Order updated',
        description: `Order status changed to ${status}`,
      });
      
      return orders[orderIndex];
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
      const currentUser = authService.getCurrentUser();
      
      if (!currentUser) {
        return [];
      }
      
      const orders = getOrders();
      return orders.filter(o => o.user === currentUser._id);
    } catch (error) {
      console.error('Get my orders error:', error);
      return [];
    }
  },
  
  // Get all orders (admin)
  async getOrders(): Promise<Order[]> {
    try {
      return getOrders();
    } catch (error) {
      console.error('Get all orders error:', error);
      return [];
    }
  }
};

export default orderService;
