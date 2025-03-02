
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
import { authService } from "@/services/authService";
import { orderService, Order } from "@/services/orderService";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

const Profile = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
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
  
  // Get user profile
  const user = authService.getCurrentUser();
  
  // Fetch user orders
  const { 
    data: orders = [], 
    isLoading: ordersLoading
  } = useQuery({
    queryKey: ['orders'],
    queryFn: orderService.getMyOrders,
    enabled: !!user
  });
  
  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: authService.updateProfile,
    onSuccess: () => {
      setEditMode(false);
      toast({
        title: "Profile Updated",
        description: "Your profile information has been updated successfully."
      });
    }
  });
  
  // Change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: (passwordData: { currentPassword: string, newPassword: string }) => 
      authService.changePassword(passwordData),
    onSuccess: () => {
      setShowPasswordDialog(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: ""
      });
      toast({
        title: "Password Updated",
        description: "Your password has been changed successfully."
      });
    }
  });
  
  // Add address mutation
  const addAddressMutation = useMutation({
    mutationFn: authService.addAddress,
    onSuccess: () => {
      setShowAddressDialog(false);
      setAddressData({
        street: "",
        city: "",
        state: "",
        postalCode: "",
        country: ""
      });
      toast({
        title: "Address Added",
        description: "Your new address has been added successfully."
      });
      queryClient.invalidateQueries({ queryKey: ['user'] });
    }
  });
  
  useEffect(() => {
    // Check if user is logged in
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please sign in to view your profile",
        variant: "destructive"
      });
      navigate("/signin");
      return;
    }
    
    // Set profile data
    setEditProfileData({
      name: user.name || "",
      email: user.email || ""
    });
  }, [user, navigate]);

  const handleEditProfile = () => {
    setEditMode(true);
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate({
      name: editProfileData.name,
      email: editProfileData.email
    });
  };

  const handleCancelEdit = () => {
    // Reset form data
    if (user) {
      setEditProfileData({
        name: user.name,
        email: user.email
      });
    }
    
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
    
    changePasswordMutation.mutate({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
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
    
    addAddressMutation.mutate(addressData);
  };

  const handleAddressInputChange = (e) => {
    const { name, value } = e.target;
    setAddressData({
      ...addressData,
      [name]: value
    });
  };

  if (!user) {
    return null; // Will redirect in useEffect
  }

  // Format orders for display
  const formattedOrders = orders.map((order: Order) => ({
    id: order._id,
    date: new Date(order.createdAt).toLocaleDateString(),
    status: order.status,
    total: `$${order.totalPrice.toFixed(2)}`
  }));

  return (
    <Layout>
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile Info Card */}
          <Card className="col-span-1">
            <CardHeader className="flex flex-row items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarImage src={user.avatarUrl || undefined} alt={user.name} />
                <AvatarFallback className="text-xl bg-emerald-600">{user.name.charAt(0)}</AvatarFallback>
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
                    <CardTitle>{user.name}</CardTitle>
                    <CardDescription>{user.email}</CardDescription>
                    {user.isAdmin && (
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
                  <p>{user.joinDate}</p>
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
                      disabled={updateProfileMutation.isPending}
                    >
                      {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
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
              {ordersLoading ? (
                <p className="text-center text-muted-foreground py-8">Loading orders...</p>
              ) : !showAllOrders ? (
                <>
                  {formattedOrders?.length > 0 ? (
                    <div className="space-y-4">
                      {formattedOrders.slice(0, 2).map((order) => (
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
                  {formattedOrders?.length > 0 ? (
                    <div className="space-y-4">
                      {formattedOrders.map((order) => (
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
              {user.addresses && user.addresses.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {user.addresses.map((address) => (
                    <div key={address._id} className="p-4 rounded-lg border border-emerald-100">
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
            <Button 
              variant="default" 
              onClick={handlePasswordChange}
              disabled={changePasswordMutation.isPending}
            >
              {changePasswordMutation.isPending ? "Changing..." : "Change Password"}
            </Button>
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
            <Button 
              variant="default" 
              onClick={handleAddAddress}
              disabled={addAddressMutation.isPending}
            >
              {addAddressMutation.isPending ? "Adding..." : "Add Address"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Layout>
  );
};

export default Profile;
