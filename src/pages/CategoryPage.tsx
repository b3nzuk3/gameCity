
import React, { useState, useEffect } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { X, SlidersHorizontal } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get("product");
  
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 4000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("featured");
  const [brands, setBrands] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  // Fetch products based on category
  const { data: products, isLoading, error } = useQuery({
    queryKey: ['products', categoryId],
    queryFn: async () => {
      let query = supabase.from('products').select('*');
      
      if (categoryId && categoryId !== "all") {
        query = query.eq('category', categoryId.replace(/-/g, '_'));
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    }
  });

  // Get unique brands
  useEffect(() => {
    if (products && products.length > 0) {
      const uniqueBrands = [...new Set(products.map(product => product.brand))].filter(Boolean);
      setBrands(uniqueBrands);
      applyFilters(products);
    }
  }, [products]);

  const applyFilters = (baseProducts = null) => {
    if (!baseProducts && !products) return;
    
    let filtered = baseProducts || [...products];
    
    // Apply price filter
    filtered = filtered.filter(
      product => product.price >= priceRange[0] && product.price <= priceRange[1]
    );
    
    // Apply brand filter
    if (selectedBrands.length > 0) {
      filtered = filtered.filter(product => selectedBrands.includes(product.brand));
    }
    
    // Apply sorting
    if (sortOrder === "price-asc") {
      filtered.sort((a, b) => a.price - b.price);
    } else if (sortOrder === "price-desc") {
      filtered.sort((a, b) => b.price - a.price);
    } else if (sortOrder === "rating") {
      filtered.sort((a, b) => b.rating - a.rating);
    }
    
    setFilteredProducts(filtered);
  };

  // When filter values change
  useEffect(() => {
    if (products) {
      applyFilters();
    }
  }, [priceRange, selectedBrands, sortOrder]);

  const handlePriceChange = (value) => {
    setPriceRange(value);
  };

  const handleBrandToggle = (brand) => {
    setSelectedBrands(prev => 
      prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand]
    );
  };

  const handleReset = () => {
    setPriceRange([0, 4000]);
    setSelectedBrands([]);
    setSortOrder("featured");
    
    if (products) {
      setFilteredProducts([...products]);
    }
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
  };

  // If viewing a specific product
  if (productId) {
    const { data: product, isLoading: productLoading } = useQuery({
      queryKey: ['product', productId],
      queryFn: async () => {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .eq('id', productId)
          .single();
        
        if (error) throw error;
        return data;
      },
      enabled: !!productId
    });
    
    if (productLoading) {
      return (
        <Layout>
          <div className="container mx-auto py-12 px-4 mt-16">
            <div className="flex items-center justify-center h-64">
              <p>Loading product details...</p>
            </div>
          </div>
        </Layout>
      );
    }
    
    if (!product) {
      return (
        <Layout>
          <div className="container mx-auto py-12 px-4 mt-16">
            <h1 className="text-2xl font-bold mb-4">Product Not Found</h1>
            <p>The product you're looking for does not exist.</p>
          </div>
        </Layout>
      );
    }
    
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="rounded-lg overflow-hidden border border-forest-700">
              <img 
                src={product.image} 
                alt={product.name} 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="space-y-6">
              <h1 className="text-3xl font-bold">{product.name}</h1>
              <div className="flex items-center">
                <div className="flex items-center space-x-1">
                  {[...Array(5)].map((_, i) => (
                    <svg 
                      key={i}
                      className={`w-5 h-5 ${i < Math.floor(product.rating) ? "text-yellow-500 fill-yellow-500" : "text-gray-300 fill-gray-300"}`}
                      xmlns="http://www.w3.org/2000/svg" 
                      viewBox="0 0 24 24"
                    >
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                </div>
                <span className="ml-2 text-sm text-gray-400">({product.rating})</span>
              </div>
              <div className="text-3xl font-bold text-emerald-400">${product.price?.toFixed(2)}</div>
              <div className="space-y-2">
                <p className="text-sm">Brand: <span className="text-emerald-400">{product.brand}</span></p>
                <p className="text-sm">Category: <span className="text-emerald-400">{product.category}</span></p>
                <p className="text-sm">Availability: 
                  <span className={product.count_in_stock > 0 ? "text-emerald-400" : "text-red-400"}>
                    {product.count_in_stock > 0 ? ` In Stock (${product.count_in_stock})` : " Out of Stock"}
                  </span>
                </p>
              </div>
              <div className="pt-4">
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                  disabled={product.count_in_stock <= 0}
                >
                  Add to Cart
                </Button>
              </div>
              <div className="pt-4 space-y-4">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">
                  {product.description}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  // Loading state
  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 mt-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold capitalize">
              {categoryId === "all" ? "All Products" : categoryId?.split('-').join(' ')}
            </h1>
          </div>
          <div className="flex items-center justify-center h-64">
            <p>Loading products...</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Error state
  if (error) {
    return (
      <Layout>
        <div className="container mx-auto py-12 px-4 mt-16">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold capitalize">
              {categoryId === "all" ? "All Products" : categoryId?.split('-').join(' ')}
            </h1>
          </div>
          <div className="bg-forest-800 p-8 rounded-lg text-center">
            <h2 className="text-xl font-semibold mb-2">Error loading products</h2>
            <p className="text-muted-foreground">{error.message}</p>
          </div>
        </div>
      </Layout>
    );
  }

  // Category display with products grid
  return (
    <Layout>
      <div className="container mx-auto py-12 px-4 mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold capitalize">
            {categoryId === "all" ? "All Products" : categoryId?.split('-').join(' ')}
          </h1>
          
          {/* Mobile filter toggle */}
          <Button 
            variant="outline" 
            size="sm" 
            className="md:hidden border-forest-700"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <SlidersHorizontal size={16} className="mr-2" />
            Filters
          </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Filter sidebar - desktop */}
          <div className="hidden md:block space-y-6 bg-forest-800 p-4 rounded-lg border border-forest-700 h-fit">
            <div className="flex justify-between items-center">
              <h3 className="font-medium">Filters</h3>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleReset}
                className="text-xs h-8 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-forest-700"
              >
                Reset All
              </Button>
            </div>
            
            <div className="border-t border-forest-700 pt-4">
              <h4 className="font-medium mb-4">Price Range</h4>
              <div className="px-2">
                <Slider
                  min={0}
                  max={4000}
                  step={50}
                  value={priceRange}
                  onValueChange={handlePriceChange}
                  className="my-6"
                />
                <div className="flex items-center justify-between mt-2">
                  <div className="w-24">
                    <Input
                      type="number"
                      value={priceRange[0]}
                      onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                      className="bg-forest-900 border-forest-700 h-8 px-2"
                    />
                  </div>
                  <span className="text-muted-foreground">-</span>
                  <div className="w-24">
                    <Input
                      type="number"
                      value={priceRange[1]}
                      onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                      className="bg-forest-900 border-forest-700 h-8 px-2"
                    />
                  </div>
                </div>
              </div>
            </div>
            
            {brands.length > 0 && (
              <div className="border-t border-forest-700 pt-4">
                <h4 className="font-medium mb-4">Brands</h4>
                <div className="space-y-2">
                  {brands.map(brand => (
                    <div key={brand} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`brand-${brand}`}
                        checked={selectedBrands.includes(brand)}
                        onChange={() => handleBrandToggle(brand)}
                        className="mr-2 rounded border-forest-700 bg-forest-900 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                      />
                      <label htmlFor={`brand-${brand}`} className="text-sm">
                        {brand}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          {/* Mobile filter sidebar */}
          {isFilterOpen && (
            <div className="md:hidden fixed inset-0 z-50 bg-black/80 flex justify-end">
              <div className="w-3/4 h-full bg-forest-800 overflow-auto p-4 animate-in slide-in-from-right">
                <div className="flex justify-between items-center mb-6">
                  <h3 className="font-medium">Filters</h3>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => setIsFilterOpen(false)}
                    className="text-muted-foreground"
                  >
                    <X size={18} />
                  </Button>
                </div>
                
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <h4 className="text-sm">Applied Filters</h4>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      onClick={handleReset}
                      className="text-xs h-8 px-2 text-emerald-400 hover:text-emerald-300"
                    >
                      Reset All
                    </Button>
                  </div>
                  
                  <Accordion type="single" collapsible className="space-y-4">
                    <AccordionItem value="price" className="border-b border-forest-700">
                      <AccordionTrigger className="text-sm py-2">Price Range</AccordionTrigger>
                      <AccordionContent>
                        <div className="px-2">
                          <Slider
                            min={0}
                            max={4000}
                            step={50}
                            value={priceRange}
                            onValueChange={handlePriceChange}
                            className="my-6"
                          />
                          <div className="flex items-center justify-between mt-2">
                            <div className="w-20">
                              <Input
                                type="number"
                                value={priceRange[0]}
                                onChange={(e) => handlePriceChange([parseInt(e.target.value), priceRange[1]])}
                                className="bg-forest-900 border-forest-700 h-8 px-2"
                              />
                            </div>
                            <span className="text-muted-foreground">-</span>
                            <div className="w-20">
                              <Input
                                type="number"
                                value={priceRange[1]}
                                onChange={(e) => handlePriceChange([priceRange[0], parseInt(e.target.value)])}
                                className="bg-forest-900 border-forest-700 h-8 px-2"
                              />
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    {brands.length > 0 && (
                      <AccordionItem value="brands" className="border-b border-forest-700">
                        <AccordionTrigger className="text-sm py-2">Brands</AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2">
                            {brands.map(brand => (
                              <div key={brand} className="flex items-center">
                                <input
                                  type="checkbox"
                                  id={`mobile-brand-${brand}`}
                                  checked={selectedBrands.includes(brand)}
                                  onChange={() => handleBrandToggle(brand)}
                                  className="mr-2 rounded border-forest-700 bg-forest-900 text-emerald-600 focus:ring-0 focus:ring-offset-0"
                                />
                                <label htmlFor={`mobile-brand-${brand}`} className="text-sm">
                                  {brand}
                                </label>
                              </div>
                            ))}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    )}
                  </Accordion>
                  
                  <div className="mt-auto pt-6">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-500 text-white"
                      onClick={() => {
                        applyFilters();
                        setIsFilterOpen(false);
                      }}
                    >
                      Apply Filters
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          {/* Products grid */}
          <div className="md:col-span-3 space-y-6">
            {/* Sort & filter controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 pb-4 border-b border-forest-700">
              <p className="text-sm text-muted-foreground">
                Showing <span className="font-medium text-foreground">{filteredProducts.length}</span> products
              </p>
              
              <div className="flex gap-2">
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger className="w-[180px] bg-forest-800 border-forest-700">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-forest-800 border-forest-700">
                    <SelectItem value="featured">Featured</SelectItem>
                    <SelectItem value="price-asc">Price: Low to High</SelectItem>
                    <SelectItem value="price-desc">Price: High to Low</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Products */}
            {filteredProducts.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground">Try adjusting your filters or search terms.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
