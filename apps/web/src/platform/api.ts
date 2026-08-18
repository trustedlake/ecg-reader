import { createApiClient, TOKEN_KEY } from 'shared'
import { webStorageAdapter } from './storage'

export const apiClient = createApiClient({
  baseUrl: import.meta.env.VITE_API_BASE_URL as string,
  getToken: () => webStorageAdapter.getItem(TOKEN_KEY),
})

export const apiFetch = apiClient.apiFetch