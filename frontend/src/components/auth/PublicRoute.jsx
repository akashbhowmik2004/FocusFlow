import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '@/context/AuthContext'

function LoadingFallback() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-[var(--color-bg)]">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-2 border-[var(--color-brand)] border-t-transparent rounded-full animate-spin" />
        <p className="text-sm text-[var(--color-text-muted)]">Loading...</p>
      </div>
    </div>
  )
}

/**
 * Public route guard:
 * If the user is already authenticated, redirect them directly to the app dashboard
 * rather than asking them to login/signup again.
 */
export default function PublicRoute({ children }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingFallback />
  }

  if (isAuthenticated) {
    return <Navigate to="/app/dashboard" replace />
  }

  return children ? children : <Outlet />
}
