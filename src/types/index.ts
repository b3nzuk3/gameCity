
export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  image: string;
  category?: string;
  rating?: number;
  numReviews?: number;
  countInStock?: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  product_id: string;
  quantity: number;
  product?: Product;
}

export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  isAdmin?: boolean;
}

export type OrderStatus = "Processing" | "Shipped" | "Delivered" | "Cancelled";

export interface Order {
  id: string;
  user_id: string;
  items: CartItem[];
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
  isPaid: boolean;
  paidAt?: string;
  isDelivered: boolean;
  deliveredAt?: string;
  status: OrderStatus;
  createdAt: string;
  updatedAt: string;
}

export interface OrderCreate {
  items: CartItem[];
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
