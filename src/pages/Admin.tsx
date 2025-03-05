
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

const Admin = () => {
  // Store settings state
  const [storeSettings, setStoreSettings] = useState({
    name: 'GreenBits Computer Store',
    email: 'support@greenbits.com',
    phone: '+1 (555) 123-4567',
    currency: 'USD ($)'
  });

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
          {/* Dashboard content would go here */}
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-6">
          {/* Products management content would go here */}
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-6">
          {/* Orders management content would go here */}
        </TabsContent>

        {/* Users Tab */}
        <TabsContent value="users" className="space-y-6">
          {/* Users management content would go here */}
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
