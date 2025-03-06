
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  User,
  MapPin,
  Package,
  ShieldCheck,
  Lock,
  LogOut,
  Edit,
  Trash2,
  Plus,
  Calendar,
} from "lucide-react";
import { authService } from "@/services/authService";
import { orderService } from "@/services/orderService";
import { formatDate } from "@/lib/utils";

const Profile = () => {
  const [activeTab, setActiveTab] = useState("profile");
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState([]);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isAddingAddress, setIsAddingAddress] = useState(false);
  
  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: "",
    email: "",
  });
  
  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // Address form state
  const [addressForm, setAddressForm] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: "",
  });
  
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await authService.getCurrentUser();
        if (!userData) {
          navigate("/signin");
          return;
        }
        setUser(userData);
        setProfileForm({
          name: userData.name,
          email: userData.email,
        });
        setIsLoading(false);
        
        // Fetch user orders
        fetchUserOrders();
      } catch (error) {
        console.error("Error fetching user data:", error);
        setIsLoading(false);
      }
    };
    
    fetchUserData();
  }, [navigate]);
  
  const fetchUserOrders = async () => {
    try {
      const userOrders = await orderService.getUserOrders();
      setOrders(userOrders);
    } catch (error) {
      console.error("Error fetching orders:", error);
    }
  };
  
  const handleLogout = async () => {
    await authService.logout();
    navigate("/signin");
    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });
  };
  
  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!profileForm.name || !profileForm.email) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedUser = await authService.updateProfile({
        name: profileForm.name,
        email: profileForm.email,
        avatarUrl: user?.avatarUrl,
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        setIsEditingProfile(false);
        toast({
          title: "Profile updated",
          description: "Your profile has been updated successfully",
        });
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        title: "Update failed",
        description: "There was a problem updating your profile",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword || !passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast({
        title: "Error",
        description: "New passwords do not match",
        variant: "destructive",
      });
      return;
    }
    
    if (passwordForm.newPassword.length < 6) {
      toast({
        title: "Error",
        description: "Password must be at least 6 characters long",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const success = await authService.changePassword({
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });
      
      if (success) {
        setPasswordForm({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setIsChangingPassword(false);
        toast({
          title: "Password changed",
          description: "Your password has been changed successfully",
        });
      }
    } catch (error) {
      console.error("Error changing password:", error);
      toast({
        title: "Password change failed",
        description: "There was a problem changing your password",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleAddAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!addressForm.street || !addressForm.city || !addressForm.state || 
        !addressForm.postalCode || !addressForm.country) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      const updatedUser = await authService.addAddress({
        street: addressForm.street,
        city: addressForm.city,
        state: addressForm.state,
        postalCode: addressForm.postalCode,
        country: addressForm.country,
      });
      
      if (updatedUser) {
        setUser(updatedUser);
        setAddressForm({
          street: "",
          city: "",
          state: "",
          postalCode: "",
          country: "",
        });
        setIsAddingAddress(false);
        toast({
          title: "Address added",
          description: "Your address has been added successfully",
        });
      }
    } catch (error) {
      console.error("Error adding address:", error);
      toast({
        title: "Failed to add address",
        description: "There was a problem adding your address",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isLoading) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto px-4 py-16 mt-16">
          <div className="text-center">
            <p>Loading profile...</p>
          </div>
        </div>
      </Layout>
    );
  }
  
  if (!user) {
    return (
      <Layout>
        <div className="container max-w-6xl mx-auto px-4 py-16 mt-16">
          <div className="text-center">
            <h1 className="text-2xl font-bold mb-4">Session Expired</h1>
            <p className="mb-4">Your session has expired. Please log in again.</p>
            <Button asChild>
              <Link to="/signin">Sign In</Link>
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-6xl mx-auto px-4 py-16 mt-16">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Sidebar */}
          <div className="w-full md:w-1/4">
            <div className="bg-forest-800 rounded-lg border border-forest-700 p-6 sticky top-24">
              <div className="flex flex-col items-center text-center mb-6">
                <div className="w-20 h-20 rounded-full bg-forest-700 flex items-center justify-center mb-4">
                  {user.avatarUrl ? (
                    <img 
                      src={user.avatarUrl} 
                      alt={user.name} 
                      className="w-full h-full rounded-full object-cover" 
                    />
                  ) : (
                    <User size={32} className="text-muted-foreground" />
                  )}
                </div>
                <h2 className="text-xl font-semibold">{user.name}</h2>
                <p className="text-muted-foreground text-sm">{user.email}</p>
                {user.isAdmin && (
                  <div className="mt-2 px-2 py-1 rounded-full bg-emerald-900/30 text-emerald-400 text-xs font-medium">
                    Administrator
                  </div>
                )}
              </div>
              
              <div className="flex items-center text-sm text-muted-foreground mb-4">
                <Calendar size={14} className="mr-2" />
                Joined {new Date(user.joinDate).toLocaleDateString()}
              </div>
              
              <div className="space-y-1 text-sm">
                <button 
                  className={`w-full flex items-center p-2 rounded-md ${activeTab === 'profile' ? 'bg-forest-700 text-emerald-400' : 'hover:bg-forest-700/50'}`}
                  onClick={() => setActiveTab('profile')}
                >
                  <User size={16} className="mr-3" />
                  Profile
                </button>
                <button 
                  className={`w-full flex items-center p-2 rounded-md ${activeTab === 'addresses' ? 'bg-forest-700 text-emerald-400' : 'hover:bg-forest-700/50'}`}
                  onClick={() => setActiveTab('addresses')}
                >
                  <MapPin size={16} className="mr-3" />
                  Addresses
                </button>
                <button 
                  className={`w-full flex items-center p-2 rounded-md ${activeTab === 'orders' ? 'bg-forest-700 text-emerald-400' : 'hover:bg-forest-700/50'}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <Package size={16} className="mr-3" />
                  Orders
                </button>
                <button 
                  className={`w-full flex items-center p-2 rounded-md ${activeTab === 'security' ? 'bg-forest-700 text-emerald-400' : 'hover:bg-forest-700/50'}`}
                  onClick={() => setActiveTab('security')}
                >
                  <ShieldCheck size={16} className="mr-3" />
                  Security
                </button>
                
                <hr className="border-forest-700 my-3" />
                
                {user.isAdmin && (
                  <button 
                    className={`w-full flex items-center p-2 rounded-md hover:bg-forest-700/50`}
                    onClick={() => navigate('/admin')}
                  >
                    <ShieldCheck size={16} className="mr-3" />
                    Admin Dashboard
                  </button>
                )}
                
                <button 
                  className={`w-full flex items-center p-2 rounded-md text-red-400 hover:bg-red-900/20`}
                  onClick={handleLogout}
                >
                  <LogOut size={16} className="mr-3" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
          
          {/* Main content */}
          <div className="w-full md:w-3/4">
            {/* Profile Tab */}
            {activeTab === 'profile' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">My Profile</h1>
                  {!isEditingProfile && (
                    <Button 
                      variant="outline" 
                      className="border-forest-700" 
                      onClick={() => setIsEditingProfile(true)}
                    >
                      <Edit size={16} className="mr-2" />
                      Edit Profile
                    </Button>
                  )}
                </div>
                
                {isEditingProfile ? (
                  <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Edit Profile</h2>
                    <form onSubmit={handleProfileUpdate}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="name" className="block text-sm font-medium mb-1">
                            Name
                          </label>
                          <Input 
                            id="name"
                            value={profileForm.name} 
                            onChange={(e) => setProfileForm({...profileForm, name: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="email" className="block text-sm font-medium mb-1">
                            Email
                          </label>
                          <Input 
                            id="email"
                            type="email"
                            value={profileForm.email}
                            onChange={(e) => setProfileForm({...profileForm, email: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button 
                          type="submit" 
                          className="bg-emerald-600 hover:bg-emerald-500"
                          disabled={isLoading}
                        >
                          {isLoading ? "Saving..." : "Save Changes"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="border-forest-700"
                          onClick={() => {
                            setProfileForm({
                              name: user.name,
                              email: user.email,
                            });
                            setIsEditingProfile(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                    <div className="space-y-4">
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Name</h3>
                        <p>{user.name}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Email</h3>
                        <p>{user.email}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Account Type</h3>
                        <p>{user.isAdmin ? "Administrator" : "Customer"}</p>
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground">Member Since</h3>
                        <p>{new Date(user.joinDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Addresses Tab */}
            {activeTab === 'addresses' && (
              <div>
                <div className="flex justify-between items-center mb-6">
                  <h1 className="text-2xl font-bold">My Addresses</h1>
                  {!isAddingAddress && (
                    <Button 
                      variant="outline" 
                      className="border-forest-700" 
                      onClick={() => setIsAddingAddress(true)}
                    >
                      <Plus size={16} className="mr-2" />
                      Add New Address
                    </Button>
                  )}
                </div>
                
                {isAddingAddress ? (
                  <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                    <h2 className="text-lg font-semibold mb-4">Add New Address</h2>
                    <form onSubmit={handleAddAddress}>
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="street" className="block text-sm font-medium mb-1">
                            Street Address
                          </label>
                          <Input 
                            id="street"
                            value={addressForm.street} 
                            onChange={(e) => setAddressForm({...addressForm, street: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="city" className="block text-sm font-medium mb-1">
                              City
                            </label>
                            <Input 
                              id="city"
                              value={addressForm.city}
                              onChange={(e) => setAddressForm({...addressForm, city: e.target.value})}
                              className="bg-forest-900 border-forest-700"
                            />
                          </div>
                          <div>
                            <label htmlFor="state" className="block text-sm font-medium mb-1">
                              State/Province
                            </label>
                            <Input 
                              id="state"
                              value={addressForm.state}
                              onChange={(e) => setAddressForm({...addressForm, state: e.target.value})}
                              className="bg-forest-900 border-forest-700"
                            />
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label htmlFor="postalCode" className="block text-sm font-medium mb-1">
                              Postal Code
                            </label>
                            <Input 
                              id="postalCode"
                              value={addressForm.postalCode}
                              onChange={(e) => setAddressForm({...addressForm, postalCode: e.target.value})}
                              className="bg-forest-900 border-forest-700"
                            />
                          </div>
                          <div>
                            <label htmlFor="country" className="block text-sm font-medium mb-1">
                              Country
                            </label>
                            <Input 
                              id="country"
                              value={addressForm.country}
                              onChange={(e) => setAddressForm({...addressForm, country: e.target.value})}
                              className="bg-forest-900 border-forest-700"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button 
                          type="submit" 
                          className="bg-emerald-600 hover:bg-emerald-500"
                          disabled={isLoading}
                        >
                          {isLoading ? "Adding..." : "Add Address"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="border-forest-700"
                          onClick={() => {
                            setAddressForm({
                              street: "",
                              city: "",
                              state: "",
                              postalCode: "",
                              country: "",
                            });
                            setIsAddingAddress(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {user.addresses && user.addresses.length > 0 ? (
                      user.addresses.map((address: any) => (
                        <div key={address._id} className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                          <div className="flex justify-between items-start mb-4">
                            <div>
                              <p className="font-medium">{address.street}</p>
                              <p className="text-muted-foreground">
                                {address.city}, {address.state} {address.postalCode}
                              </p>
                              <p className="text-muted-foreground">{address.country}</p>
                            </div>
                            <div className="flex space-x-2">
                              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                                <Edit size={14} />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-900/20"
                              >
                                <Trash2 size={14} />
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="bg-forest-800 rounded-lg border border-forest-700 p-6 text-center">
                        <MapPin size={24} className="mx-auto mb-2 text-muted-foreground" />
                        <h3 className="text-lg font-medium">No addresses found</h3>
                        <p className="text-muted-foreground mb-4">
                          You haven't added any shipping addresses yet.
                        </p>
                        <Button 
                          onClick={() => setIsAddingAddress(true)}
                          className="bg-emerald-600 hover:bg-emerald-500"
                        >
                          <Plus size={16} className="mr-2" />
                          Add New Address
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
            
            {/* Orders Tab */}
            {activeTab === 'orders' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">My Orders</h1>
                
                {orders && orders.length > 0 ? (
                  <div className="space-y-6">
                    {orders.map((order: any) => (
                      <div key={order._id} className="bg-forest-800 rounded-lg border border-forest-700 overflow-hidden">
                        <div className="p-4 md:p-6 border-b border-forest-700">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2 mb-1">
                                <span className="text-xs bg-forest-700 px-2 py-1 rounded">
                                  Order #{order._id.substring(0, 8)}
                                </span>
                                <span className={`text-xs px-2 py-1 rounded ${
                                  order.status === 'Delivered' ? 'bg-emerald-900/30 text-emerald-400' : 
                                  order.status === 'Shipped' ? 'bg-blue-900/30 text-blue-400' :
                                  order.status === 'Cancelled' ? 'bg-red-900/30 text-red-400' :
                                  'bg-yellow-900/30 text-yellow-400'
                                }`}>
                                  {order.status}
                                </span>
                              </div>
                              <p className="text-sm text-muted-foreground">
                                Placed on {formatDate(order.createdAt)}
                              </p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">${order.totalPrice.toFixed(2)}</p>
                              <div className="flex justify-end gap-2 mt-2">
                                <Button 
                                  variant="outline" 
                                  size="sm" 
                                  className="h-8 border-forest-700"
                                  asChild
                                >
                                  <Link to={`/order/${order._id}`}>View Details</Link>
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="p-4 md:p-6">
                          <h3 className="font-medium mb-3">Items</h3>
                          <div className="space-y-3">
                            {order.orderItems.map((item: any) => (
                              <div key={item._id} className="flex items-center gap-3">
                                <div className="h-12 w-12 bg-forest-700 rounded flex-shrink-0 overflow-hidden">
                                  <img 
                                    src={item.image}
                                    alt={item.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                                <div className="flex-grow">
                                  <p className="font-medium">{item.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    ${item.price.toFixed(2)} x {item.qty}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="bg-forest-800 rounded-lg border border-forest-700 p-6 text-center">
                    <Package size={24} className="mx-auto mb-2 text-muted-foreground" />
                    <h3 className="text-lg font-medium">No orders found</h3>
                    <p className="text-muted-foreground mb-4">
                      You haven't placed any orders yet.
                    </p>
                    <Button 
                      asChild
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      <Link to="/">
                        Start Shopping
                      </Link>
                    </Button>
                  </div>
                )}
              </div>
            )}
            
            {/* Security Tab */}
            {activeTab === 'security' && (
              <div>
                <h1 className="text-2xl font-bold mb-6">Security</h1>
                
                <div className="bg-forest-800 rounded-lg border border-forest-700 p-6 mb-6">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h2 className="text-lg font-semibold">Password</h2>
                      <p className="text-sm text-muted-foreground">
                        Update your password to keep your account secure
                      </p>
                    </div>
                    {!isChangingPassword && (
                      <Button 
                        variant="outline" 
                        className="border-forest-700" 
                        onClick={() => setIsChangingPassword(true)}
                      >
                        <Lock size={16} className="mr-2" />
                        Change Password
                      </Button>
                    )}
                  </div>
                  
                  {isChangingPassword && (
                    <form onSubmit={handlePasswordChange} className="mt-6">
                      <div className="space-y-4">
                        <div>
                          <label htmlFor="currentPassword" className="block text-sm font-medium mb-1">
                            Current Password
                          </label>
                          <Input 
                            id="currentPassword"
                            type="password"
                            value={passwordForm.currentPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, currentPassword: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="newPassword" className="block text-sm font-medium mb-1">
                            New Password
                          </label>
                          <Input 
                            id="newPassword"
                            type="password"
                            value={passwordForm.newPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, newPassword: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                        <div>
                          <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
                            Confirm New Password
                          </label>
                          <Input 
                            id="confirmPassword"
                            type="password"
                            value={passwordForm.confirmPassword}
                            onChange={(e) => setPasswordForm({...passwordForm, confirmPassword: e.target.value})}
                            className="bg-forest-900 border-forest-700"
                          />
                        </div>
                      </div>
                      <div className="mt-6 flex gap-3">
                        <Button 
                          type="submit" 
                          className="bg-emerald-600 hover:bg-emerald-500"
                          disabled={isLoading}
                        >
                          {isLoading ? "Updating..." : "Update Password"}
                        </Button>
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="border-forest-700"
                          onClick={() => {
                            setPasswordForm({
                              currentPassword: "",
                              newPassword: "",
                              confirmPassword: "",
                            });
                            setIsChangingPassword(false);
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    </form>
                  )}
                </div>
                
                <div className="bg-forest-800 rounded-lg border border-forest-700 p-6">
                  <h2 className="text-lg font-semibold mb-2">Account Deletion</h2>
                  <p className="text-sm text-muted-foreground mb-4">
                    Permanently delete your account and all associated data
                  </p>
                  <Button 
                    variant="destructive" 
                    className="bg-red-900 hover:bg-red-800"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Account
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
