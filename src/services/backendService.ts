import { toast } from '@/hooks/use-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Type definitions
export type AuthResponse = {
  token: string
  user: User
}

export type Product = {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  brand?: string
  rating?: number
  num_reviews?: number
  count_in_stock?: number
  image: string
  images?: string[]
  reviews?: any[] // Define a proper review type if needed
}

export type UploadsResponse = {
  urls: string[]
}

export type User = {
  id: string
  name: string
  email: string
  isAdmin: boolean
}

export type Order = {
  id: string
  user: User
  order_items: any[] // Define a proper order item type
  shipping_address: any // Define a proper shipping address type
  payment_method: string
  total_price: number
  is_paid: boolean
  paid_at?: string
  is_delivered: boolean
  delivered_at?: string
}

export type HealthStatus = {
  status: string
  database: string
  timestamp: string
}

// Reusable request handler
const handleRequest = async <T>(
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  endpoint: string,
  data?: any
): Promise<T> => {
  const token = localStorage.getItem('gamecity_token')
  const headers: HeadersInit = {}

  let body

  // We don't set Content-Type for FormData, browser does it.
  if (data instanceof FormData) {
    body = data
  } else if (data) {
    headers['Content-Type'] = 'application/json'
    body = JSON.stringify(data)
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers,
      body,
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.message || 'An unknown error occurred')
    }

    // Handle responses that don't have a body (like DELETE)
    if (
      response.status === 204 ||
      response.headers.get('Content-Length') === '0'
    ) {
      return null as T
    }

    return response.json()
  } catch (error: any) {
    console.error(`API Error on ${method} ${endpoint}:`, error)
    toast({
      title: 'API Error',
      description: error.message,
      variant: 'destructive',
    })
    throw error
  }
}

const backendService = {
  auth: {
    login: (email: string, password: string): Promise<AuthResponse> =>
      handleRequest<AuthResponse>('POST', '/auth/login', { email, password }),
    register: (
      name: string,
      email: string,
      password: string
    ): Promise<AuthResponse> =>
      handleRequest<AuthResponse>('POST', '/auth/register', {
        name,
        email,
        password,
      }),
    getCurrentUser: (): Promise<{ user: User }> =>
      handleRequest<{ user: User }>('GET', '/auth/me'),
    resetPassword: (email: string): Promise<void> =>
      handleRequest<void>('POST', '/auth/reset-password', { email }),
    logout: () => {
      localStorage.removeItem('gamecity_token')
    },
  },
  products: {
    getAll: (): Promise<{ products: Product[] }> =>
      handleRequest<{ products: Product[] }>('GET', '/products'),
    getBrands: (): Promise<string[]> =>
      handleRequest<string[]>('GET', '/products/brands'),
    getById: (id: string): Promise<Product> =>
      handleRequest<Product>('GET', `/products/${id}`),
    create: (productData: Omit<Product, 'id'>): Promise<Product> =>
      handleRequest<Product>('POST', '/products', productData),
    update: (
      id: string | undefined,
      productData: Partial<Product>
    ): Promise<Product> => {
      if (!id) throw new Error('Product ID is required for update')
      return handleRequest<Product>('PUT', `/products/${id}`, productData)
    },
    delete: (id: string): Promise<void> =>
      handleRequest<void>('DELETE', `/products/${id}`),
    createReview: (
      productId: string,
      reviewData: { rating: number; comment: string }
    ): Promise<Product> =>
      handleRequest<Product>(
        'POST',
        `/products/${productId}/reviews`,
        reviewData
      ),
    hasPurchased: (productId: string): Promise<{ hasPurchased: boolean }> =>
      handleRequest<{ hasPurchased: boolean }>(
        'GET',
        `/products/${productId}/has-purchased`
      ),
  },
  uploads: {
    upload: (formData: FormData): Promise<UploadsResponse> =>
      handleRequest<UploadsResponse>('POST', '/upload', formData),
  },
  users: {
    getAll: (): Promise<User[]> => handleRequest<User[]>('GET', '/users'),
    update: (id: string, userData: Partial<User>): Promise<User> =>
      handleRequest<User>('PUT', `/users/${id}`, userData),
    delete: (id: string): Promise<void> =>
      handleRequest<void>('DELETE', `/users/${id}`),
  },
  orders: {
    getAll: (): Promise<Order[]> => handleRequest<Order[]>('GET', '/orders'),
    create: (orderData: any): Promise<Order> =>
      handleRequest<Order>('POST', '/orders', orderData),
    updateStatus: (orderId: string, status: string): Promise<Order> =>
      handleRequest<Order>('PUT', `/orders/${orderId}/status`, { status }),
    delete: (orderId: string): Promise<void> =>
      handleRequest<void>('DELETE', `/orders/${orderId}`),
  },

  // Health check function
  checkHealth: (): Promise<HealthStatus> =>
    handleRequest<HealthStatus>('GET', '/health'),
}

export default backendService
