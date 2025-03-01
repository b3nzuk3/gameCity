
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "@/hooks/use-toast";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogFooter, 
  DialogHeader, 
  DialogTitle,
  DialogTrigger
} from "@/components/ui/dialog";

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatarUrl: "",
    recentOrders: [],
    isAdmin: false
  });
  
  const [editMode, setEditMode] = useState(false);
  const [editProfileData, setEditProfileData] = useState({
    name: "",
    email: ""
  });
  
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
  });
  
  const [showAllOrders, setShowAllOrders] = useState(false);
  const [showAddressDialog, setShowAddressDialog] = useState(false);
  const [addressData, setAddressData] = useState({
    street: "",
    city: "",
    state: "",
    postalCode: "",
    country: ""
  });
  
  const [addresses, setAddresses] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Get user data from localStorage
    const userData = localStorage.getItem("user");
    
    if (userData) {
      const user = JSON.parse(userData);
      // Set profile data from user object
      setUserProfile({
        name: user.name || "User",
        email: user.email || "user@example.com",
        joinDate: user.joinDate || new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        avatarUrl: user.avatarUrl || "",
        recentOrders: user.orders || [
          { id: "ORD-12345", date: "2023-05-15", status: "Delivered", total: "$599.99" },
          { id: "ORD-67890", date: "2023-04-02", status: "Processing", total: "$1299.99" },
        ],
        isAdmin: user.isAdmin || false
      });
      
      setEditProfileData({
        name: user.name || "User",
        email: user.email || "user@example.com"
      });
      
      setAddresses(user.addresses || []);
    } else {
      // Redirect to sign in if no user is logged in
      toast({
        title: "Authentication required",
        description: "Please sign in to view your profile",
        variant: "destructive"
      });
      navigate("/signin");
    }
  }, [navigate]);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    // Get existing user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      
      // Update user data
      const updatedUser = {
        ...user,
        name: editProfileData.name,
        email: editProfileData.email
      };
      
      // Save updated user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update profile state
      setUserProfile({
        ...userProfile,
        name: editProfileData.name,
        email: editProfileData.email
      });
      
      // Exit edit mode
      setEditMode(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }
  };

  const handleCancelEdit = () => {
    // Reset form data
    setEditProfileData({
      name: userProfile.name,
      email: userProfile.email
    });
    
    // Exit edit mode
    setEditMode(false);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditProfileData({
      ...editProfileData,
      [name]: value
    });
  };

  const handlePasswordChange = () => {
    // Validate passwords
    if (!passwordData.currentPassword) {
      toast({
        title: "Error",
        description: "Please enter your current password",
        variant: "destructive"
      });
      return;
    }
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast({
        title: "Error",
        description: "New password and confirmation do not match",
        variant: "destructive"
      });
      return;
    }
    
    // In a real app, you would send this to an API
    // For now, we'll just show a success message
    
    // Reset form and close dialog
    setPasswordData({
      currentPassword: "",
      newPassword: "",
      confirmPassword: ""
    });
    
    setShowPasswordDialog(false);
    
    toast({
      title: "Password Updated",
      description: "Your password has been changed successfully."
    });
  };

  const handlePasswordInputChange = (e) => {
    const { name, value } = e.target;
    setPasswordData({
      ...passwordData,
      [name]: value
    });
  };

  const handleAddAddress = () => {
    // Validate address
    if (!addressData.street || !addressData.city || !addressData.postalCode) {
      toast({
        title: "Error",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }
    
    // Get existing user data
    const userData = localStorage.getItem("user");
    if (userData) {
      const user = JSON.parse(userData);
      
      // Add new address
      const newAddress = {
        id: Date.now().toString(),
        ...addressData
      };
      
      const userAddresses = user.addresses || [];
      const updatedAddresses = [...userAddresses, newAddress];
      
      // Update user data
      const updatedUser = {
        ...user,
        addresses: updatedAddresses
      };
      
      // Save updated user data
      localStorage.setItem("user", JSON.stringify(updatedUser));
      
      // Update addresses state
      setAddresses(updatedAddresses);
      
      // Reset form and close dialog
      setAddressData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      });
      
      setShowAddressDialog(false);
      
      toast({
        title: "Address Added",
        description: "Your new address has been added successfully."
      });
    }
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData({
      ...addressData,
      [name]: value
    });
  };

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={userProfile.avatarUrl} alt={userProfile.name} />
                <AvatarFallback className="text-xl bg-emerald-600">{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                {editMode ? (
                  <div className="space-y-2">
                    <Input 
                      name="name"
                      value={editProfileData.name}
                      onChange={handleInputChange}
                      className="font-semibold"
                    />
                    <Input 
                      name="email"
                      value={editProfileData.email}
                      onChange={handleInputChange}
                      className="text-sm text-muted-foreground"
                    />
                  </div>
                ) : (
                  <>
                    <CardTitle>{userProfile.name}</CardTitle>
                    <CardDescription>{userProfile.email}</CardDescription>
                    {userProfile.isAdmin && (
                      <span className="inline-block mt-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5">
                        Admin
                      </span>
                    )}
                  </>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground">Member since</p>
                  <p>{userProfile.joinDate}</p>
                </div>
                <Separator />
                {editMode ? (
                  <div className="flex justify-between">
                    <Button 
                      variant="outline" 
                      onClick={handleCancelEdit}
                    >
                      Cancel
                    </Button>
                    <Button 
                      variant="default" 
                      onClick={handleSaveProfile}
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <div className="flex justify-between">
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-emerald-600 hover:text-emerald-800"
                      onClick={handleEditProfile}
                    >
                      Edit Profile
                    </Button>
                    <Button 
                      variant="link" 
                      className="p-0 h-auto text-emerald-600 hover:text-emerald-800"
                      onClick={() => setShowPasswordDialog(true)}
                    >
                      Change Password
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Orders */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>Your recent purchases and their status</CardDescription>
            </CardHeader>
            <CardContent>
              {!showAllOrders ? (
                <>
                  {userProfile.recentOrders?.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.recentOrders.slice(0, 2).map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-4 rounded-lg border border-emerald-100">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              order.status === "Delivered" ? "text-emerald-600" : "text-amber-600"
                            }`}>
                              {order.status}
                            </p>
                            <p>{order.total}</p>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-6">
                        <Button 
                          variant="link" 
                          className="text-emerald-600 hover:text-emerald-800"
                          onClick={() => setShowAllOrders(true)}
                        >
                          View All Orders
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">You have no recent orders</p>
                  )}
                </>
              ) : (
                <>
                  {userProfile.recentOrders?.length > 0 ? (
                    <div className="space-y-4">
                      {userProfile.recentOrders.map((order) => (
                        <div key={order.id} className="flex justify-between items-center p-4 rounded-lg border border-emerald-100">
                          <div>
                            <p className="font-medium">{order.id}</p>
                            <p className="text-sm text-muted-foreground">{order.date}</p>
                          </div>
                          <div className="text-right">
                            <p className={`font-medium ${
                              order.status === "Delivered" ? "text-emerald-600" : "text-amber-600"
                            }`}>
                              {order.status}
                            </p>
                            <p>{order.total}</p>
                          </div>
                        </div>
                      ))}
                      <div className="text-center mt-6">
                        <Button 
                          variant="link" 
                          className="text-emerald-600 hover:text-emerald-800"
                          onClick={() => setShowAllOrders(false)}
                        >
                          Show Less
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-center text-muted-foreground py-8">You have no orders</p>
                  )}
                </>
              )}
            </CardContent>
          </Card>
          
          {/* Saved Addresses Card */}
          <Card className="col-span-1 md:col-span-3">
            <CardHeader>
              <CardTitle>Saved Addresses</CardTitle>
              <CardDescription>Manage your shipping and billing addresses</CardDescription>
            </CardHeader>
            <CardContent>
              {addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {addresses.map((address) => (
                    <div key={address.id} className="p-4 rounded-lg border border-emerald-100">
                      <div className="space-y-2">
                        <p className="font-medium">{address.street}</p>
                        <p className="text-sm">{address.city}, {address.state} {address.postalCode}</p>
                        <p className="text-sm">{address.country}</p>
                      </div>
                    </div>
                  ))}
                  <div className="p-4 rounded-lg border border-dashed border-emerald-200 flex items-center justify-center">
                    <Button 
                      variant="ghost" 
                      className="text-emerald-600 hover:text-emerald-800"
                      onClick={() => setShowAddressDialog(true)}
                    >
                      + Add New Address
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground mb-4">You don't have any saved addresses yet</p>
                  <Button 
                    variant="link" 
                    className="text-emerald-600 hover:text-emerald-800"
                    onClick={() => setShowAddressDialog(true)}
                  >
                    Add New Address
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Change Password Dialog */}
      <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Password</DialogTitle>
            <DialogDescription>
              Enter your current password and a new password.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="currentPassword" className="text-sm font-medium">Current Password</label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={passwordData.currentPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="newPassword" className="text-sm font-medium">New Password</label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={passwordData.newPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="text-sm font-medium">Confirm New Password</label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={passwordData.confirmPassword}
                onChange={handlePasswordInputChange}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowPasswordDialog(false)}>Cancel</Button>
            <Button variant="default" onClick={handlePasswordChange}>Change Password</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Add Address Dialog */}
      <Dialog open={showAddressDialog} onOpenChange={setShowAddressDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Address</DialogTitle>
            <DialogDescription>
              Enter your shipping or billing address details.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="street" className="text-sm font-medium">Street Address</label>
              <Input
                id="street"
                name="street"
                value={addressData.street}
                onChange={handleAddressInputChange}
                placeholder="123 Main St"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="city" className="text-sm font-medium">City</label>
                <Input
                  id="city"
                  name="city"
                  value={addressData.city}
                  onChange={handleAddressInputChange}
                  placeholder="New York"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="state" className="text-sm font-medium">State</label>
                <Input
                  id="state"
                  name="state"
                  value={addressData.state}
                  onChange={handleAddressInputChange}
                  placeholder="NY"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="postalCode" className="text-sm font-medium">Postal Code</label>
                <Input
                  id="postalCode"
                  name="postalCode"
                  value={addressData.postalCode}
                  onChange={handleAddressInputChange}
                  placeholder="10001"
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="country" className="text-sm font-medium">Country</label>
                <Input
                  id="country"
                  name="country"
                  value={addressData.country}
                  onChange={handleAddressInputChange}
                  placeholder="United States"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddressDialog(false)}>Cancel</Button>
            <Button variant="default" onClick={handleAddAddress}>Add Address</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
