import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../providers/AuthProvider'
import LoadingSpinner from '../UI/LoadingSpinner'

interface ProtectedRouteProps {
  children: React.ReactNode
  redirectTo?: string
  requireAuth?: boolean
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  children,
  redirectTo = '/login',
  requireAuth = true,
}) => {
  const { isAuthenticated, isLoading } = useAuth()
  const location = useLocation()

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !isAuthenticated) {
    // Redirect to login page with return url
    return (
      <Navigate 
        to={redirectTo} 
        state={{ from: location.pathname }}
        replace 
      />
    )
  }

  // If authentication is not required but user is authenticated
  // (useful for login/register pages)
  if (!requireAuth && isAuthenticated) {
    // Get the intended destination from location state, fallback to dashboard
    const from = (location.state as any)?.from || '/dashboard'
    return <Navigate to={from} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
