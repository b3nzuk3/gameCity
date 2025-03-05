
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const OrdersTab: React.FC = () => {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Orders Management</CardTitle>
        </CardHeader>
        <CardContent>
          <p>This is where you would manage orders. Feature will be implemented soon.</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default OrdersTab;
