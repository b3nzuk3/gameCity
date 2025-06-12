// Local Authentication Service - No Database Required
// Works with demo users for authentication

import { toast } from '@/hooks/use-toast'

export interface UserProfile {
  id: string
  email: string
  name: string
  isAdmin: boolean
  avatar_url?: string
}

// Demo users for authentication
const DEMO_USERS: UserProfile[] = [
  {
    id: 'demo-admin-1',
    email: 'admin@greenbits.com',
    name: 'Admin User',
    isAdmin: true,
  },
  {
    id: 'demo-admin-2',
    email: 'hussenito7@gmail.com',
    name: 'Hussein Admin',
    isAdmin: true,
  },
  {
    id: 'demo-user-1',
    email: 'test@example.com',
    name: 'Test User',
    isAdmin: false,
  },
]

const SESSION_KEY = 'gamecity_session'

export const localAuthService = {
  async signIn(email: string, password: string): Promise<UserProfile | null> {
    try {
      console.log('LocalAuth: Attempting sign in for:', email)

      // Find user in demo users
      const user = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )

      if (!user) {
        throw new Error('User not found')
      }

      // For demo purposes, accept any password for existing users
      // In production, you'd verify against real authentication
      console.log('LocalAuth: User found:', user.email)

      // Store session in localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(user))

      toast({
        title: 'Welcome back!',
        description: `Signed in as ${user.name}`,
      })

      return user
    } catch (error) {
      console.error('LocalAuth: Sign in failed:', error)
      toast({
        title: 'Sign in failed',
        description:
          error instanceof Error ? error.message : 'Invalid credentials',
        variant: 'destructive',
      })
      return null
    }
  },

  async signUp(
    email: string,
    password: string,
    name: string
  ): Promise<UserProfile | null> {
    try {
      console.log('LocalAuth: Attempting sign up for:', email)

      // Check if user already exists
      const existingUser = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )
      if (existingUser) {
        throw new Error('User already exists')
      }

      // Create new user (demo mode)
      const newUser: UserProfile = {
        id: `demo-${Date.now()}`,
        email,
        name,
        isAdmin: false, // New users are not admin by default
      }

      // Store session in localStorage
      localStorage.setItem(SESSION_KEY, JSON.stringify(newUser))

      toast({
        title: 'Account created!',
        description: `Welcome ${name}! You can now access the store.`,
      })

      return newUser
    } catch (error) {
      console.error('LocalAuth: Sign up failed:', error)
      toast({
        title: 'Sign up failed',
        description:
          error instanceof Error ? error.message : 'Could not create account',
        variant: 'destructive',
      })
      return null
    }
  },

  async signOut(): Promise<void> {
    try {
      localStorage.removeItem(SESSION_KEY)

      toast({
        title: 'Signed out',
        description: 'You have been successfully signed out',
      })
    } catch (error) {
      console.error('LocalAuth: Sign out failed:', error)
    }
  },

  async getCurrentUser(): Promise<UserProfile | null> {
    try {
      const sessionData = localStorage.getItem(SESSION_KEY)
      if (!sessionData) {
        return null
      }

      const user = JSON.parse(sessionData) as UserProfile
      console.log('LocalAuth: Current user:', user.email)
      return user
    } catch (error) {
      console.error('LocalAuth: Get current user failed:', error)
      localStorage.removeItem(SESSION_KEY) // Clear invalid session
      return null
    }
  },

  async updateProfile(
    updates: Partial<Pick<UserProfile, 'name' | 'avatar_url'>>
  ): Promise<UserProfile | null> {
    try {
      const currentUser = await this.getCurrentUser()
      if (!currentUser) {
        throw new Error('No user session found')
      }

      const updatedUser: UserProfile = {
        ...currentUser,
        ...updates,
      }

      localStorage.setItem(SESSION_KEY, JSON.stringify(updatedUser))

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      })

      return updatedUser
    } catch (error) {
      console.error('LocalAuth: Update profile failed:', error)
      toast({
        title: 'Update failed',
        description: 'Could not update profile',
        variant: 'destructive',
      })
      return null
    }
  },

  async resetPassword(email: string): Promise<boolean> {
    try {
      // Find user in demo users
      const user = DEMO_USERS.find(
        (u) => u.email.toLowerCase() === email.toLowerCase()
      )

      if (!user) {
        throw new Error('User not found')
      }

      // Simulate password reset email
      toast({
        title: 'Password reset sent',
        description: `Password reset instructions have been sent to ${email} (demo mode)`,
      })

      return true
    } catch (error) {
      console.error('LocalAuth: Reset password failed:', error)
      toast({
        title: 'Reset failed',
        description:
          error instanceof Error ? error.message : 'Could not send reset email',
        variant: 'destructive',
      })
      return false
    }
  },

  // Admin check helper
  isAdmin(user: UserProfile | null): boolean {
    return user?.isAdmin || false
  },

  // Get demo users (for reference)
  getDemoUsers(): UserProfile[] {
    return DEMO_USERS
  },
}
