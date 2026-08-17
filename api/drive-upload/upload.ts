import type { IncomingMessage, ServerResponse } from 'node:http'
import { createReadStream } from 'node:fs'
import formidable, { type File } from 'formidable'
import { google } from 'googleapis'
import { getOAuth2Client } from './driveAuth.ts'

// Módulo temporário: envia fotos de ECG direto pro Google Drive enquanto
// o app ainda não sabe ler nenhum exame. Sem login, sem banco — só upload.
// Quando isso mudar pra GCS + leitura real, essa pasta inteira pode ser removida.

function json(res: ServerResponse, status: number, body: unknown) {
  res.statusCode = status
  res.setHeader('Content-Type', 'application/json')
  res.end(JSON.stringify(body))
}

export default async function handler(req: IncomingMessage, res: ServerResponse) {
  if (req.method !== 'POST') {
    return json(res, 405, { ok: false, error: 'Método não permitido' })
  }

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID
  if (!folderId) {
    return json(res, 500, { ok: false, error: 'GOOGLE_DRIVE_FOLDER_ID não configurada' })
  }

  try {
    const form = formidable({ multiples: true, maxFileSize: 25 * 1024 * 1024 })
    const [, rawFiles] = await form.parse(req)

    const incoming = Object.values(rawFiles)
      .flat()
      .filter((file): file is File => Boolean(file))

    if (incoming.length === 0) {
      return json(res, 400, { ok: false, error: 'Nenhuma imagem enviada' })
    }

    const auth = getOAuth2Client()
    const drive = google.drive({ version: 'v3', auth })

    const uploadedIds: string[] = []
    for (const file of incoming) {
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const name = `${timestamp}_${file.originalFilename ?? 'ecg.jpg'}`
      const response = await drive.files.create({
        requestBody: { name, parents: [folderId] },
        media: {
          mimeType: file.mimetype ?? 'image/jpeg',
          body: createReadStream(file.filepath),
        },
        fields: 'id',
      })
      uploadedIds.push(response.data.id ?? '')
    }

    return json(res, 200, { ok: true, count: uploadedIds.length, ids: uploadedIds })
  } catch (error) {
    console.error('drive-upload falhou:', error)
    return json(res, 500, { ok: false, error: 'Falha ao enviar imagens' })
  }
}
