
import React, { useState } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";

// Demo product data - in a real app, this would come from an API
const allProducts = [
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
    name: "RTX 4080 Super Gaming GPU",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
    price: 1299.99,
    rating: 4.8,
    category: "GPU",
  },
  {
    id: 3,
    name: "Aurora Gaming Desktop",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
    price: 2499.99,
    rating: 4.9,
    category: "Desktop PC",
  },
  {
    id: 4,
    name: "Mechanical RGB Keyboard",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    price: 199.99,
    rating: 4.6,
    category: "Peripherals",
  },
  {
    id: 5,
    name: "AMD Ryzen 9 7950X CPU",
    image: "https://images.unsplash.com/photo-1600348912370-4f593e4b6cc9?auto=format&fit=crop&q=80",
    price: 599.99,
    rating: 4.9,
    category: "CPU",
  },
  {
    id: 6,
    name: "32GB DDR5 RGB RAM Kit",
    image: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&q=80",
    price: 249.99,
    rating: 4.7,
    category: "RAM",
  },
  {
    id: 7,
    name: "2TB NVMe SSD Gen4",
    image: "https://images.unsplash.com/photo-1597074866923-dc0589150358?auto=format&fit=crop&q=80",
    price: 329.99,
    rating: 4.8,
    category: "Storage",
  },
  {
    id: 8,
    name: "Wireless Gaming Mouse",
    image: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&q=80",
    price: 129.99,
    rating: 4.7,
    category: "Peripherals",
  }
];

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState(() => {
    // Initial search results based on URL query parameter
    if (!initialQuery) return [];
    return allProducts.filter(product => 
      product.name.toLowerCase().includes(initialQuery.toLowerCase()) ||
      product.category.toLowerCase().includes(initialQuery.toLowerCase())
    );
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }
    
    // Simple search logic - in a real app, this would be more sophisticated
    const results = allProducts.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.category.toLowerCase().includes(query.toLowerCase())
    );
    
    setSearchResults(results);
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 mt-16">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-4">Search Products</h1>
          
          {/* Search form */}
          <form onSubmit={handleSearch} className="flex gap-2 max-w-2xl">
            <Input
              type="text"
              placeholder="Search for products, categories, brands..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="flex-1 bg-forest-800 border-forest-700"
            />
            <Button 
              type="submit" 
              className="bg-emerald-600 hover:bg-emerald-500 text-white"
            >
              <Search size={18} className="mr-2" />
              Search
            </Button>
          </form>
        </div>

        {/* Search results */}
        <div>
          {initialQuery && (
            <p className="text-muted-foreground mb-6">
              Showing results for "{initialQuery}" ({searchResults.length} items)
            </p>
          )}

          {searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            initialQuery && (
              <div className="text-center py-12 bg-forest-800/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any matches for "{initialQuery}"
                </p>
                <div className="max-w-md mx-auto">
                  <h4 className="font-medium text-sm mb-2">Try:</h4>
                  <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                    <li>Checking your spelling</li>
                    <li>Using more general terms</li>
                    <li>Browsing product categories</li>
                  </ul>
                </div>
              </div>
            )
          )}
        </div>
      </div>
    </Layout>
  );
};

export default SearchPage;
