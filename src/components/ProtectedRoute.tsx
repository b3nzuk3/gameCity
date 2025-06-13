import { Navigate } from 'react-router-dom'
import { useAuth } from '@/contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  adminOnly?: boolean
}

export default function ProtectedRoute({
  children,
  adminOnly = false,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    // Show a loading spinner or placeholder while checking auth
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/signin" replace />
  }

  if (adminOnly && !user.isAdmin) {
    return <Navigate to="/" replace />
  }

  return <>{children}</>
}
