
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

// Sample product data
const allProducts = [
  // GPUs
  {
    id: 1,
    name: "RTX 4080 Super Gaming GPU",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
    rating: 4.8,
    category: "graphics-cards",
    brand: "NVIDIA",
    stock: 10,
  },
  {
    id: 2,
    name: "RTX 4070 Ti GPU",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1562408590-e32931084e23?auto=format&fit=crop&q=80",
    rating: 4.7,
    category: "graphics-cards",
    brand: "NVIDIA",
    stock: 15,
  },
  {
    id: 3,
    name: "AMD Radeon RX 7900 XTX",
    price: 1199.99,
    image: "https://images.unsplash.com/photo-1542736705-53f0131d1e98?auto=format&fit=crop&q=80",
    rating: 4.6,
    category: "graphics-cards",
    brand: "AMD",
    stock: 8,
  },
  // Monitors
  {
    id: 4,
    name: "Ultra Gaming Monitor 27\"",
    price: 699.99,
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80",
    rating: 4.7,
    category: "monitors",
    brand: "LG",
    stock: 20,
  },
  {
    id: 5,
    name: "Curved Ultrawide Monitor 34\"",
    price: 899.99,
    image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80",
    rating: 4.8,
    category: "monitors",
    brand: "Samsung",
    stock: 12,
  },
  {
    id: 6,
    name: "4K ProDisplay 32\"",
    price: 1299.99,
    image: "https://images.unsplash.com/photo-1600733885209-e8f7aee20187?auto=format&fit=crop&q=80",
    rating: 4.9,
    category: "monitors",
    brand: "Dell",
    stock: 5,
  },
  // PC Components
  {
    id: 7,
    name: "AMD Ryzen 9 7950X CPU",
    price: 599.99,
    image: "https://images.unsplash.com/photo-1620283085348-9894fe64aad4?auto=format&fit=crop&q=80",
    rating: 4.9,
    category: "components",
    brand: "AMD",
    stock: 15,
  },
  {
    id: 8,
    name: "Intel Core i9-13900K CPU",
    price: 649.99,
    image: "https://images.unsplash.com/photo-1561113500-8f4ad4f80a93?auto=format&fit=crop&q=80",
    rating: 4.8,
    category: "components",
    brand: "Intel",
    stock: 10,
  },
  {
    id: 9,
    name: "DDR5 RGB RAM 32GB",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80",
    rating: 4.7,
    category: "components",
    brand: "Corsair",
    stock: 25,
  },
  // Gaming PCs
  {
    id: 10,
    name: "Aurora Gaming Desktop",
    price: 2499.99,
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
    rating: 4.9,
    category: "gaming-pcs",
    brand: "Alienware",
    stock: 7,
  },
  {
    id: 11,
    name: "Pro Gaming PC RTX 4090",
    price: 3499.99,
    image: "https://images.unsplash.com/photo-1578598336057-0a34b74b82bc?auto=format&fit=crop&q=80",
    rating: 5.0,
    category: "gaming-pcs",
    brand: "GreenBits",
    stock: 3,
  },
  {
    id: 12,
    name: "Compact Gaming PC",
    price: 1899.99,
    image: "https://images.unsplash.com/photo-1587202372634-32705e3bf49c?auto=format&fit=crop&q=80",
    rating: 4.6,
    category: "gaming-pcs",
    brand: "NZXT",
    stock: 9,
  },
  // Peripherals
  {
    id: 13,
    name: "Mechanical RGB Keyboard",
    price: 199.99,
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    rating: 4.6,
    category: "peripherals",
    brand: "Razer",
    stock: 30,
  },
  {
    id: 14,
    name: "Wireless Gaming Mouse",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1588200618450-3a18f1eb7cd0?auto=format&fit=crop&q=80",
    rating: 4.7,
    category: "peripherals",
    brand: "Logitech",
    stock: 35,
  },
  {
    id: 15,
    name: "Premium Gaming Headset",
    price: 249.99,
    image: "https://images.unsplash.com/photo-1615558830379-a6d21a5ab273?auto=format&fit=crop&q=80",
    rating: 4.8,
    category: "peripherals",
    brand: "SteelSeries",
    stock: 20,
  },
];

const CategoryPage = () => {
  const { categoryId } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const productId = searchParams.get("product");
  
  const [products, setProducts] = useState([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([0, 4000]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const [sortOrder, setSortOrder] = useState("featured");

  const brands = [...new Set(allProducts.map(product => product.brand))];

  // Initialize products based on category
  useEffect(() => {
    let filtered = [...allProducts];
    
    if (categoryId && categoryId !== "all") {
      filtered = filtered.filter(
        product => product.category.toLowerCase() === categoryId.toLowerCase()
      );
    }
    
    applyFilters(filtered);
  }, [categoryId]);

  const applyFilters = (baseProducts = null) => {
    let filtered = baseProducts || [...allProducts];
    
    if (categoryId && categoryId !== "all" && !baseProducts) {
      filtered = filtered.filter(
        product => product.category.toLowerCase() === categoryId.toLowerCase()
      );
    }
    
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
    
    setProducts(filtered);
  };

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
    
    let filtered = [...allProducts];
    if (categoryId && categoryId !== "all") {
      filtered = filtered.filter(
        product => product.category.toLowerCase() === categoryId.toLowerCase()
      );
    }
    setProducts(filtered);
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    applyFilters();
  };

  useEffect(() => {
    applyFilters();
  }, [priceRange, selectedBrands, sortOrder]);

  // If viewing a specific product
  if (productId) {
    const product = allProducts.find(p => p.id === parseInt(productId));
    
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
              <div className="text-3xl font-bold text-emerald-400">${product.price.toFixed(2)}</div>
              <div className="space-y-2">
                <p className="text-sm">Brand: <span className="text-emerald-400">{product.brand}</span></p>
                <p className="text-sm">Category: <span className="text-emerald-400">{product.category}</span></p>
                <p className="text-sm">Availability: 
                  <span className={product.stock > 0 ? "text-emerald-400" : "text-red-400"}>
                    {product.stock > 0 ? ` In Stock (${product.stock})` : " Out of Stock"}
                  </span>
                </p>
              </div>
              <div className="pt-4">
                <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                  Add to Cart
                </Button>
              </div>
              <div className="pt-4 space-y-4">
                <h3 className="font-medium">Description</h3>
                <p className="text-muted-foreground">
                  Experience unparalleled performance with the {product.name}. 
                  Designed for enthusiasts and professionals who demand the best 
                  in technology, this product delivers exceptional quality and reliability.
                </p>
              </div>
            </div>
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
                Showing <span className="font-medium text-foreground">{products.length}</span> products
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
            {products.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map((product) => (
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
