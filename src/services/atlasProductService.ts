import backendService, {
  type Product as BackendProduct,
} from '@/services/backendService'

// Re-export the Product type from backend service
export type Product = BackendProduct

// Product service using backend API
export const atlasProductService = {
  // Get all products
  getProducts: async (): Promise<Product[]> => {
    try {
      console.log('ProductService: Fetching products from backend...')
      const response = await backendService.products.getAll()
      console.log('ProductService: Raw products from backend:', response)

      // Handle both direct array responses and wrapped responses
      const products = Array.isArray(response)
        ? response
        : (response as { success: boolean; products: Product[] }).products || []

      console.log('ProductService: Available categories:', [
        ...new Set(products.map((p) => p.category)),
      ])
      return products
    } catch (error) {
      console.error('ProductService: Error fetching products:', error)
      throw error
    }
  },

  // Get single product by ID
  getProduct: async (id: string): Promise<Product> => {
    try {
      console.log('ProductService: Fetching product:', id)
      const product = await backendService.products.getById(id)
      console.log('ProductService: Loaded product:', product.name)
      return product
    } catch (error) {
      console.error('ProductService: Error fetching product:', error)
      throw error
    }
  },

  // Create new product (admin only)
  createProduct: async (productData: Omit<Product, 'id'>): Promise<Product> => {
    try {
      console.log('ProductService: Creating product:', productData.name)
      const product = await backendService.products.create(productData)
      console.log('ProductService: Created product:', product.id)
      return product
    } catch (error) {
      console.error('ProductService: Error creating product:', error)
      throw error
    }
  },

  // Update product (admin only)
  updateProduct: async (
    id: string,
    productData: Partial<Product>
  ): Promise<void> => {
    try {
      console.log('ProductService: Updating product:', id)
      await backendService.products.update(id, productData)
      console.log('ProductService: Updated product:', id)
    } catch (error) {
      console.error('ProductService: Error updating product:', error)
      throw error
    }
  },

  // Delete product (admin only)
  deleteProduct: async (id: string): Promise<void> => {
    try {
      console.log('ProductService: Deleting product:', id)
      await backendService.products.delete(id)
      console.log('ProductService: Deleted product:', id)
    } catch (error) {
      console.error('ProductService: Error deleting product:', error)
      throw error
    }
  },

  // Search products (client-side filtering)
  searchProducts: async (query: string): Promise<Product[]> => {
    try {
      console.log('ProductService: Searching products for:', query)
      const allProducts = await atlasProductService.getProducts()

      if (!query.trim()) {
        return allProducts
      }

      const searchTerm = query.toLowerCase()
      const filteredProducts = allProducts.filter(
        (product) =>
          product.name.toLowerCase().includes(searchTerm) ||
          (product.description &&
            product.description.toLowerCase().includes(searchTerm)) ||
          (product.category &&
            product.category.toLowerCase().includes(searchTerm)) ||
          (product.brand && product.brand.toLowerCase().includes(searchTerm))
      )

      console.log('ProductService: Found products:', filteredProducts.length)
      return filteredProducts
    } catch (error) {
      console.error('ProductService: Error searching products:', error)
      throw error
    }
  },

  // Get products by category (client-side filtering)
  getProductsByCategory: async (category: string): Promise<Product[]> => {
    try {
      console.log('ProductService: Fetching products for category:', category)
      const allProducts = await atlasProductService.getProducts()

      if (!category || category === 'all') {
        return allProducts
      }

      const filteredProducts = allProducts.filter(
        (product) =>
          product.category &&
          product.category.toLowerCase() === category.toLowerCase()
      )

      console.log(
        'ProductService: Found products in category:',
        filteredProducts.length
      )
      return filteredProducts
    } catch (error) {
      console.error(
        'ProductService: Error fetching products by category:',
        error
      )
      throw error
    }
  },

  // Get featured products (first 4 products)
  getFeaturedProducts: async (): Promise<Product[]> => {
    try {
      console.log('ProductService: Fetching featured products...')
      const allProducts = await atlasProductService.getProducts()
      const featured = allProducts.slice(0, 4)
      console.log('ProductService: Loaded featured products:', featured.length)
      return featured
    } catch (error) {
      console.error('ProductService: Error fetching featured products:', error)
      throw error
    }
  },

  // Get unique categories
  getCategories: async (): Promise<string[]> => {
    try {
      console.log('ProductService: Fetching categories...')
      const allProducts = await atlasProductService.getProducts()
      const categories = [
        ...new Set(
          allProducts
            .map((product) => product.category)
            .filter((category) => category && category.trim() !== '')
        ),
      ] as string[]

      console.log('ProductService: Found categories:', categories)
      return categories
    } catch (error) {
      console.error('ProductService: Error fetching categories:', error)
      throw error
    }
  },
}

export default atlasProductService
