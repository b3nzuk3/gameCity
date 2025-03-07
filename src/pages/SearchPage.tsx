
import React, { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import Layout from "@/components/Layout";
import ProductCard from "@/components/ProductCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const SearchPage = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialQuery = searchParams.get('q') || '';
  
  const [query, setQuery] = useState(initialQuery);
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Initial search based on URL query parameter
  useEffect(() => {
    if (initialQuery) {
      performSearch(initialQuery);
    }
  }, [initialQuery]);

  const performSearch = async (searchQuery) => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .or(`name.ilike.%${searchQuery}%,category.ilike.%${searchQuery}%,brand.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
        .order('rating', { ascending: false });
      
      if (error) throw error;
      
      setSearchResults(data || []);
    } catch (err) {
      console.error("Search error:", err);
      setError(err.message);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    performSearch(query);
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
              disabled={isLoading}
            >
              <Search size={18} className="mr-2" />
              {isLoading ? 'Searching...' : 'Search'}
            </Button>
          </form>
        </div>

        {/* Search results */}
        <div>
          {query && (
            <p className="text-muted-foreground mb-6">
              Showing results for "{query}" ({searchResults.length} items)
            </p>
          )}

          {isLoading ? (
            <div className="text-center py-12">
              <p>Searching products...</p>
            </div>
          ) : error ? (
            <div className="text-center py-12 bg-forest-800/50 rounded-lg">
              <h3 className="text-lg font-medium mb-2">Error performing search</h3>
              <p className="text-muted-foreground">{error}</p>
            </div>
          ) : searchResults.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {searchResults.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            query && (
              <div className="text-center py-12 bg-forest-800/50 rounded-lg">
                <h3 className="text-lg font-medium mb-2">No products found</h3>
                <p className="text-muted-foreground mb-4">
                  We couldn't find any matches for "{query}"
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
