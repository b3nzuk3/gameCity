
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardTab from '@/components/admin/DashboardTab';
import ProductsTab from '@/components/admin/ProductsTab';
import OrdersTab from '@/components/admin/OrdersTab';
import UsersTab from '@/components/admin/UsersTab';
import SettingsTab from '@/components/admin/SettingsTab';

const Admin = () => {
  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    name: 'GreenBits Computer Store',
    email: 'support@greenbits.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD ($)'
  });

  // Sample data for dashboard
  const [revenue, setRevenue] = useState(24500);
  const [orders, setOrders] = useState(142);
  const [customers, setCustomers] = useState(89);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
      
      <Tabs defaultValue="dashboard" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
          <TabsTrigger value="products">Products</TabsTrigger>
          <TabsTrigger value="orders">Orders</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="settings">Settings</TabsTrigger>
        </TabsList>

        {/* Dashboard Tab */}
        <TabsContent value="dashboard">
          <DashboardTab revenue={revenue} orders={orders} customers={customers} />
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products">
          <ProductsTab />
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders">
          <OrdersTab />
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users">
          <UsersTab />
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings">
          <SettingsTab storeSettings={storeSettings} setStoreSettings={setStoreSettings} />
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
