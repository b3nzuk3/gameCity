
import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

const Profile = () => {
  const [userProfile, setUserProfile] = useState({
    name: "",
    email: "",
    joinDate: "",
    avatarUrl: "",
    recentOrders: [],
    isAdmin: false
  });
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
    toast({
      title: "Edit Profile",
      description: "Profile editing functionality will be available soon"
    });
  };

  const handleChangePassword = () => {
    toast({
      title: "Change Password",
      description: "Password changing functionality will be available soon"
    });
  };

  const handleViewAllOrders = () => {
    toast({
      title: "Orders",
      description: "Full order history will be available soon"
    });
  };

  const handleAddAddress = () => {
    toast({
      title: "Add Address",
      description: "Address management will be available soon"
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
                <CardTitle>{userProfile.name}</CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
                {userProfile.isAdmin && (
                  <span className="inline-block mt-1 text-xs font-medium bg-emerald-100 text-emerald-800 rounded-full px-2 py-0.5">
                    Admin
                  </span>
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
                    onClick={handleChangePassword}
                  >
                    Change Password
                  </Button>
                </div>
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
                      onClick={handleViewAllOrders}
                    >
                      View All Orders
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">You have no recent orders</p>
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
              <div className="text-center py-8">
                <p className="text-muted-foreground mb-4">You don't have any saved addresses yet</p>
                <Button 
                  variant="link" 
                  className="text-emerald-600 hover:text-emerald-800"
                  onClick={handleAddAddress}
                >
                  Add New Address
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
