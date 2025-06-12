import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Layout from '@/components/Layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useAuth } from '@/contexts/AuthContext'
import backendService from '@/services/backendService'
import { toast } from '@/hooks/use-toast'
import { User, Mail, Shield, Calendar } from 'lucide-react'

const Profile = () => {
  const navigate = useNavigate()
  const { user, isLoading, updateProfile } = useAuth()

  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false)
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
  })

  // Update profile data when user changes
  React.useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name,
        email: user.email,
      })
    }
  }, [user])

  // If user is not authenticated, redirect to signin
  React.useEffect(() => {
    if (!isLoading && !user) {
      navigate('/signin', { replace: true })
      return
    }
  }, [user, isLoading, navigate])

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsUpdatingProfile(true)

    try {
      await updateProfile({ name: profileData.name })
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      })
    } catch (error) {
      console.error('Profile update error:', error)
      toast({
        title: 'Update failed',
        description: 'Could not update profile',
        variant: 'destructive',
      })
    } finally {
      setIsUpdatingProfile(false)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    try {
      await backendService.resetPassword(user.email)
    } catch (error) {
      console.error('Password reset error:', error)
    }
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-8 mt-16">
          <div className="flex justify-center">
            <div className="text-muted-foreground">Loading profile...</div>
          </div>
        </div>
      </Layout>
    )
  }

  if (!user) {
    return null // Will redirect via useEffect
  }

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 mt-16">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">Profile Settings</h1>
            <p className="text-muted-foreground">
              Manage your account settings and preferences
            </p>
          </div>

          <Tabs defaultValue="profile" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-forest-800 border border-forest-700">
              <TabsTrigger
                value="profile"
                className="data-[state=active]:bg-forest-700 data-[state=active]:text-foreground"
              >
                <User size={16} className="mr-2" />
                Profile
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="data-[state=active]:bg-forest-700 data-[state=active]:text-foreground"
              >
                <Shield size={16} className="mr-2" />
                Security
              </TabsTrigger>
            </TabsList>

            <TabsContent value="profile" className="space-y-6">
              <Card className="bg-forest-800 border-forest-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <User size={20} className="mr-2" />
                    Personal Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleProfileUpdate} className="space-y-4">
                    <div>
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        type="text"
                        value={profileData.name}
                        onChange={(e) =>
                          setProfileData({
                            ...profileData,
                            name: e.target.value,
                          })
                        }
                        className="bg-forest-900 border-forest-600 mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={profileData.email}
                        disabled
                        className="bg-forest-900 border-forest-600 mt-1 opacity-50"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isUpdatingProfile}
                      className="bg-emerald-600 hover:bg-emerald-500"
                    >
                      {isUpdatingProfile ? 'Updating...' : 'Update Profile'}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="bg-forest-800 border-forest-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Calendar size={20} className="mr-2" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Mail size={16} className="mr-2 text-muted-foreground" />
                      <span className="text-sm">Email</span>
                    </div>
                    <span className="text-sm font-medium">{user.email}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Shield
                        size={16}
                        className="mr-2 text-muted-foreground"
                      />
                      <span className="text-sm">Role</span>
                    </div>
                    <span
                      className={`text-sm font-medium ${
                        user.isAdmin ? 'text-emerald-400' : 'text-gray-400'
                      }`}
                    >
                      {user.isAdmin ? 'Administrator' : 'Customer'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
              <Card className="bg-forest-800 border-forest-700">
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Shield size={20} className="mr-2" />
                    Password & Security
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-forest-700 rounded-lg">
                    <h3 className="font-semibold mb-2">Password Reset</h3>
                    <p className="text-sm text-muted-foreground mb-4">
                      Reset your password by clicking the button below.
                      Instructions will be sent to your email address.
                    </p>
                    <Button
                      onClick={handlePasswordReset}
                      variant="outline"
                      className="border-forest-600"
                    >
                      Send Password Reset Email
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Layout>
  )
}

export default Profile
