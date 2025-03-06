
import React from "react";
import Layout from "@/components/Layout";
import { CheckCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const OrderSuccess = () => {
  return (
    <Layout>
      <div className="container mx-auto py-16 px-4 max-w-lg">
        <div className="bg-forest-800 rounded-lg p-8 shadow-lg text-center">
          <CheckCircle className="h-16 w-16 mx-auto text-emerald-400 mb-4" />
          <h1 className="text-3xl font-bold mb-4">Order Successful!</h1>
          
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your order has been received and is now being processed.
          </p>
          
          <div className="flex flex-col gap-4">
            <Link to="/profile">
              <Button className="w-full bg-emerald-600 hover:bg-emerald-500">
                View Your Orders
              </Button>
            </Link>
            
            <Link to="/">
              <Button variant="outline" className="w-full">
                Continue Shopping
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default OrderSuccess;
