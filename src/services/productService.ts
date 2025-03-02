
import api from './api';
import { toast } from '@/hooks/use-toast';

// Types
export type Product = {
  _id: string;
  name: string;
  image: string;
  description: string;
  brand: string;
  category: string;
  price: number;
  countInStock: number;
  rating: number;
  numReviews: number;
};

export type ProductsResponse = {
  products: Product[];
  page: number;
  pages: number;
  count: number;
};

// Services
export const productService = {
  // Get all products
  async getProducts(
    keyword: string = '',
    pageNumber: number = 1,
    category: string = ''
  ): Promise<ProductsResponse> {
    try {
      let url = `/products?pageNumber=${pageNumber}`;
      
      if (keyword) {
        url += `&keyword=${keyword}`;
      }
      
      if (category) {
        url += `&category=${category}`;
      }
      
      const { data } = await api.get(url);
      return data;
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },
  
  // Get product by ID
  async getProductById(id: string): Promise<Product> {
    try {
      const { data } = await api.get(`/products/${id}`);
      return data;
    } catch (error) {
      console.error(`Get product error (ID: ${id}):`, error);
      throw error;
    }
  },
  
  // Create product (admin)
  async createProduct(productData: Partial<Product>): Promise<Product> {
    try {
      const { data } = await api.post('/products', productData);
      toast({
        title: 'Product created',
        description: 'Product has been created successfully',
      });
      return data;
    } catch (error) {
      console.error('Create product error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to create product';
        toast({
          title: 'Create product failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Create product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Update product (admin)
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
    try {
      const { data } = await api.put(`/products/${id}`, productData);
      toast({
        title: 'Product updated',
        description: 'Product has been updated successfully',
      });
      return data;
    } catch (error) {
      console.error(`Update product error (ID: ${id}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to update product';
        toast({
          title: 'Update product failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Update product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Delete product (admin)
  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      const { data } = await api.delete(`/products/${id}`);
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
      });
      return data;
    } catch (error) {
      console.error(`Delete product error (ID: ${id}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to delete product';
        toast({
          title: 'Delete product failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Delete product failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  },
  
  // Create product review
  async createProductReview(
    productId: string,
    reviewData: { rating: number; comment: string }
  ): Promise<{ message: string }> {
    try {
      const { data } = await api.post(`/products/${productId}/reviews`, reviewData);
      toast({
        title: 'Review submitted',
        description: 'Thank you for your review',
      });
      return data;
    } catch (error) {
      console.error(`Create review error (Product ID: ${productId}):`, error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to submit review';
        toast({
          title: 'Review submission failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Review submission failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      throw error;
    }
  }
};

export default productService;
