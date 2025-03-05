
import React, { useState } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, LineChart, PieChart } from "lucide-react";

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

  // Function to save settings
  const saveSettings = () => {
    // Here you would normally send this to your backend
    toast.success('Store settings saved successfully');
  };

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
        <TabsContent value="dashboard" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Total Revenue
                </CardTitle>
                <BarChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">${revenue.toLocaleString()}</div>
                <p className="text-xs text-muted-foreground">
                  +20.1% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Orders
                </CardTitle>
                <LineChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{orders}</div>
                <p className="text-xs text-muted-foreground">
                  +12.2% from last month
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  New Customers
                </CardTitle>
                <PieChart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{customers}</div>
                <p className="text-xs text-muted-foreground">
                  +8.4% from last month
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Product Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is where you would manage products. Feature will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Orders Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is where you would manage orders. Feature will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Management</CardTitle>
            </CardHeader>
            <CardContent>
              <p>This is where you would manage users. Feature will be implemented soon.</p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
            <h3 className="text-lg font-medium mb-4">Store Settings</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label htmlFor="store-name" className="text-sm font-medium">Store Name</label>
                <Input 
                  id="store-name" 
                  value={storeSettings.name} 
                  onChange={(e) => setStoreSettings({...storeSettings, name: e.target.value})}
                  className="bg-forest-900 border-forest-700" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="store-email" className="text-sm font-medium">Store Email</label>
                <Input 
                  id="store-email" 
                  value={storeSettings.email}
                  onChange={(e) => setStoreSettings({...storeSettings, email: e.target.value})}
                  className="bg-forest-900 border-forest-700" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="store-phone" className="text-sm font-medium">Store Phone</label>
                <Input 
                  id="store-phone" 
                  value={storeSettings.phone}
                  onChange={(e) => setStoreSettings({...storeSettings, phone: e.target.value})}
                  className="bg-forest-900 border-forest-700" 
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="store-currency" className="text-sm font-medium">Currency</label>
                <Select 
                  value={storeSettings.currency}
                  onValueChange={(value) => setStoreSettings({...storeSettings, currency: value})}
                >
                  <SelectTrigger id="store-currency" className="w-full border-forest-700 bg-forest-900">
                    <SelectValue placeholder="Select currency" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD ($)">USD ($)</SelectItem>
                    <SelectItem value="EUR (€)">EUR (€)</SelectItem>
                    <SelectItem value="GBP (£)">GBP (£)</SelectItem>
                    <SelectItem value="CAD (C$)">CAD (C$)</SelectItem>
                    <SelectItem value="KES (KSh)">KES (KSh)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="mt-6">
              <Button 
                className="bg-emerald-600 hover:bg-emerald-500 text-white"
                onClick={saveSettings}
              >
                Save Settings
              </Button>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Admin;
