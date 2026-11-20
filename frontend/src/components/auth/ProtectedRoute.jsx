import { Navigate, useLocation, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-muted)]">Verifying session...</p>
      </div>
    </div>
  )
}

/**
 * Route protection middleware component:
 * Verifies if user is logged in. If not authenticated, redirects to /login.
 */
export default function ProtectedRoute({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <LoadingFallback />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  const isOnboardingRoute = location.pathname === '/onboarding'

  // If user has not completed onboarding and is not already on /onboarding, enforce onboarding
  if (!user?.onboardingCompleted && !isOnboardingRoute) {
    return <Navigate to="/onboarding" replace />
  }

  // If user has already completed onboarding and tries to access /onboarding, redirect to workspace
  if (user?.onboardingCompleted && isOnboardingRoute) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children ? children : <Outlet />
}
