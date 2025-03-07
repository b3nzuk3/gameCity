
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import ProductCard from "./ProductCard";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

const FeaturedProducts = () => {
  const { data: featuredProducts, isLoading, error } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('rating', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });

  if (isLoading) {
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
              Loading featured products...
            </p>
          </div>
        </div>
      </section>
    );
  }

  if (error) {
    console.error("Error loading featured products:", error);
    return (
      <section className="py-20 px-4 md:px-6">
        <div className="container mx-auto">
          <div className="flex flex-col items-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-4">
              Something went wrong
            </h2>
            <p className="text-muted-foreground text-center max-w-2xl">
              Unable to load featured products. Please try again later.
            </p>
          </div>
        </div>
      </section>
    );
  }

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
          {featuredProducts && featuredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        <div className="mt-12 text-center">
          <Link to="/category/components">
            <Button
              variant="outline"
              className="border-emerald-700 text-emerald-400 hover:bg-emerald-900/30"
            >
              View All Products
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProducts;
