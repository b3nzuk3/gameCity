import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from 'react'
import backendService, { type User } from '@/services/backendService'
import { toast } from '@/hooks/use-toast'

// Auth context type definition
type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (name: string, email: string, password: string) => Promise<string>
  logout: () => Promise<void>
  updateProfile: (data: { name: string }) => Promise<User | null>
  resetPassword: (email: string) => Promise<void>
}

// Create context
const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Provider component
export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState<boolean>(true)

  // Check for existing authentication on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        setIsLoading(true)
        const token = localStorage.getItem('gamecity_auth_token')

        if (!token) {
          setIsLoading(false)
          return
        }

        // Verify token with backend
        const response = await backendService.auth.getCurrentUser()
        setUser(response.user)
        console.log('User authenticated:', response.user)
      } catch (error) {
        console.error('Auth check failed:', error)
        // Clear invalid token
        localStorage.removeItem('gamecity_auth_token')
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await backendService.auth.login(email, password)
      setUser(response.user)

      // Save token to localStorage
      if (response.token) {
        localStorage.setItem('gamecity_auth_token', response.token)
      }

      toast({
        title: 'Welcome back!',
        description: `Logged in as ${response.user.name}`,
      })

      console.log('Login successful:', response.user)
    } catch (error) {
      console.error('Login error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed'

      toast({
        title: 'Login failed',
        description: errorMessage,
        variant: 'destructive',
      })

      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Register function
  const register = async (name: string, email: string, password: string) => {
    try {
      setIsLoading(true)
      const response = await backendService.auth.register(name, email, password)
      // Do NOT log in or set user, just show the backend message
      toast({
        title: 'Registration successful!',
        description:
          response.message || 'Please check your email to verify your account.',
      })
      return response.message
    } catch (error) {
      console.error('Registration error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed'
      toast({
        title: 'Registration failed',
        description: errorMessage,
        variant: 'destructive',
      })
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  // Logout function
  const logout = async () => {
    try {
      backendService.auth.logout()
      setUser(null)

      toast({
        title: 'Logged out',
        description: 'You have been successfully logged out',
      })

      console.log('Logout successful')
    } catch (error) {
      console.error('Logout error:', error)
      // Even if there's an error, clear local state
      setUser(null)
    }
  }

  // Update profile function
  const updateProfile = async (data: {
    name: string
  }): Promise<User | null> => {
    try {
      if (!user) {
        throw new Error('No user logged in')
      }

      const updatedUser = await backendService.users.update(user.id, data)
      setUser(updatedUser)

      toast({
        title: 'Profile updated',
        description: 'Your profile has been updated successfully',
      })

      console.log('Profile updated:', updatedUser)
      return updatedUser
    } catch (error) {
      console.error('Profile update error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Profile update failed'

      toast({
        title: 'Update failed',
        description: errorMessage,
        variant: 'destructive',
      })

      throw error
    }
  }

  // Reset password function
  const resetPassword = async (email: string) => {
    try {
      const response = await backendService.auth.resetPassword(email)

      toast({
        title: 'Password reset sent',
        description: response.message,
      })

      console.log('Password reset requested for:', email)
    } catch (error) {
      console.error('Password reset error:', error)
      const errorMessage =
        error instanceof Error ? error.message : 'Password reset failed'

      toast({
        title: 'Reset failed',
        description: errorMessage,
        variant: 'destructive',
      })

      throw error
    }
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        resetPassword,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
