
import React, { useState, useEffect } from 'react';
import Layout from '@/components/Layout';
import { useUser } from '@/hooks/useUser';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { formatDate } from '@/lib/utils';
import * as orderService from '@/services/orderService';
import { Order } from '@/types';

const Profile = () => {
  const { user, updateProfile } = useUser();
  const { toast } = useToast();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.firstName || '');
      setLastName(user.lastName || '');
    }
  }, [user]);

  useEffect(() => {
    const fetchOrders = async () => {
      if (user) {
        setIsLoadingOrders(true);
        try {
          const userOrders = await orderService.getOrders();
          setOrders(userOrders);
        } catch (error) {
          console.error('Error fetching orders:', error);
          toast({
            title: 'Error',
            description: 'Failed to load orders',
            variant: 'destructive',
          });
        } finally {
          setIsLoadingOrders(false);
        }
      }
    };

    fetchOrders();
  }, [user, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsLoading(true);
    try {
      await updateProfile({
        firstName,
        lastName
      });
      
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.',
      });
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Error',
        description: 'Failed to update profile',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) {
    return (
      <Layout>
        <div className="container max-w-4xl px-4 py-8 mt-20">
          <Card>
            <CardHeader>
              <CardTitle>Profile</CardTitle>
              <CardDescription>You need to sign in to view your profile.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild>
                <a href="/signin">Sign In</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="container max-w-4xl px-4 py-8 mt-20">
        <h1 className="text-3xl font-bold mb-8">My Account</h1>
        
        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>View and update your personal information</CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="firstName" className="block mb-2 text-sm font-medium">
                        First Name
                      </label>
                      <Input 
                        id="firstName"
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label htmlFor="lastName" className="block mb-2 text-sm font-medium">
                        Last Name
                      </label>
                      <Input 
                        id="lastName"
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>
                  <div>
                    <label htmlFor="email" className="block mb-2 text-sm font-medium">
                      Email
                    </label>
                    <Input 
                      id="email"
                      value={user.email}
                      disabled
                      className="bg-forest-800"
                    />
                    <p className="mt-1 text-xs text-muted-foreground">Email cannot be changed</p>
                  </div>
                  <div className="pt-4">
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? 'Saving...' : 'Save Changes'}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
          
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order History</CardTitle>
                <CardDescription>View your previous orders</CardDescription>
              </CardHeader>
              <CardContent>
                {isLoadingOrders ? (
                  <div className="text-center py-8">Loading orders...</div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    You haven't placed any orders yet.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="border-b border-forest-700">
                        <tr>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Order ID</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Date</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Total</th>
                          <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground uppercase">Status</th>
                          <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground uppercase">Details</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-forest-700">
                        {orders.map((order) => (
                          <tr key={order.id} className="hover:bg-forest-700/20">
                            <td className="px-4 py-3 text-sm">{order.id.substring(0, 8)}...</td>
                            <td className="px-4 py-3 text-sm">{formatDate(order.createdAt)}</td>
                            <td className="px-4 py-3 text-sm">${order.totalPrice.toFixed(2)}</td>
                            <td className="px-4 py-3 text-sm">
                              <span 
                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                                  ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 
                                    order.status === 'Processing' ? 'bg-blue-100 text-blue-800' : 
                                    order.status === 'Shipped' ? 'bg-yellow-100 text-yellow-800' : 
                                    'bg-red-100 text-red-800'}`
                                }
                              >
                                {order.status}
                              </span>
                            </td>
                            <td className="px-4 py-3 text-sm text-right">
                              <Button asChild variant="ghost" size="sm">
                                <a href={`/order/${order.id}`}>View</a>
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </Layout>
  );
};

export default Profile;
