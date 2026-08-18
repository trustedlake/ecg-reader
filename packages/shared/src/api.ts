type ApiErrorBody = {
  detail?: string
  [field: string]: unknown
}

export class ApiError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

interface ApiFetchOptions extends RequestInit {
  token?: string
}

export interface ApiClientConfig {
  baseUrl: string
  getToken: () => string | null | Promise<string | null>
}

export interface ApiClient {
  apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T>
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options
    const effectiveToken = token ?? (await config.getToken())

    const mergedHeaders = new Headers(headers)
    if (!mergedHeaders.has('Content-Type')) {
      mergedHeaders.set('Content-Type', 'application/json')
    }
    if (effectiveToken) {
      mergedHeaders.set('Authorization', `Token ${effectiveToken}`)
    }

    let response: Response
    try {
      response = await fetch(`${config.baseUrl}${path}`, { ...rest, headers: mergedHeaders })
    } catch {
      throw new ApiError(0, 'Servidores estão com problema')
    }

    if (!response.ok) {
      let message = response.statusText
      try {
        const body = (await response.json()) as ApiErrorBody
        if (typeof body.detail === 'string') {
          message = body.detail
        } else {
          const firstField = Object.values(body).find((v) => Array.isArray(v) && v.length > 0)
          if (Array.isArray(firstField) && typeof firstField[0] === 'string') {
            message = firstField[0]
          }
        }
      } catch {
        // corpo não-JSON: mantém statusText
      }
      throw new ApiError(response.status, message || response.statusText)
    }

    if (response.status === 204) {
      return undefined as T
    }

    return (await response.json()) as T
  }

  return { apiFetch }
}