import { Platform } from 'react-native'

/**
 * API base URL. On the web served by Django, empty = same origin (the app and the API are on
 * the same host). On mobile (Expo Go) it is required: EXPO_PUBLIC_API_BASE_URL in .env.
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim()

export const API_BASE_URL_MISSING = Platform.OS !== 'web' && API_BASE_URL === ''
