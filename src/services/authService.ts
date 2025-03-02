import api from './api';
import axios from 'axios';
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
  avatarUrl?: string; // Added optional avatarUrl property
  addresses: Array<{
    _id: string;
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  }>;
  token: string;
};

// Mock admin user for development/testing when backend is unavailable
const MOCK_ADMIN_USER: UserProfile = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@greenbits.com',
  isAdmin: true,
  joinDate: new Date().toISOString(),
  addresses: [],
  token: 'mock-jwt-token'
};

// Services
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<UserProfile | null> {
    try {
      const { data } = await api.post('/users/login', credentials);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user info in localStorage (without sensitive data)
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
        joinDate: data.joinDate,
        addresses: data.addresses
      }));
      
      return data;
    } catch (error) {
      console.error('Login error:', error);
      
      // Special case for admin login when backend is unavailable
      if (credentials.email === 'admin@greenbits.com' && credentials.password === 'admin123') {
        console.log('Using mock admin login as fallback');
        
        // Store mock token and user data
        localStorage.setItem('token', MOCK_ADMIN_USER.token);
        localStorage.setItem('user', JSON.stringify(MOCK_ADMIN_USER));
        
        toast({
          title: 'Mock Admin Login',
          description: 'Logged in as admin in development mode (backend unavailable)',
        });
        
        return MOCK_ADMIN_USER;
      }
      
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Invalid email or password';
        toast({
          title: 'Login failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Login failed',
          description: 'Backend server unavailable. For testing, use admin@greenbits.com / admin123',
          variant: 'destructive'
        });
      }
      return null;
    }
  },
  
  // Register new user
  async register(userData: RegisterData): Promise<UserProfile | null> {
    try {
      const { data } = await api.post('/users', userData);
      
      // Store token in localStorage
      localStorage.setItem('token', data.token);
      
      // Store user info in localStorage (without sensitive data)
      localStorage.setItem('user', JSON.stringify({
        _id: data._id,
        name: data.name,
        email: data.email,
        isAdmin: data.isAdmin,
        joinDate: data.joinDate,
        addresses: data.addresses
      }));
      
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Registration failed';
        toast({
          title: 'Registration failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Registration failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      return null;
    }
  },
  
  // Logout user
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
  
  // Get current user from localStorage
  getCurrentUser(): UserProfile | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },
  
  // Check if user is authenticated
  isAuthenticated(): boolean {
    return !!localStorage.getItem('token');
  },
  
  // Check if user is admin
  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user ? user.isAdmin : false;
  },
  
  // Update user profile
  async updateProfile(userData: Partial<UserProfile>): Promise<UserProfile | null> {
    try {
      const { data } = await api.put('/users/profile', userData);
      
      // Update token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      // Update user info in localStorage
      const currentUser = this.getCurrentUser();
      const updatedUser = { ...currentUser, ...data };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      return updatedUser;
    } catch (error) {
      console.error('Profile update error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Profile update failed';
        toast({
          title: 'Profile update failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Profile update failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
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
      const { data } = await api.post('/users/address', addressData);
      
      // Update user info in localStorage
      const currentUser = this.getCurrentUser();
      if (currentUser) {
        currentUser.addresses = data.addresses;
        localStorage.setItem('user', JSON.stringify(currentUser));
      }
      
      return currentUser;
    } catch (error) {
      console.error('Add address error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to add address';
        toast({
          title: 'Address update failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Address update failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      return null;
    }
  },
  
  // Change password
  async changePassword(passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<boolean> {
    try {
      const { data } = await api.put('/users/profile', {
        password: passwordData.newPassword,
        currentPassword: passwordData.currentPassword
      });
      
      // Update token if provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }
      
      return true;
    } catch (error) {
      console.error('Password change error:', error);
      if (axios.isAxiosError(error) && error.response) {
        const message = error.response.data.message || 'Failed to change password';
        toast({
          title: 'Password change failed',
          description: message,
          variant: 'destructive'
        });
      } else {
        toast({
          title: 'Password change failed',
          description: 'An unexpected error occurred',
          variant: 'destructive'
        });
      }
      return false;
    }
  }
};

export default authService;
