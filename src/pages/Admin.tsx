
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import {
  Package,
  Users,
  ShoppingCart,
  Settings,
  PlusCircle,
  Edit,
  Trash2,
  Search,
  LayoutDashboard,
  LogOut
} from "lucide-react";
import { Input } from "@/components/ui/input";

// Sample product data
const demoProducts = [
  {
    id: 1,
    name: "Ultra Gaming Monitor 27\"",
    price: 699.99,
    category: "Monitor",
    stock: 15,
    status: "In Stock",
  },
  {
    id: 2,
    name: "RTX 4080 Super Gaming GPU",
    price: 1299.99,
    category: "GPU",
    stock: 8,
    status: "In Stock",
  },
  {
    id: 3,
    name: "Aurora Gaming Desktop",
    price: 2499.99,
    category: "Desktop PC",
    stock: 5,
    status: "In Stock",
  },
  {
    id: 4,
    name: "Mechanical RGB Keyboard",
    price: 199.99,
    category: "Peripherals",
    stock: 20,
    status: "In Stock",
  },
  {
    id: 5,
    name: "AMD Ryzen 9 7950X CPU",
    price: 599.99,
    category: "CPU",
    stock: 0,
    status: "Out of Stock",
  }
];

// Sample order data
const demoOrders = [
  {
    id: "ORD-001",
    customer: "John Doe",
    date: "2023-05-12",
    total: 1499.98,
    status: "Completed",
    items: 3,
  },
  {
    id: "ORD-002",
    customer: "Jane Smith",
    date: "2023-05-14",
    total: 2799.97,
    status: "Processing",
    items: 2,
  },
  {
    id: "ORD-003",
    customer: "Mike Johnson",
    date: "2023-05-15",
    total: 349.99,
    status: "Shipped",
    items: 1,
  },
  {
    id: "ORD-004",
    customer: "Sarah Williams",
    date: "2023-05-16",
    total: 1099.99,
    status: "Pending",
    items: 4,
  }
];

// Sample user data
const demoUsers = [
  {
    id: 1,
    name: "John Doe",
    email: "john@example.com",
    role: "Customer",
    orders: 5,
    joined: "2023-01-10",
  },
  {
    id: 2,
    name: "Jane Smith",
    email: "jane@example.com",
    role: "Customer",
    orders: 3,
    joined: "2023-02-15",
  },
  {
    id: 3,
    name: "Admin User",
    email: "admin@greenbits.com",
    role: "Administrator",
    orders: 0,
    joined: "2022-12-01",
  },
  {
    id: 4,
    name: "Mike Johnson",
    email: "mike@example.com",
    role: "Customer",
    orders: 2,
    joined: "2023-03-20",
  }
];

const Admin = () => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [products, setProducts] = useState(demoProducts);
  const [orders, setOrders] = useState(demoOrders);
  const [users, setUsers] = useState(demoUsers);
  const [productSearch, setProductSearch] = useState("");
  const [orderSearch, setOrderSearch] = useState("");
  const [userSearch, setUserSearch] = useState("");

  // Check authentication on mount
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      if (userData.isAdmin) {
        setIsAuthenticated(true);
      } else {
        navigate("/signin");
        toast({
          title: "Access Denied",
          description: "You don't have permission to access the admin area",
          variant: "destructive",
        });
      }
    } else {
      navigate("/signin");
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("user");
    navigate("/signin");
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    });
  };

  // Filter functions
  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.category.toLowerCase().includes(productSearch.toLowerCase())
  );

  const filteredOrders = orders.filter(order => 
    order.id.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.customer.toLowerCase().includes(orderSearch.toLowerCase()) ||
    order.status.toLowerCase().includes(orderSearch.toLowerCase())
  );

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.email.toLowerCase().includes(userSearch.toLowerCase()) ||
    user.role.toLowerCase().includes(userSearch.toLowerCase())
  );

  if (!isAuthenticated) {
    return null; // Don't render anything while checking auth
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your store, products, orders, and users</p>
          </div>
          <Button 
            onClick={handleLogout}
            variant="outline" 
            className="border-forest-700 text-muted-foreground hover:text-foreground"
          >
            <LogOut size={16} className="mr-2" />
            Logout
          </Button>
        </div>

        {/* Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                <Package className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Products</p>
                <h3 className="text-2xl font-bold">{products.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                <ShoppingCart className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Orders</p>
                <h3 className="text-2xl font-bold">{orders.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                <Users className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Total Users</p>
                <h3 className="text-2xl font-bold">{users.length}</h3>
              </div>
            </div>
          </div>
          
          <div className="bg-forest-800 rounded-lg p-6 border border-forest-700 shadow-sm">
            <div className="flex items-center">
              <div className="p-3 rounded-full bg-emerald-900/50 mr-4">
                <LayoutDashboard className="h-6 w-6 text-emerald-400" />
              </div>
              <div>
                <p className="text-muted-foreground text-sm">Revenue</p>
                <h3 className="text-2xl font-bold">$5,649.94</h3>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="products" className="w-full">
          <TabsList className="w-full bg-forest-800 border border-forest-700 rounded-lg p-1 mb-8">
            <TabsTrigger value="products" className="flex-1 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground">
              <Package size={16} className="mr-2" />
              Products
            </TabsTrigger>
            <TabsTrigger value="orders" className="flex-1 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground">
              <ShoppingCart size={16} className="mr-2" />
              Orders
            </TabsTrigger>
            <TabsTrigger value="users" className="flex-1 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground">
              <Users size={16} className="mr-2" />
              Users
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 data-[state=active]:bg-forest-700 data-[state=active]:text-foreground">
              <Settings size={16} className="mr-2" />
              Settings
            </TabsTrigger>
          </TabsList>

          {/* Products Tab */}
          <TabsContent value="products" className="space-y-6">
            <div className="flex flex-col md:flex-row justify-between gap-4">
              <div className="relative max-w-sm w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search products..."
                  className="pl-9 bg-forest-800 border-forest-700"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                />
              </div>
              <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                <PlusCircle size={16} className="mr-2" />
                Add New Product
              </Button>
            </div>

            <div className="bg-forest-800 rounded-lg border border-forest-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-forest-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Product</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Price</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Category</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Stock</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-700">
                    {filteredProducts.map((product) => (
                      <tr key={product.id} className="hover:bg-forest-700/30">
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{product.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{product.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">${product.price.toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{product.category}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{product.stock}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            product.status === "In Stock" 
                              ? "bg-emerald-900/30 text-emerald-400" 
                              : "bg-red-900/30 text-red-400"
                          }`}>
                            {product.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredProducts.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No products found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Orders Tab */}
          <TabsContent value="orders" className="space-y-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search orders..."
                className="pl-9 bg-forest-800 border-forest-700"
                value={orderSearch}
                onChange={(e) => setOrderSearch(e.target.value)}
              />
            </div>

            <div className="bg-forest-800 rounded-lg border border-forest-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-forest-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Order ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Customer</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Date</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Items</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Total</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Status</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-700">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-forest-700/30">
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{order.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{order.customer}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{order.date}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{order.items}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">${order.total.toFixed(2)}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            order.status === "Completed" ? "bg-emerald-900/30 text-emerald-400" : 
                            order.status === "Processing" ? "bg-blue-900/30 text-blue-400" :
                            order.status === "Shipped" ? "bg-purple-900/30 text-purple-400" :
                            "bg-yellow-900/30 text-yellow-400"
                          }`}>
                            {order.status}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <Button variant="ghost" size="sm" className="h-8">
                            View Details
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredOrders.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No orders found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="relative max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                className="pl-9 bg-forest-800 border-forest-700"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
              />
            </div>

            <div className="bg-forest-800 rounded-lg border border-forest-700 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-forest-700">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">ID</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Name</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Email</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Role</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Orders</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Joined</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-forest-700">
                    {filteredUsers.map((user) => (
                      <tr key={user.id} className="hover:bg-forest-700/30">
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.id}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm font-medium">{user.name}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.email}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">
                          <span className={`px-2 py-1 rounded-full text-xs ${
                            user.role === "Administrator" 
                              ? "bg-emerald-900/30 text-emerald-400" 
                              : "bg-blue-900/30 text-blue-400"
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.orders}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm">{user.joined}</td>
                        <td className="px-4 py-4 whitespace-nowrap text-sm text-right">
                          <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <Edit size={14} />
                            </Button>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20">
                              <Trash2 size={14} />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {filteredUsers.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">No users found</p>
                </div>
              )}
            </div>
          </TabsContent>

          {/* Settings Tab */}
          <TabsContent value="settings" className="space-y-6">
            <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
              <h3 className="text-lg font-medium mb-4">Store Settings</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label htmlFor="store-name" className="text-sm font-medium">Store Name</label>
                  <Input id="store-name" defaultValue="GreenBits" className="bg-forest-900 border-forest-700" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="store-email" className="text-sm font-medium">Store Email</label>
                  <Input id="store-email" defaultValue="support@greenbits.com" className="bg-forest-900 border-forest-700" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="store-phone" className="text-sm font-medium">Store Phone</label>
                  <Input id="store-phone" defaultValue="+1 (555) 123-4567" className="bg-forest-900 border-forest-700" />
                </div>
                <div className="space-y-2">
                  <label htmlFor="store-currency" className="text-sm font-medium">Currency</label>
                  <select id="store-currency" className="w-full h-10 px-3 rounded-md border border-forest-700 bg-forest-900">
                    <option>USD ($)</option>
                    <option>EUR (€)</option>
                    <option>GBP (£)</option>
                    <option>CAD (C$)</option>
                  </select>
                </div>
              </div>
              <div className="mt-6">
                <Button className="bg-emerald-600 hover:bg-emerald-500 text-white">
                  Save Settings
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Admin;
