import { Platform } from 'react-native'

/**
 * URL base da API. No web servido pelo Django, vazio = mesma origem (o app e a API estão no
 * mesmo host). No celular (Expo Go) é obrigatória: EXPO_PUBLIC_API_BASE_URL no .env.
 */
export const API_BASE_URL = (process.env.EXPO_PUBLIC_API_BASE_URL ?? '').trim()

export const API_BASE_URL_MISSING = Platform.OS !== 'web' && API_BASE_URL === ''
