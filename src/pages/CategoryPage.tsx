
import React from "react";
import { useParams } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Filter, SlidersHorizontal, ChevronDown } from "lucide-react";

// Sample product data - in a real app, this would come from an API
const productsByCategory: Record<string, any[]> = {
  monitors: [
    {
      id: 1,
      name: "Ultra Gaming Monitor 27\"",
      image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80",
      price: 699.99,
      rating: 4.7,
      category: "Monitor",
    },
    {
      id: 2,
      name: "ProDesign Monitor 32\" 4K",
      image: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?auto=format&fit=crop&q=80",
      price: 899.99,
      rating: 4.8,
      category: "Monitor",
    },
    {
      id: 3,
      name: "Curved Gaming Monitor 34\"",
      image: "https://images.unsplash.com/photo-1547119957-637f8679db1e?auto=format&fit=crop&q=80",
      price: 799.99,
      rating: 4.6,
      category: "Monitor",
    },
    {
      id: 4,
      name: "Budget Gaming Monitor 24\"",
      image: "https://images.unsplash.com/photo-1551645120-d70bcd9c547e?auto=format&fit=crop&q=80",
      price: 299.99,
      rating: 4.4,
      category: "Monitor",
    },
    {
      id: 5,
      name: "Ultra Wide Monitor 38\"",
      image: "https://images.unsplash.com/photo-1574375927938-d5a98e8ffe85?auto=format&fit=crop&q=80",
      price: 1199.99,
      rating: 4.9,
      category: "Monitor",
    },
    {
      id: 6,
      name: "Portable Monitor 15.6\"",
      image: "https://images.unsplash.com/photo-1544652478-6653e09f18a2?auto=format&fit=crop&q=80",
      price: 249.99,
      rating: 4.3,
      category: "Monitor",
    }
  ],
  components: [
    {
      id: 7,
      name: "RTX 4080 Super Gaming GPU",
      image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
      price: 1299.99,
      rating: 4.8,
      category: "GPU",
    },
    {
      id: 8,
      name: "AMD Ryzen 9 7950X CPU",
      image: "https://images.unsplash.com/photo-1600348712270-5da9de1f413b?auto=format&fit=crop&q=80",
      price: 599.99,
      rating: 4.9,
      category: "CPU",
    },
    {
      id: 9,
      name: "32GB DDR5 RGB RAM Kit",
      image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80",
      price: 249.99,
      rating: 4.7,
      category: "RAM",
    },
    {
      id: 10,
      name: "2TB NVMe SSD Gen4",
      image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&q=80",
      price: 329.99,
      rating: 4.8,
      category: "Storage",
    }
  ],
  "pc-building": [
    {
      id: 11,
      name: "Aurora Gaming Desktop",
      image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
      price: 2499.99,
      rating: 4.9,
      category: "Desktop PC",
    },
    {
      id: 12,
      name: "Custom Liquid Cooling Kit",
      image: "https://images.unsplash.com/photo-1587202372775-e229f172b9d7?auto=format&fit=crop&q=80",
      price: 349.99,
      rating: 4.7,
      category: "Cooling",
    },
    {
      id: 13,
      name: "PC Building Tool Kit",
      image: "https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?auto=format&fit=crop&q=80",
      price: 59.99,
      rating: 4.6,
      category: "Tools",
    }
  ],
  accessories: [
    {
      id: 14,
      name: "Mechanical RGB Keyboard",
      image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
      price: 199.99,
      rating: 4.6,
      category: "Peripherals",
    },
    {
      id: 15,
      name: "Wireless Gaming Mouse",
      image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80",
      price: 129.99,
      rating: 4.7,
      category: "Peripherals",
    },
    {
      id: 16,
      name: "RGB Mousepad XL",
      image: "https://images.unsplash.com/photo-1625462689963-98e50afee8e6?auto=format&fit=crop&q=80",
      price: 49.99,
      rating: 4.5,
      category: "Peripherals",
    }
  ]
};

const CategoryPage = () => {
  const { categoryId } = useParams<{ categoryId: string }>();
  const products = categoryId ? productsByCategory[categoryId] || [] : [];
  
  // Format category name for display
  const formatCategoryName = (name: string) => {
    if (!name) return '';
    return name
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        {/* Page header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold">{formatCategoryName(categoryId || '')}</h1>
          <p className="text-muted-foreground mt-2">
            Browse our selection of high-quality {formatCategoryName(categoryId || '')} for your setup.
          </p>
        </div>

        {/* Filters and products grid */}
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters sidebar */}
          <div className="w-full lg:w-64 shrink-0">
            <div className="sticky top-24 bg-forest-800 rounded-lg p-5 shadow-md">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Filter size={18} className="mr-2 text-emerald-400" />
                  <h3 className="font-medium">Filters</h3>
                </div>
                <Button variant="ghost" size="sm" className="text-xs text-emerald-400 hover:text-emerald-300">
                  Reset
                </Button>
              </div>

              {/* Price Range */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Price Range</h4>
                  <ChevronDown size={16} />
                </div>
                <div className="flex gap-2 items-center">
                  <input 
                    type="text" 
                    placeholder="Min" 
                    className="flex-1 h-9 rounded border border-forest-700 bg-forest-900 px-3 text-sm" 
                  />
                  <span>-</span>
                  <input 
                    type="text" 
                    placeholder="Max" 
                    className="flex-1 h-9 rounded border border-forest-700 bg-forest-900 px-3 text-sm" 
                  />
                </div>
              </div>

              {/* Brand */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="text-sm font-medium">Brand</h4>
                  <ChevronDown size={16} />
                </div>
                <div className="space-y-2">
                  {['ASUS', 'MSI', 'Gigabyte', 'Dell', 'LG', 'Samsung'].map(brand => (
                    <div key={brand} className="flex items-center">
                      <input type="checkbox" id={brand} className="mr-2 h-4 w-4 rounded border-forest-700 bg-forest-900 text-emerald-500" />
                      <label htmlFor={brand} className="text-sm">{brand}</label>
                    </div>
                  ))}
                </div>
              </div>

              {/* Display Size (for monitors) */}
              {categoryId === 'monitors' && (
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium">Display Size</h4>
                    <ChevronDown size={16} />
                  </div>
                  <div className="space-y-2">
                    {['24"', '27"', '32"', '34" Ultrawide', '38" Ultrawide', '49" Super Ultrawide'].map(size => (
                      <div key={size} className="flex items-center">
                        <input type="checkbox" id={size} className="mr-2 h-4 w-4 rounded border-forest-700 bg-forest-900 text-emerald-500" />
                        <label htmlFor={size} className="text-sm">{size}</label>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Apply button */}
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500 text-white">
                Apply Filters
              </Button>
            </div>
          </div>

          {/* Products grid */}
          <div className="flex-1">
            {/* Sort and layout controls */}
            <div className="flex flex-col sm:flex-row justify-between gap-4 mb-6 bg-forest-800 p-4 rounded-lg">
              <div className="flex items-center gap-2">
                <SlidersHorizontal size={18} />
                <span className="text-sm">Sort by:</span>
                <select className="bg-forest-900 border border-forest-700 rounded px-2 py-1 text-sm">
                  <option>Popularity</option>
                  <option>Price: Low to High</option>
                  <option>Price: High to Low</option>
                  <option>Newest First</option>
                  <option>Rating</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                Showing {products.length} products
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
                <p className="text-muted-foreground">
                  Try adjusting your filters or search terms.
                </p>
              </div>
            )}

            {/* Pagination */}
            {products.length > 0 && (
              <div className="mt-12 flex justify-center">
                <div className="flex">
                  <Button variant="outline" size="sm" className="rounded-r-none">
                    Previous
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-none bg-forest-700">
                    1
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-none">
                    2
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-none">
                    3
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-l-none">
                    Next
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default CategoryPage;
