import type { ApiClient } from './api'

export interface UploadFile {
  blob: Blob
  filename: string
  contentType: string
}

export type UploadProgressStep = 'iniciando' | 'enviando' | 'confirmando'

interface UploadBatchFile {
  file_id: string
  s3_key: string
  upload_url: string
}

interface UploadBatchResponse {
  batch_id: string
  files: UploadBatchFile[]
}

export async function uploadECGBatch(
  apiClient: ApiClient,
  files: UploadFile[],
  onProgress?: (step: UploadProgressStep) => void,
): Promise<{ batchId: string }> {
  onProgress?.('iniciando')

  const batch = await apiClient.apiFetch<UploadBatchResponse>('/api/uploads/', {
    method: 'POST',
    body: JSON.stringify({
      files: files.map((file) => ({
        filename: file.filename,
        content_type: file.contentType,
      })),
    }),
  })

  onProgress?.('enviando')

  await Promise.all(
    batch.files.map((entry, index) => {
      const file = files[index]!
      return fetch(entry.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': file.contentType },
        body: file.blob,
      }).then((res) => {
        if (!res.ok) {
          throw new Error(`Falha no upload de "${file.filename}" (HTTP ${res.status}).`)
        }
      })
    }),
  )

  return { batchId: batch.batch_id }
}

export async function confirmUploadBatch(
  apiClient: ApiClient,
  batchId: string,
  onProgress?: (step: UploadProgressStep) => void,
): Promise<void> {
  onProgress?.('confirmando')

  await apiClient.apiFetch(`/api/uploads/${batchId}/confirmar/`, {
    method: 'POST',
  })
}