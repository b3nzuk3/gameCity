// Backend API service for communicating with Node.js Express server
const API_BASE_URL =
  import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000/api'

// Types
export interface Product {
  id: string
  name: string
  price: number
  image: string
  category?: string
  description?: string
  brand?: string
  rating?: number
  num_reviews?: number
  count_in_stock: number
}

export interface User {
  id: string
  name: string
  email: string
  isAdmin: boolean
  createdAt?: Date
}

export interface AuthResponse {
  user?: User
  token?: string
  message?: string
}

export interface Order {
  id: string
  user: User
  orderItems: {
    product: string
    name: string
    image: string
    price: number
    quantity: number
  }[]
  paymentMethod: string
  itemsPrice: number
  totalPrice: number
  status: 'pending' | 'completed'
  createdAt: Date
  updatedAt: Date
}

export interface HealthStatus {
  status: string
  database: string
  timestamp: string
}

export interface PaginatedProductsResponse {
  products: Product[]
  page: number
  pages: number
  total: number
  hasMore: boolean
}

// Helper function to get auth token
const getAuthToken = (): string | null => {
  return localStorage.getItem('gamecity_auth_token')
}

// Helper function to get auth headers
const getAuthHeaders = (): HeadersInit => {
  const token = getAuthToken()
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  }
}

// Helper function to handle API responses
const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    const error = await response.json()
    throw new Error(error.error || 'API request failed')
  }
  return response.json()
}

// Health check
export const checkHealth = async (): Promise<HealthStatus> => {
  try {
    const response = await fetch(`${API_BASE_URL}/health`)
    return await handleResponse<HealthStatus>(response)
  } catch (error) {
    console.error('Health check failed:', error)
    throw error
  }
}

// Authentication API
export const auth = {
  login: async (email: string, password: string): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      })

      const data = await handleResponse<AuthResponse>(response)

      // Store token in localStorage
      if (data.token) {
        localStorage.setItem('gamecity_auth_token', data.token)
      }

      return data
    } catch (error) {
      console.error('Login failed:', error)
      throw error
    }
  },

  register: async (
    name: string,
    email: string,
    password: string
  ): Promise<AuthResponse> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      })
      const data = await handleResponse<AuthResponse>(response)
      // Do NOT store token on register
      return data
    } catch (error) {
      console.error('Registration failed:', error)
      throw error
    }
  },

  getCurrentUser: async (): Promise<{ user: User }> => {
    try {
      const token = getAuthToken()
      if (!token) {
        throw new Error('No authentication token found')
      }

      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        headers: getAuthHeaders(),
      })

      return handleResponse<{ user: User }>(response)
    } catch (error) {
      console.error('Get current user failed:', error)
      localStorage.removeItem('gamecity_auth_token')
      throw error
    }
  },

  resetPassword: async (email: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })

      return await handleResponse(response)
    } catch (error) {
      console.error('Password reset failed:', error)
      throw error
    }
  },

  logout: () => {
    localStorage.removeItem('gamecity_auth_token')
  },
}

// Products API
export const products = {
  getAll: async (
    params: { category?: string; search?: string } = {}
  ): Promise<PaginatedProductsResponse> => {
    try {
      const url = new URL(`${API_BASE_URL}/products`)
      if (params.category) {
        url.searchParams.append('category', params.category)
      }
      if (params.search) {
        url.searchParams.append('search', params.search)
      }

      const response = await fetch(url.toString(), {
        headers: getAuthHeaders(),
      })

      return handleResponse<PaginatedProductsResponse>(response)
    } catch (error) {
      console.error('Get products failed:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<Product> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        headers: getAuthHeaders(),
      })

      return handleResponse<Product>(response)
    } catch (error) {
      console.error('Get product failed:', error)
      throw error
    }
  },

  create: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      })

      return await handleResponse<Product>(response)
    } catch (error) {
      console.error('Create product failed:', error)
      throw error
    }
  },

  update: async (
    id: string,
    productData: Partial<Product>
  ): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(productData),
      })

      return await handleResponse<{ message: string }>(response)
    } catch (error) {
      console.error('Update product failed:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/products/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      return await handleResponse<{ message: string }>(response)
    } catch (error) {
      console.error('Delete product failed:', error)
      throw error
    }
  },
}

// Users API
export const users = {
  getAll: async (): Promise<User[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users`, {
        headers: getAuthHeaders(),
      })

      return await handleResponse<User[]>(response)
    } catch (error) {
      console.error('Get users failed:', error)
      throw error
    }
  },

  getById: async (id: string): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        headers: getAuthHeaders(),
      })

      return await handleResponse<User>(response)
    } catch (error) {
      console.error('Get user failed:', error)
      throw error
    }
  },

  update: async (userId: string, data: Partial<User>): Promise<User> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/profile`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data),
      })

      return await handleResponse<User>(response)
    } catch (error) {
      console.error('Update user failed:', error)
      throw error
    }
  },

  updatePassword: async (
    id: string,
    currentPassword: string,
    newPassword: string
  ): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}/password`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ currentPassword, newPassword }),
      })

      return await handleResponse<{ message: string }>(response)
    } catch (error) {
      console.error('Update password failed:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })

      return await handleResponse<{ message: string }>(response)
    } catch (error) {
      console.error('Delete user failed:', error)
      throw error
    }
  },
}

// Upload API
export const upload = {
  uploadImage: async (
    file: File
  ): Promise<{ url: string; public_id: string }> => {
    try {
      const formData = new FormData()
      formData.append('image', file)

      const headers = getAuthHeaders()
      const response = await fetch(`${API_BASE_URL}/upload`, {
        method: 'POST',
        headers: {
          Authorization: headers['Authorization'] || '',
        },
        body: formData,
      })

      return handleResponse(response)
    } catch (error) {
      console.error('Upload failed:', error)
      throw error
    }
  },
}

// Orders API
export const orders = {
  getAll: async (): Promise<Order[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        headers: getAuthHeaders(),
      })
      return handleResponse<Order[]>(response)
    } catch (error) {
      console.error('Get orders failed:', error)
      throw error
    }
  },

  create: async (orderData: {
    orderItems: any[]
    paymentMethod: string
    itemsPrice: number
    totalPrice: number
  }): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(orderData),
      })
      return handleResponse<Order>(response)
    } catch (error) {
      console.error('Create order failed:', error)
      throw error
    }
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'completed'
  ): Promise<Order> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}/status`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({ status }),
      })
      return handleResponse<Order>(response)
    } catch (error) {
      console.error('Update order status failed:', error)
      throw error
    }
  },

  delete: async (id: string): Promise<{ message: string }> => {
    try {
      const response = await fetch(`${API_BASE_URL}/orders/${id}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      })
      return handleResponse<{ message: string }>(response)
    } catch (error) {
      console.error('Delete order failed:', error)
      throw error
    }
  },
}

// Export all services
export default {
  auth,
  products,
  users,
  upload,
  orders,
}
