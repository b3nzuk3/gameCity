import { toast } from '@/hooks/use-toast'
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
  UseQueryOptions,
} from '@tanstack/react-query'
import axios from 'axios'
import backendService from './backendService'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add a request interceptor to include the auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('gamecity_token')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Types
export type Product = {
  _id: string
  name: string
  image: string
  images?: string[]
  description: string
  brand: string
  category: string
  price: number
  countInStock: number
  rating: number
  numReviews: number
  reviews: {
    _id: string
    name: string
    rating: number
    comment: string
    createdAt: string
  }[]
}

export type ProductsResponse = {
  products: Product[]
  page: number
  pages: number
  count: number
}

// Mock data for local development
const MOCK_PRODUCTS: Product[] = [
  {
    _id: '1',
    name: 'Gaming Keyboard',
    image: '/placeholder.svg',
    images: [],
    description: 'Mechanical RGB gaming keyboard with Cherry MX switches',
    brand: 'Logitech',
    category: 'Accessories',
    price: 79.99,
    countInStock: 15,
    rating: 4.5,
    numReviews: 12,
    reviews: [],
  },
  {
    _id: '2',
    name: 'Gaming Mouse',
    image: '/placeholder.svg',
    images: [],
    description: 'High precision gaming mouse with adjustable DPI',
    brand: 'Razer',
    category: 'Accessories',
    price: 59.99,
    countInStock: 25,
    rating: 4.8,
    numReviews: 18,
    reviews: [],
  },
]

// API calls
const fetchProducts = async (
  keyword: string = '',
  pageNumber: number = 1,
  category: string = ''
) => {
  const { data } = await api.get<ProductsResponse>(
    `/products?keyword=${keyword}&pageNumber=${pageNumber}&category=${category}`
  )
  return data
}

const fetchProductById = async (id: string) => {
  const { data } = await api.get<Product>(`/products/${id}`)
  return data
}

const createProduct = async (productData: Partial<Product>) => {
  const { data } = await api.post<Product>('/products', productData)
  return data
}

const updateProduct = async ({
  id,
  productData,
}: {
  id: string
  productData: Partial<Product>
}) => {
  const { data } = await api.put<Product>(`/products/${id}`, productData)
  return data
}

const deleteProduct = async (id: string) => {
  const { data } = await api.delete<{ message: string }>(`/products/${id}`)
  return data
}

const createProductReview = async ({
  productId,
  reviewData,
}: {
  productId: string
  reviewData: { rating: number; comment: string }
}) => {
  const { data } = await api.post<{ message: string }>(
    `/products/${productId}/reviews`,
    reviewData
  )
  return data
}

const checkHasPurchased = async (productId: string) => {
  const { data } = await api.get<{ hasPurchased: boolean }>(
    `/products/${productId}/has-purchased`
  )
  return data
}

// React Query hooks
export const useProducts = (
  keyword: string = '',
  pageNumber: number = 1,
  category: string = ''
) => {
  return useQuery({
    queryKey: ['products', keyword, pageNumber, category],
    queryFn: () => fetchProducts(keyword, pageNumber, category),
    staleTime: 5 * 60 * 1000, // 5 minutes
    placeholderData: keepPreviousData,
  })
}

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: () => fetchProductById(id),
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}

export const useHasPurchased = (
  productId: string,
  options?: Omit<
    UseQueryOptions<{ hasPurchased: boolean }>,
    'queryKey' | 'queryFn'
  >
) => {
  return useQuery({
    queryKey: ['purchase-status', productId],
    queryFn: () => checkHasPurchased(productId),
    staleTime: 30 * 60 * 1000, // 30 minutes
    enabled: !!productId,
    ...options,
  })
}

export const useCreateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: createProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: 'Product created',
        description: 'Product has been created successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Create product failed',
        description:
          error.response?.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    },
  })
}

export const useUpdateProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: updateProduct,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      queryClient.invalidateQueries({ queryKey: ['product', data._id] })
      toast({
        title: 'Product updated',
        description: 'Product has been updated successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Update product failed',
        description:
          error.response?.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    },
  })
}

export const useDeleteProduct = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: deleteProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] })
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
      })
    },
    onError: (error: any) => {
      toast({
        title: 'Delete product failed',
        description:
          error.response?.data?.message || 'An unexpected error occurred',
        variant: 'destructive',
      })
    },
  })
}

export const useCreateProductReview = () => {
  return useMutation({
    mutationFn: createProductReview,
  })
}

export function useProductReviews(productId: string) {
  return useQuery({
    queryKey: ['productReviews', productId],
    queryFn: async () => {
      const product = await backendService.products.getById(productId)
      return product.reviews || []
    },
  })
}

// Services
export const productService = {
  // Get all products - now accepts parameters
  async getProducts(
    keyword: string = '',
    pageNumber: number = 1,
    category: string = ''
  ): Promise<ProductsResponse> {
    try {
      // Return mock data for now
      return {
        products: MOCK_PRODUCTS,
        page: 1,
        pages: 1,
        count: MOCK_PRODUCTS.length,
      }
    } catch (error) {
      console.error('Get products error:', error)
      throw error
    }
  },

  // Get product by ID - now accepts parameter
  async getProductById(id: string): Promise<Product> {
    try {
      // Find product in mock data
      const product = MOCK_PRODUCTS.find((p) => p._id === id)
      if (!product) {
        throw new Error('Product not found')
      }
      return product
    } catch (error) {
      console.error(`Get product error (ID: ${id}):`, error)
      throw error
    }
  },

  // Create product (admin) - now accepts parameter
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      // Create new product with mock data
      const newProduct: Product = {
        _id: 'prod_' + Date.now(),
        name: productData.name || 'New Product',
        image: productData.image || '/placeholder.svg',
        description: productData.description || 'Product description',
        brand: productData.brand || 'Brand',
        category: productData.category || 'Category',
        price: productData.price || 0,
        countInStock: productData.countInStock || 0,
        rating: 0,
        numReviews: 0,
        reviews: [],
      }

      toast({
        title: 'Product created',
        description: 'Product has been created successfully',
      })

      return newProduct
    } catch (error) {
      console.error('Create product error:', error)
      if (axios.isAxiosError(error) && error.response) {
        const message =
          error.response.data.message || 'Failed to create product'
        toast({
          title: 'Create product failed',
          description: message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Create product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  // Update product (admin) - now accepts parameters
  async updateProduct(
    id: string,
    productData: Partial<Product>
  ): Promise<Product> {
    try {
      // In a real app, this would update in a database
      // For demo, return merged product
      const updatedProduct: Product = {
        _id: id,
        name: productData.name || 'Updated Product',
        image: productData.image || '/placeholder.svg',
        description: productData.description || 'Updated description',
        brand: productData.brand || 'Brand',
        category: productData.category || 'Category',
        price: productData.price || 0,
        countInStock: productData.countInStock || 0,
        rating: productData.rating || 0,
        numReviews: productData.numReviews || 0,
        reviews: productData.reviews || [],
      }

      toast({
        title: 'Product updated',
        description: 'Product has been updated successfully',
      })

      return updatedProduct
    } catch (error) {
      console.error(`Update product error (ID: ${id}):`, error)
      if (axios.isAxiosError(error) && error.response) {
        const message =
          error.response.data.message || 'Failed to update product'
        toast({
          title: 'Update product failed',
          description: message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Update product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  // Delete product (admin) - now accepts parameter
  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      // In a real app, this would delete from a database
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
      })

      return { message: 'Product deleted successfully' }
    } catch (error) {
      console.error(`Delete product error (ID: ${id}):`, error)
      if (axios.isAxiosError(error) && error.response) {
        const message =
          error.response.data.message || 'Failed to delete product'
        toast({
          title: 'Delete product failed',
          description: message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Delete product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
      throw error
    }
  },

  // Create product review - now accepts parameters
  async createProductReview(
    productId: string,
    reviewData: { rating: number; comment: string }
  ): Promise<{ message: string }> {
    try {
      // In a real app, this would save to a database
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review',
      })

      return { message: 'Review added successfully' }
    } catch (error) {
      console.error(`Create review error (Product ID: ${productId}):`, error)
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to submit review'
        toast({
          title: 'Review submission failed',
          description: message,
          variant: 'destructive',
        })
      } else {
        toast({
          title: 'Review submission failed',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        })
      }
      throw error
    }
  },
}

export default productService
