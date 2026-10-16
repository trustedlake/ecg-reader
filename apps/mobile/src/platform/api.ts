import { createApiClient, TOKEN_KEY } from 'shared'
import { API_BASE_URL } from './config'
import { mobileStorageAdapter } from './storage'

export const apiClient = createApiClient({
  baseUrl: API_BASE_URL,
  getToken: () => mobileStorageAdapter.getItem(TOKEN_KEY),
})
