
import React from "react";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";

// Sample product data
const featuredProducts = [
  {
    id: 1,
    name: "RTX 4080 Super Gaming GPU",
    image: "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&q=80",
    price: 1299.99,
    rating: 4.8,
    category: "GPU",
  },
  {
    id: 2,
    name: "Aurora Gaming Desktop",
    image: "https://images.unsplash.com/photo-1488590528505-98d2b5aba04b?auto=format&fit=crop&q=80",
    price: 2499.99,
    rating: 4.9,
    category: "Desktop PC",
  },
  {
    id: 3,
    name: "Ultra Gaming Monitor 27\"",
    image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?auto=format&fit=crop&q=80",
    price: 699.99,
    rating: 4.7,
    category: "Monitor",
  },
  {
    id: 4,
    name: "Mechanical RGB Keyboard",
    image: "https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&q=80",
    price: 199.99,
    rating: 4.6,
    category: "Peripherals",
  }
];

const FeaturedProducts = () => {
  return (
    <section className="py-20 px-4 md:px-6">
      <div className="container mx-auto">
        <div className="flex flex-col items-center mb-12">
          <span className="px-3 py-1 text-xs font-medium text-emerald-400 bg-emerald-900/50 rounded-full mb-3">
            Featured Collection
          </span>
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
            Top Trending Products
          </h2>
          <p className="text-muted-foreground text-center max-w-2xl">
            Discover our most popular components and pre-built systems, 
            backed by premium quality and cutting-edge performance.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Button
            variant="outline"
            className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
          >
            View All Products
          </Button>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
