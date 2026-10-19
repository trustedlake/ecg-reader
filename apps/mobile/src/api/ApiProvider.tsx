import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { ApiError, useAuth } from 'shared'
import type { ApiClient, AppConfig } from 'shared'
import { apiClient } from '../platform/api'

interface ApiContextValue {
  api: ApiClient
  config: AppConfig | null
  configError: unknown
  reloadConfig: () => void
}

const ApiContext = createContext<ApiContextValue | undefined>(undefined)

/** Envolve cada chamada: um 401 em qualquer lugar limpa a sessão e volta ao login. */
function withSessionGuard(client: ApiClient, onUnauthorized: () => void): ApiClient {
  const guarded: Record<string, unknown> = {}
  for (const [name, fn] of Object.entries(client)) {
    guarded[name] = async (...args: unknown[]) => {
      try {
        return await (fn as (...a: unknown[]) => Promise<unknown>)(...args)
      } catch (error) {
        if (error instanceof ApiError && error.kind === 'unauthorized') onUnauthorized()
        throw error
      }
    }
  }
  return guarded as unknown as ApiClient
}

export function ApiProvider({ children }: { children: ReactNode }) {
  const { logout, token } = useAuth()
  const api = useMemo(() => withSessionGuard(apiClient, logout), [logout])
  const [config, setConfig] = useState<AppConfig | null>(null)
  const [configError, setConfigError] = useState<unknown>(null)
  const [configVersion, setConfigVersion] = useState(0)

  useEffect(() => {
    if (!token) {
      setConfig(null)
      return
    }
    let cancelled = false
    setConfigError(null)
    api.getConfig().then(
      (value) => !cancelled && setConfig(value),
      (error: unknown) => !cancelled && setConfigError(error),
    )
    return () => {
      cancelled = true
    }
  }, [api, token, configVersion])

  const reloadConfig = useCallback(() => setConfigVersion((v) => v + 1), [])
  const value = useMemo(() => ({ api, config, configError, reloadConfig }), [api, config, configError, reloadConfig])
  return <ApiContext.Provider value={value}>{children}</ApiContext.Provider>
}

export function useApi(): ApiContextValue {
  const ctx = useContext(ApiContext)
  if (!ctx) throw new Error('useApi deve ser usado dentro de <ApiProvider>')
  return ctx
}
