
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProductsTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Product Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you would manage products. Feature will be implemented soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsTab;
