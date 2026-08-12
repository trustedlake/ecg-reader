const API_BASE_URL = import.meta.env.VITE_API_BASE_URL as string

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

export async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options

  const mergedHeaders = new Headers(headers)
  if (!mergedHeaders.has('Content-Type')) {
    mergedHeaders.set('Content-Type', 'application/json')
  }
  if (token) {
    mergedHeaders.set('Authorization', `Token ${token}`)
  }

  const response = await fetch(`${API_BASE_URL}${path}`, { ...rest, headers: mergedHeaders })

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
