
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
};

// Mock admin user for testing
const MOCK_ADMIN_USER: UserProfile = {
  _id: 'admin123',
  name: 'Admin User',
  email: 'admin@gamecity.com',
  isAdmin: true,
  joinDate: new Date().toISOString(),
  addresses: [],
  token: 'mock-jwt-token'
};

// LocalStorage helper functions
const getUsers = (): UserProfile[] => {
  const usersStr = localStorage.getItem('users');
  return usersStr ? JSON.parse(usersStr) : [];
};

const saveUsers = (users: UserProfile[]): void => {
  localStorage.setItem('users', JSON.stringify(users));
};

// Services
export const authService = {
  // Login user
  async login(credentials: LoginCredentials): Promise<UserProfile | null> {
    try {
      // Check if this is an admin login
      if (credentials.email === 'admin@gamecity.com' && credentials.password === 'admin123') {
        localStorage.setItem('token', MOCK_ADMIN_USER.token);
        localStorage.setItem('user', JSON.stringify(MOCK_ADMIN_USER));
        
        return MOCK_ADMIN_USER;
      }
      
      // Check local storage for the user
      const users = getUsers();
      const user = users.find(u => 
        u.email === credentials.email && 
        // In a real app, we'd use bcrypt to compare passwords
        // This is obviously not secure, but it's just for demo purposes
        credentials.password === credentials.password
      );
      
      if (!user) {
        toast({
          title: 'Login failed',
          description: 'Invalid email or password',
          variant: 'destructive'
        });
        return null;
      }
      
      // Store token in localStorage
      localStorage.setItem('token', user.token);
      
      // Store user info in localStorage
      localStorage.setItem('user', JSON.stringify(user));
      
      return user;
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
      const users = getUsers();
      
      // Check if user already exists
      if (users.some(user => user.email === userData.email)) {
        toast({
          title: 'Registration failed',
          description: 'User with this email already exists',
          variant: 'destructive'
        });
        return null;
      }
      
      // Create a new user
      const newUser: UserProfile = {
        _id: 'user_' + Date.now(),
        name: userData.name,
        email: userData.email,
        // In a real app, we'd use bcrypt to hash the password
        password: userData.password,
        isAdmin: false,
        joinDate: new Date().toISOString(),
        addresses: [],
        token: 'token_' + Date.now()
      };
      
      // Add user to the array
      users.push(newUser);
      saveUsers(users);
      
      // Store token and user in localStorage
      localStorage.setItem('token', newUser.token);
      localStorage.setItem('user', JSON.stringify(newUser));
      
      toast({
        title: 'Registration successful',
        description: 'Your account has been created',
      });
      
      return newUser;
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
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u._id === currentUser._id);
      
      if (userIndex === -1) {
        throw new Error('User not found in database');
      }
      
      // Update user data
      const updatedUser = { 
        ...currentUser, 
        ...userData 
      };
      
      users[userIndex] = updatedUser;
      saveUsers(users);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      });
      
      return updatedUser;
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
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u._id === currentUser._id);
      
      if (userIndex === -1) {
        throw new Error('User not found in database');
      }
      
      // Add the new address
      const newAddress = {
        _id: 'addr_' + Date.now(),
        ...addressData
      };
      
      const updatedUser = { 
        ...currentUser,
        addresses: [...currentUser.addresses, newAddress] 
      };
      
      users[userIndex] = updatedUser;
      saveUsers(users);
      
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      toast({
        title: 'Address added',
        description: 'Your address has been added successfully',
      });
      
      return updatedUser;
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
      const currentUser = this.getCurrentUser();
      if (!currentUser) {
        throw new Error('User not found');
      }
      
      const users = getUsers();
      const userIndex = users.findIndex(u => u._id === currentUser._id);
      
      if (userIndex === -1) {
        throw new Error('User not found in database');
      }
      
      // In a real app, we'd verify the current password with bcrypt
      // and hash the new password
      if (users[userIndex].password !== passwordData.currentPassword) {
        toast({
          title: 'Password change failed',
          description: 'Current password is incorrect',
          variant: 'destructive'
        });
        return false;
      }
      
      // Update the password
      users[userIndex].password = passwordData.newPassword;
      saveUsers(users);
      
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
