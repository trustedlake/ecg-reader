import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { createApiClient } from '../api'
import type { StorageAdapter } from '../storage'

export interface AuthUser {
  id: string
  name: string
  username: string
  email: string
  crm: string
  is_admin: boolean
  is_staff?: boolean
}

interface LoginResponse {
  token: string
  user: AuthUser
}

interface AuthContextValue {
  token: string | null
  user: AuthUser | null
  isAuthenticated: boolean
  isHydrated: boolean
  login: (identifier: string, password: string) => Promise<void>
  logout: () => void
}

export const TOKEN_KEY = 'ecg_token'
export const USER_KEY = 'ecg_user'

const AuthContext = createContext<AuthContextValue | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
  storage: StorageAdapter
  apiBaseUrl: string
}

export function AuthProvider({ children, storage, apiBaseUrl }: AuthProviderProps) {
  const [token, setToken] = useState<string | null>(null)
  const [user, setUser] = useState<AuthUser | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  const client = useMemo(
    () =>
      createApiClient({
        baseUrl: apiBaseUrl,
        getToken: () => storage.getItem(TOKEN_KEY),
      }),
    [apiBaseUrl, storage],
  )

  useEffect(() => {
    let cancelled = false
    async function hydrate() {
      try {
        const [storedToken, storedUser] = await Promise.all([
          storage.getItem(TOKEN_KEY),
          storage.getItem(USER_KEY),
        ])
        if (cancelled) return
        setToken(storedToken)
        setUser(storedUser ? (JSON.parse(storedUser) as AuthUser) : null)
      } catch {
        if (!cancelled) {
          setToken(null)
          setUser(null)
        }
      } finally {
        if (!cancelled) setIsHydrated(true)
      }
    }
    void hydrate()
    return () => {
      cancelled = true
    }
  }, [storage])

  const login = useCallback(
    async (identifier: string, password: string) => {
      const data = await client.apiFetch<LoginResponse>('/api/auth/login/', {
        method: 'POST',
        body: JSON.stringify({ username: identifier, password }),
      })
      setToken(data.token)
      setUser(data.user)
      await storage.setItem(TOKEN_KEY, data.token)
      await storage.setItem(USER_KEY, JSON.stringify(data.user))
    },
    [client, storage],
  )

  const logout = useCallback(() => {
    setToken(null)
    setUser(null)
    void storage.removeItem(TOKEN_KEY)
    void storage.removeItem(USER_KEY)
  }, [storage])

  const value = useMemo(
    () => ({ token, user, isAuthenticated: token !== null, isHydrated, login, logout }),
    [token, user, isHydrated, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) {
    throw new Error('useAuth deve ser usado dentro de <AuthProvider>')
  }
  return ctx
}