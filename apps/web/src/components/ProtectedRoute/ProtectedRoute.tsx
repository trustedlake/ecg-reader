import { Navigate } from 'react-router-dom'
import type { ReactNode } from 'react'
import { useAuth } from 'shared'

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  const { isAuthenticated, isHydrated } = useAuth()

  if (!isHydrated) {
    return null
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}
