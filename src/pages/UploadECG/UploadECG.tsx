import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import Modal from '../../components/Modal/Modal'
import { useAuth } from '../../context/AuthContext'
import { apiFetch } from '../../lib/api'
import styles from './UploadECG.module.css'

type Status = 'idle' | 'uploading' | 'review' | 'confirming' | 'done' | 'error'
type FacingMode = 'environment' | 'user'

interface Selected {
  file: File
  previewUrl: string
}

interface UploadBatchFile {
  file_id: string
  s3_key: string
  upload_url: string
}

interface UploadBatchResponse {
  batch_id: string
  files: UploadBatchFile[]
}

export default function UploadECG() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const [selected, setSelected] = useState<Selected[]>([])
  const [status, setStatus] = useState<Status>('idle')
  const [batchId, setBatchId] = useState<string | null>(null)
  const [sentCount, setSentCount] = useState(0)
  const [errorMsg, setErrorMsg] = useState('')
  const [cameraOpen, setCameraOpen] = useState(false)
  const [cameraError, setCameraError] = useState('')
  const [facingMode, setFacingMode] = useState<FacingMode>('environment')
  const galleryInputRef = useRef<HTMLInputElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const selectedRef = useRef<Selected[]>([])
  useEffect(() => {
    selectedRef.current = selected
  }, [selected])

  useEffect(() => {
    return () => {
      selectedRef.current.forEach((item) => URL.revokeObjectURL(item.previewUrl))
    }
  }, [])

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop())
      streamRef.current = null
    }
  }, [])

  function addFiles(list: FileList | File[] | null) {
    if (!list || list.length === 0) return
    const newItems = Array.from(list).map((file) => ({ file, previewUrl: URL.createObjectURL(file) }))
    setSelected((prev) => [...prev, ...newItems])
  }

  function removeFile(index: number) {
    setSelected((prev) => {
      const item = prev[index]
      if (item) URL.revokeObjectURL(item.previewUrl)
      return prev.filter((_, i) => i !== index)
    })
  }

  async function openCamera(mode: FacingMode = facingMode) {
    setCameraError('')
    setCameraOpen(true)
    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        throw new Error('unsupported')
      }
      let stream: MediaStream
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: mode } },
        })
      } catch (err) {
        if (err instanceof DOMException && err.name === 'OverconstrainedError') {
          stream = await navigator.mediaDevices.getUserMedia({ video: true })
        } else {
          throw err
        }
      }
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        videoRef.current.play().catch(() => {})
      }
    } catch (err) {
      const name = err instanceof DOMException ? err.name : ''
      if (name === 'NotAllowedError' || name === 'SecurityError') {
        setCameraError('Permissão de câmera negada. Permita o acesso no navegador ou escolha da galeria.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCameraError('Nenhuma câmera encontrada neste dispositivo.')
      } else {
        setCameraError('Não foi possível acessar a câmera. Tente novamente ou escolha da galeria.')
      }
    }
  }

  async function switchCamera() {
    const next: FacingMode = facingMode === 'environment' ? 'user' : 'environment'
    setFacingMode(next)
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    await openCamera(next)
  }

  function closeCamera() {
    streamRef.current?.getTracks().forEach((track) => track.stop())
    streamRef.current = null
    setCameraError('')
    setCameraOpen(false)
  }

  function capturePhoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas || video.videoWidth === 0 || video.videoHeight === 0) return

    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob) => {
        if (!blob) return
        const file = new File([blob], `ecg-${Date.now()}.jpg`, { type: 'image/jpeg' })
        addFiles([file])
        closeCamera()
      },
      'image/jpeg',
      0.95,
    )
  }

  async function handleSend() {
    if (selected.length === 0) return
    setStatus('uploading')
    setErrorMsg('')

    try {
      const batch = await apiFetch<UploadBatchResponse>('/api/uploads/', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          files: selected.map((item) => ({
            filename: item.file.name,
            content_type: item.file.type,
          })),
        }),
      })

      await Promise.all(
        batch.files.map((entry, index) => {
          const file = selected[index]!.file
          return fetch(entry.upload_url, {
            method: 'PUT',
            headers: { 'Content-Type': file.type },
            body: file,
          }).then((res) => {
            if (!res.ok) {
              throw new Error(`Falha no upload de "${file.name}" (HTTP ${res.status}).`)
            }
          })
        }),
      )

      setBatchId(batch.batch_id)
      setSentCount(selected.length)
      setStatus('review')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao enviar')
      setStatus('error')
    }
  }

  async function handleConfirm() {
    if (!batchId) return
    setStatus('confirming')
    setErrorMsg('')

    try {
      await apiFetch(`/api/uploads/${batchId}/confirmar/`, {
        method: 'POST',
        token: token ?? undefined,
      })
      selected.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setSelected([])
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Falha ao confirmar')
      setStatus('review')
    }
  }

  function handleReset() {
    setBatchId(null)
    setSentCount(0)
    setErrorMsg('')
    setStatus('idle')
  }

  if (status === 'done') {
    return (
      <div className={styles.page}>
        <Header title="Upload de arquivos" />
        <div className={styles.content}>
          <div className={styles.confirmCard}>
            <h1 className={styles.confirmTitle}>Obrigado!</h1>
            <p className={styles.subtitle}>Recebemos {sentCount} foto{sentCount === 1 ? '' : 's'}.</p>
            <Button onClick={handleReset}>Enviar mais fotos</Button>
            <Button variant="outline" onClick={() => navigate('/dashboard')}>
              Concluir
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'review' || status === 'confirming') {
    return (
      <div className={styles.page}>
        <Header title="Confirmar envio" />
        <div className={styles.content}>
          <p className={styles.subtitle}>Confira as fotos enviadas antes de confirmar.</p>

          <div className={styles.previewGrid}>
            {selected.map((item, index) => (
              <div key={item.previewUrl} className={styles.previewItem}>
                <img src={item.previewUrl} alt={`Foto ${index + 1}`} className={styles.previewImg} />
              </div>
            ))}
          </div>

          {errorMsg && <p className={styles.error}>{errorMsg}</p>}

          <Button fullWidth disabled={status === 'confirming'} onClick={handleConfirm}>
            {status === 'confirming' ? 'Confirmando…' : 'Confirmar'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header title="Upload de arquivos" />
      <div className={styles.content}>
        <p className={styles.subtitle}>Tire uma foto ou escolha da galeria. Pode enviar várias de uma vez.</p>

        <div className={styles.actionsRow}>
          <Button variant="outline" fullWidth onClick={() => openCamera()}>
            Tirar foto
          </Button>
          <Button variant="outline" fullWidth onClick={() => galleryInputRef.current?.click()}>
            Escolher da galeria
          </Button>
        </div>

        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          multiple
          className={styles.hiddenInput}
          onChange={(e) => {
            addFiles(e.target.files)
            e.target.value = ''
          }}
        />

        {selected.length > 0 && (
          <div className={styles.previewGrid}>
            {selected.map((item, index) => (
              <div key={item.previewUrl} className={styles.previewItem}>
                <img src={item.previewUrl} alt={`Foto ${index + 1}`} className={styles.previewImg} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFile(index)}
                  disabled={status === 'uploading'}
                  aria-label="Remover foto"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        {status === 'error' && <p className={styles.error}>{errorMsg}</p>}

        <Button
          fullWidth
          disabled={selected.length === 0 || status === 'uploading'}
          onClick={handleSend}
        >
          {status === 'uploading' ? 'Enviando…' : `Enviar${selected.length > 0 ? ` (${selected.length})` : ''}`}
        </Button>

        <canvas ref={canvasRef} className={styles.hiddenInput} />

        <Modal open={cameraOpen} onClose={closeCamera}>
          <button
            type="button"
            className={styles.cameraClose}
            onClick={closeCamera}
            aria-label="Fechar câmera"
          >
            ×
          </button>
          <h2 className={styles.cameraTitle}>Tirar foto</h2>
          {cameraError ? (
            <p className={styles.error}>{cameraError}</p>
          ) : (
            <>
              <div className={styles.cameraVideoWrap}>
                <video ref={videoRef} className={styles.cameraVideo} autoPlay playsInline muted />
                <button
                  type="button"
                  className={styles.cameraSwitch}
                  onClick={switchCamera}
                  disabled={!!cameraError}
                  aria-label="Trocar câmera"
                >
                  ⇄
                </button>
              </div>
              <p className={styles.cameraHint}>Posicione o ECG no enquadramento e toque em Capturar.</p>
            </>
          )}
          <div className={styles.cameraActions}>
            <Button variant="outline" fullWidth onClick={closeCamera}>
              Cancelar
            </Button>
            <Button fullWidth onClick={capturePhoto} disabled={!!cameraError}>
              Capturar
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
