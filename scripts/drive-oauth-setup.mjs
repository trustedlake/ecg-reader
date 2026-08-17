// Rodar uma única vez pra autorizar o upload de ECG a escrever no seu Drive pessoal.
// Uso: node scripts/drive-oauth-setup.mjs
// Precisa de GOOGLE_OAUTH_CLIENT_ID e GOOGLE_OAUTH_CLIENT_SECRET no .env.

import 'dotenv/config'
import http from 'node:http'
import { google } from 'googleapis'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const clientId = process.env.GOOGLE_OAUTH_CLIENT_ID
const clientSecret = process.env.GOOGLE_OAUTH_CLIENT_SECRET
const redirectUri = 'http://localhost:8991/oauth2callback'

if (!clientId || !clientSecret) {
  console.error('Faltam GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET no .env')
  process.exit(1)
}

const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/drive'],
})

console.log('\nAbra esta URL no navegador e faça login com a conta dona da pasta do Drive:\n')
console.log(authUrl)
console.log('\nAguardando autorização...\n')

const server = http.createServer(async (req, res) => {
  if (!req.url?.startsWith('/oauth2callback')) {
    res.writeHead(404)
    res.end()
    return
  }

  const url = new URL(req.url, redirectUri)
  const code = url.searchParams.get('code')

  if (!code) {
    res.writeHead(400, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>Faltou o código de autorização.</h1>')
    return
  }

  try {
    const { tokens } = await oauth2Client.getToken(code)
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>Autorizado! Pode fechar esta aba.</h1>')

    if (!tokens.refresh_token) {
      console.error('\nNão veio refresh_token. Revogue o acesso em https://myaccount.google.com/permissions e rode de novo.')
      server.close()
      process.exit(1)
    }

    const __dirname = path.dirname(fileURLToPath(import.meta.url))
    const envPath = path.join(__dirname, '..', '.env')
    const current = fs.readFileSync(envPath, 'utf-8')
    const line = `GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`
    const updated = current.match(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m)
      ? current.replace(/^GOOGLE_OAUTH_REFRESH_TOKEN=.*$/m, line)
      : `${current.trimEnd()}\n${line}\n`
    fs.writeFileSync(envPath, updated)

    console.log('Refresh token salvo em .env (GOOGLE_OAUTH_REFRESH_TOKEN). Reinicie o dev server.')
    server.close()
    process.exit(0)
  } catch (error) {
    console.error('Falha ao trocar o código por tokens:', error)
    res.writeHead(500, { 'Content-Type': 'text/html; charset=utf-8' })
    res.end('<h1>Falha na autorização, veja o terminal.</h1>')
    server.close()
    process.exit(1)
  }
})

server.listen(8991)
