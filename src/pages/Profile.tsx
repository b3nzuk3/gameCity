
import React from "react";
import Layout from "@/components/Layout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";

const Profile = () => {
  // This would usually come from authentication context
  const userProfile = {
    name: "John Doe",
    email: "john.doe@example.com",
    joinDate: "January 2023",
    avatarUrl: "",
    recentOrders: [
      { id: "ORD-12345", date: "2023-05-15", status: "Delivered", total: "$599.99" },
      { id: "ORD-67890", date: "2023-04-02", status: "Processing", total: "$1299.99" },
    ],
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
                <AvatarFallback className="text-xl">{userProfile.name.charAt(0)}</AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>{userProfile.name}</CardTitle>
                <CardDescription>{userProfile.email}</CardDescription>
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
                  <a href="#" className="text-blue-600 hover:underline">Edit Profile</a>
                  <a href="#" className="text-blue-600 hover:underline">Change Password</a>
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
              {userProfile.recentOrders.length > 0 ? (
                <div className="space-y-4">
                  {userProfile.recentOrders.map((order) => (
                    <div key={order.id} className="flex justify-between items-center p-4 rounded-lg border">
                      <div>
                        <p className="font-medium">{order.id}</p>
                        <p className="text-sm text-muted-foreground">{order.date}</p>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          order.status === "Delivered" ? "text-green-600" : "text-amber-600"
                        }`}>
                          {order.status}
                        </p>
                        <p>{order.total}</p>
                      </div>
                    </div>
                  ))}
                  <div className="text-center mt-6">
                    <a href="#" className="text-blue-600 hover:underline">View All Orders</a>
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
                <a href="#" className="text-blue-600 hover:underline">Add New Address</a>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default Profile;
