import { google } from 'googleapis'

export const DRIVE_SCOPE = 'https://www.googleapis.com/auth/drive'

export function getOAuth2Client() {
  const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
  const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
  const refreshToken = process.env.GOOGLE_OAUTH_REFRESH_TOKEN

  if (!clientId || !clientSecret) {
    throw new Error('GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET não configurados')
  }

  const client = new google.auth.OAuth2(clientId, clientSecret, 'http://localhost:8991/oauth2callback')
  if (refreshToken) {
    client.setCredentials({ refresh_token: refreshToken })
  }
  return client
}
