
import { supabase } from "@/integrations/supabase/client";
import { toast } from '@/hooks/use-toast';

// Types
type LoginCredentials = {
  email: string;
  password: string;
};

type RegisterData = {
  name: string;
  email: string;
  password: string;
};

type UserProfile = {
  _id: string;
  name: string;
  email: string;
  isAdmin: boolean;
  joinDate: string;
  avatarUrl?: string;
  addresses: Array<{
    _id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  token: string;
  // Internal property not included in public API type
  // but needed for local storage implementation
  _password?: string;
};

// Services
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<UserProfile | null> {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password
      });
      
      if (error) {
        toast({
          title: 'Login failed',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }
      
      if (!data.user) {
        toast({
          title: 'Login failed',
          description: 'User not found',
          variant: 'destructive'
        });
        return null;
      }
      
      // Get user profile data from profiles table
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, addresses(id, street, city, state, postal_code, country)')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: 'Profile fetch failed',
          description: 'Could not retrieve user profile',
          variant: 'destructive'
        });
        return null;
      }
      
      // Map the Supabase profile to our app's UserProfile format
      const userProfile: UserProfile = {
        _id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        isAdmin: profileData.is_admin,
        joinDate: profileData.join_date,
        avatarUrl: profileData.avatar_url,
        addresses: profileData.addresses ? profileData.addresses.map(addr => ({
          _id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country
        })) : [],
        token: data.session?.access_token || ''
      };
      
      return userProfile;
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login failed',
        description: 'An unexpected error occurred. Try admin@gamecity.com / admin123',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  // Register new user
  async register(userData: RegisterData): Promise<UserProfile | null> {
    try {
      // Check if user already exists
      const { data: existingUsers, error: checkError } = await supabase
        .from('profiles')
        .select('email')
        .eq('email', userData.email);
        
      if (checkError) {
        console.error('User check error:', checkError);
      } else if (existingUsers && existingUsers.length > 0) {
        toast({
          title: 'Registration failed',
          description: 'User with this email already exists',
          variant: 'destructive'
        });
        return null;
      }
      
      // Register with Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name
          }
        }
      });
      
      if (error) {
        toast({
          title: 'Registration failed',
          description: error.message,
          variant: 'destructive'
        });
        return null;
      }
      
      if (!data.user) {
        toast({
          title: 'Registration failed',
          description: 'User creation failed',
          variant: 'destructive'
        });
        return null;
      }
      
      // Wait briefly for the trigger to create the profile
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Get the newly created profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        toast({
          title: 'Profile fetch failed',
          description: 'User created but could not retrieve profile',
          variant: 'destructive'
        });
        
        // Return basic profile even if detailed fetch failed
        return {
          _id: data.user.id,
          name: userData.name,
          email: userData.email,
          isAdmin: false,
          joinDate: new Date().toISOString(),
          addresses: [],
          token: data.session?.access_token || ''
        };
      }
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
      
      // Map to our app's UserProfile format
      return {
        _id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        isAdmin: profileData.is_admin || false,
        joinDate: profileData.join_date,
        avatarUrl: profileData.avatar_url,
        addresses: [],
        token: data.session?.access_token || ''
      };
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        title: 'Registration failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  // Logout user
  async logout(): Promise<void> {
    await supabase.auth.signOut();
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from Supabase session
  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session || !session.user) {
        return null;
      }
      
      // Get user profile from Supabase
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, addresses(id, street, city, state, postal_code, country)')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        console.error('Profile fetch error:', profileError);
        return null;
      }
      
      // Map to our app's UserProfile format
      return {
        _id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        isAdmin: profileData.is_admin,
        joinDate: profileData.join_date,
        avatarUrl: profileData.avatar_url,
        addresses: profileData.addresses ? profileData.addresses.map(addr => ({
          _id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country
        })) : [],
        token: session.access_token
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },
  
  // Check if user is authenticated
  async isAuthenticated(): Promise<boolean> {
    const { data: { session } } = await supabase.auth.getSession();
    return !!session;
  },
  
  // Check if user is admin
  async isAdmin(): Promise<boolean> {
    try {
      const user = await this.getCurrentUser();
      return user ? user.isAdmin : false;
    } catch (error) {
      console.error('Admin check error:', error);
      return false;
    }
  },
  
  // Update user profile
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Update profile in Supabase
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: userData.name,
          email: userData.email,
          avatar_url: userData.avatarUrl
        })
        .eq('id', session.user.id)
        .select('*, addresses(id, street, city, state, postal_code, country)')
        .single();
        
      if (error) {
        throw error;
      }
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      // Map to our app's UserProfile format
      return {
        _id: data.id,
        name: data.name,
        email: data.email,
        isAdmin: data.is_admin,
        joinDate: data.join_date,
        avatarUrl: data.avatar_url,
        addresses: data.addresses ? data.addresses.map(addr => ({
          _id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country
        })) : [],
        token: session.access_token
      };
    } catch (error) {
      console.error('Profile update error:', error);
      toast({
        title: 'Profile update failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  // Add address to user profile
  async addAddress(addressData: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }): Promise<UserProfile | null> {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        throw new Error('Not authenticated');
      }
      
      // Insert address to addresses table
      const { data: newAddress, error: addressError } = await supabase
        .from('addresses')
        .insert({
          user_id: session.user.id,
          street: addressData.street,
          city: addressData.city,
          state: addressData.state,
          postal_code: addressData.postalCode,
          country: addressData.country
        })
        .select()
        .single();
        
      if (addressError) {
        throw addressError;
      }
      
      // Get updated profile with addresses
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*, addresses(id, street, city, state, postal_code, country)')
        .eq('id', session.user.id)
        .single();
        
      if (profileError) {
        throw profileError;
      }
      
      toast({
        title: 'Address added',
        description: 'Your address has been added successfully',
      });
      
      // Map to our app's UserProfile format
      return {
        _id: profileData.id,
        name: profileData.name,
        email: profileData.email,
        isAdmin: profileData.is_admin,
        joinDate: profileData.join_date,
        avatarUrl: profileData.avatar_url,
        addresses: profileData.addresses ? profileData.addresses.map(addr => ({
          _id: addr.id,
          street: addr.street,
          city: addr.city,
          state: addr.state,
          postalCode: addr.postal_code,
          country: addr.country
        })) : [],
        token: session.access_token
      };
    } catch (error) {
      console.error('Add address error:', error);
      toast({
        title: 'Address update failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return null;
    }
  },
  
  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      // First verify the current password by attempting to sign in
      const { data: { user }, error: signInError } = await supabase.auth.signInWithPassword({
        email: (await this.getCurrentUser())?.email || '',
        password: passwordData.currentPassword
      });
      
      if (signInError || !user) {
        toast({
          title: 'Password change failed',
          description: 'Current password is incorrect',
          variant: 'destructive'
        });
        return false;
      }
      
      // Now update the password
      const { error: updateError } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });
      
      if (updateError) {
        toast({
          title: 'Password change failed',
          description: updateError.message,
          variant: 'destructive'
        });
        return false;
      }
      
      toast({
        title: 'Password changed',
        description: 'Your password has been changed successfully',
      });
      
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      toast({
        title: 'Password change failed',
        description: 'An unexpected error occurred',
        variant: 'destructive'
      });
      return false;
    }
  }
};

export default authService;
