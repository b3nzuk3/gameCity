
import api from './api';
import axios from 'axios';
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

// Mock data for local development
const MOCK_PRODUCTS: Product[] = [
  {
    _id: '1',
    name: 'Gaming Keyboard',
    image: '/placeholder.svg',
    description: 'Mechanical RGB gaming keyboard with Cherry MX switches',
    brand: 'Logitech',
    category: 'Accessories',
    price: 79.99,
    countInStock: 15,
    rating: 4.5,
    numReviews: 12
  },
  {
    _id: '2',
    name: 'Gaming Mouse',
    image: '/placeholder.svg',
    description: 'High precision gaming mouse with adjustable DPI',
    brand: 'Razer',
    category: 'Accessories',
    price: 59.99,
    countInStock: 25,
    rating: 4.8,
    numReviews: 18
  }
];

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
        count: MOCK_PRODUCTS.length
      };
    } catch (error) {
      console.error('Get products error:', error);
      throw error;
    }
  },
  
  // Get product by ID - now accepts parameter
  async getProductById(id: string): Promise<Product> {
    try {
      // Find product in mock data
      const product = MOCK_PRODUCTS.find(p => p._id === id);
      if (!product) {
        throw new Error('Product not found');
      }
      return product;
    } catch (error) {
      console.error(`Get product error (ID: ${id}):`, error);
      throw error;
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
        numReviews: 0
      };
      
      toast({
        title: 'Product created',
        description: 'Product has been created successfully',
      });
      
      return newProduct;
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
  
  // Update product (admin) - now accepts parameters
  async updateProduct(id: string, productData: Partial<Product>): Promise<Product> {
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
        numReviews: productData.numReviews || 0
      };
      
      toast({
        title: 'Product updated',
        description: 'Product has been updated successfully',
      });
      
      return updatedProduct;
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
  
  // Delete product (admin) - now accepts parameter
  async deleteProduct(id: string): Promise<{ message: string }> {
    try {
      // In a real app, this would delete from a database
      toast({
        title: 'Product deleted',
        description: 'Product has been deleted successfully',
      });
      
      return { message: 'Product deleted successfully' };
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
      });
      
      return { message: 'Review added successfully' };
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
