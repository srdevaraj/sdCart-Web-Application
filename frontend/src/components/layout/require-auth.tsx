import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { isAdminUser, useAuthStore } from '@/features/auth/auth-store'

interface RequireAuthProps {
  children: ReactNode
}

/** Redirects signed-out users to the login page, preserving the intended route. */
export function RequireAuth({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  return children
}

/** Requires an authenticated ADMIN. Backend authorization remains authoritative. */
export function RequireAdmin({ children }: RequireAuthProps) {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated)
  const user = useAuthStore((s) => s.user)
  const location = useLocation()

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname + location.search }} replace />
  }
  if (!isAdminUser(user)) {
    return <Navigate to="/" replace />
  }
  return children
}
