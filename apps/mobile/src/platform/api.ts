import { createApiClient, TOKEN_KEY } from 'shared'
import { mobileStorageAdapter } from './storage'

export const apiClient = createApiClient({
  baseUrl: process.env.EXPO_PUBLIC_API_BASE_URL!,
  getToken: () => mobileStorageAdapter.getItem(TOKEN_KEY),
})