
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus } from '@/types';

interface OrderCreate {
  items: Array<{
    product_id: string;
    quantity: number;
  }>;
  shippingAddress: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  paymentMethod: string;
  taxPrice: number;
  shippingPrice: number;
  totalPrice: number;
}

interface PaymentResult {
  id: string;
  status: string;
  update_time: string;
  email_address: string;
}

// Create a new order
export const createOrder = async (orderData: OrderCreate): Promise<Order> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('User not authenticated');
  }
  
  const user_id = session.session.user.id;
  
  const { data, error } = await supabase
    .from('orders')
    .insert({
      user_id,
      status: 'Processing' as OrderStatus,
      items: orderData.items,
      shipping_address: orderData.shippingAddress,
      payment_method: orderData.paymentMethod,
      tax_price: orderData.taxPrice,
      shipping_price: orderData.shippingPrice,
      total_price: orderData.totalPrice,
      is_paid: false,
      is_delivered: false
    })
    .select()
    .single();
    
  if (error) {
    console.error('Error creating order:', error);
    throw new Error('Failed to create order');
  }
  
  // Convert to Order type
  const order: Order = {
    id: data.id,
    user_id: data.user_id,
    items: data.items,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    taxPrice: data.tax_price,
    shippingPrice: data.shipping_price,
    totalPrice: data.total_price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return order;
};

// Get order by ID
export const getOrderById = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('id', id)
    .single();
    
  if (error) {
    console.error('Error fetching order:', error);
    throw new Error('Failed to fetch order');
  }
  
  // Convert to Order type
  const order: Order = {
    id: data.id,
    user_id: data.user_id,
    items: data.items,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    taxPrice: data.tax_price,
    shippingPrice: data.shipping_price,
    totalPrice: data.total_price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return order;
};

// Update order to paid
export const updateOrderToPaid = async (id: string, paymentResult: PaymentResult): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      is_paid: true,
      paid_at: new Date().toISOString(),
      payment_result: paymentResult
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating order to paid:', error);
    throw new Error('Failed to update order payment status');
  }
  
  // Convert to Order type
  const order: Order = {
    id: data.id,
    user_id: data.user_id,
    items: data.items,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    taxPrice: data.tax_price,
    shippingPrice: data.shipping_price,
    totalPrice: data.total_price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return order;
};

// Update order to delivered
export const updateOrderToDelivered = async (id: string): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({
      is_delivered: true,
      delivered_at: new Date().toISOString(),
      status: 'Delivered' as OrderStatus
    })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating order to delivered:', error);
    throw new Error('Failed to update order delivery status');
  }
  
  // Convert to Order type
  const order: Order = {
    id: data.id,
    user_id: data.user_id,
    items: data.items,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    taxPrice: data.tax_price,
    shippingPrice: data.shipping_price,
    totalPrice: data.total_price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return order;
};

// Update order status
export const updateOrderStatus = async (id: string, status: OrderStatus): Promise<Order> => {
  const { data, error } = await supabase
    .from('orders')
    .update({ status })
    .eq('id', id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating order status:', error);
    throw new Error('Failed to update order status');
  }
  
  // Convert to Order type
  const order: Order = {
    id: data.id,
    user_id: data.user_id,
    items: data.items,
    shippingAddress: data.shipping_address,
    paymentMethod: data.payment_method,
    taxPrice: data.tax_price,
    shippingPrice: data.shipping_price,
    totalPrice: data.total_price,
    isPaid: data.is_paid,
    paidAt: data.paid_at,
    isDelivered: data.is_delivered,
    deliveredAt: data.delivered_at,
    status: data.status as OrderStatus,
    createdAt: data.created_at,
    updatedAt: data.updated_at
  };
  
  return order;
};

// Get all orders for the current user
export const getOrders = async (): Promise<Order[]> => {
  const { data: session } = await supabase.auth.getSession();
  
  if (!session.session) {
    throw new Error('User not authenticated');
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .eq('user_id', session.session.user.id)
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching orders:', error);
    throw new Error('Failed to fetch orders');
  }
  
  // Convert to Order[] type
  const orders: Order[] = data.map(order => ({
    id: order.id,
    user_id: order.user_id,
    items: order.items,
    shippingAddress: order.shipping_address,
    paymentMethod: order.payment_method,
    taxPrice: order.tax_price,
    shippingPrice: order.shipping_price,
    totalPrice: order.total_price,
    isPaid: order.is_paid,
    paidAt: order.paid_at,
    isDelivered: order.is_delivered,
    deliveredAt: order.delivered_at,
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }));
  
  return orders;
};

// Get all orders (admin only)
export const getAllOrders = async (): Promise<Order[]> => {
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
    
  if (error) {
    console.error('Error fetching all orders:', error);
    throw new Error('Failed to fetch orders');
  }
  
  // Convert to Order[] type
  const orders: Order[] = data.map(order => ({
    id: order.id,
    user_id: order.user_id,
    items: order.items,
    shippingAddress: order.shipping_address,
    paymentMethod: order.payment_method,
    taxPrice: order.tax_price,
    shippingPrice: order.shipping_price,
    totalPrice: order.total_price,
    isPaid: order.is_paid,
    paidAt: order.paid_at,
    isDelivered: order.is_delivered,
    deliveredAt: order.delivered_at,
    status: order.status as OrderStatus,
    createdAt: order.created_at,
    updatedAt: order.updated_at
  }));
  
  return orders;
};
