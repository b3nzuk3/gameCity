
import React from "react";
import Layout from "@/components/Layout";

const Products = () => {
  return (
    <Layout>
      <div className="container mx-auto py-16 px-4">
        <h1 className="text-3xl font-bold mb-8">Products</h1>
        
        <div className="bg-forest-800 rounded-lg p-8 shadow-lg">
          <div className="text-center">
            <p className="text-muted-foreground mb-4">
              The products page is currently under development.
            </p>
            <div className="p-4 border border-emerald-800 rounded-md bg-emerald-900/30 inline-block">
              <p className="text-emerald-400">Coming Soon</p>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Products;
