import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Layout from '@/components/Layout';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Product } from '@/types';

// Sample product data with string IDs
const sampleProducts: Product[] = [
  {
    id: "1",
    name: "RTX 4080 Super Gaming GPU",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
    price: 1299.99,
    rating: 4.8,
    category: "graphics-cards",
  },
  {
    id: "2",
    name: "Aurora Gaming Desktop",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
    price: 2499.99,
    rating: 4.9,
    category: "gaming-pcs",
  },
  {
    id: "3",
    name: "Ultra Gaming Monitor 27\"",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80",
    price: 699.99,
    rating: 4.7,
    category: "monitors",
  },
  {
    id: "4",
    name: "Mechanical RGB Keyboard",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    price: 199.99,
    rating: 4.6,
    category: "peripherals",
  }
];

const SearchPage = () => {
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Product[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const term = params.get('q') || '';
    setSearchTerm(term);

    if (term) {
      const results = sampleProducts.filter(product =>
        product.name.toLowerCase().includes(term.toLowerCase()) ||
        (product.description && product.description.toLowerCase().includes(term.toLowerCase())) ||
        (product.category && product.category.toLowerCase().includes(term.toLowerCase()))
      );
      setSearchResults(results);
    } else {
      setSearchResults([]);
    }
  }, [location.search]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Programmatically navigate to the search route
    window.location.href = `/search?q=${searchTerm}`;
  };

  return (
    <Layout>
      <div className="container max-w-5xl px-4 py-12 mt-20">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold">Search Results</h1>
          <form onSubmit={handleSubmit} className="flex items-center">
            <Input
              type="search"
              placeholder="Search products..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="mr-2"
            />
            <Button type="submit">Search</Button>
          </form>
        </div>

        {searchTerm && (
          <p className="text-muted-foreground mb-4">
            {searchResults.length > 0
              ? `Showing results for "${searchTerm}"`
              : `No results found for "${searchTerm}"`}
          </p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {searchResults.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {searchResults.length === 0 && searchTerm !== '' && (
          <div className="text-center mt-8">
            <p className="text-muted-foreground">
              Try adjusting your search or browse our popular categories below.
            </p>
            <div className="mt-4">
              <Button variant="outline">Browse Categories</Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SearchPage;
