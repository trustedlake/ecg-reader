import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button, confirmUploadBatch, Modal, uploadECGBatch } from 'shared'
import { apiClient } from '../../platform/api'
import styles from './UploadECG.module.css'

type Status = 'idle' | 'uploading' | 'review' | 'confirming' | 'done' | 'error'
type FacingMode = 'environment' | 'user'

interface Selected {
  file: File
  previewUrl: string
}

export default function UploadECG() {
  const navigate = useNavigate()
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
        setCameraError('Camera permission denied. Allow access in the browser or choose from the gallery.')
      } else if (name === 'NotFoundError' || name === 'OverconstrainedError') {
        setCameraError('No camera found on this device.')
      } else {
        setCameraError('Could not access the camera. Try again or choose from the gallery.')
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
      const { batchId } = await uploadECGBatch(
        apiClient,
        selected.map((item) => ({
          blob: item.file,
          filename: item.file.name,
          contentType: item.file.type,
        })),
      )

      setBatchId(batchId)
      setSentCount(selected.length)
      setStatus('review')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed')
      setStatus('error')
    }
  }

  async function handleConfirm() {
    if (!batchId) return
    setStatus('confirming')
    setErrorMsg('')

    try {
      await confirmUploadBatch(apiClient, batchId)
      selected.forEach((item) => URL.revokeObjectURL(item.previewUrl))
      setSelected([])
      setStatus('done')
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : 'Confirmation failed')
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
        <AppBrandHeader />
        <PageHeader title="Upload files" />
        <div className={styles.content}>
          <div className={styles.confirmCard}>
            <h1 className={styles.confirmTitle}>Thank you!</h1>
            <p className={styles.subtitle}>We received {sentCount} photo{sentCount === 1 ? '' : 's'}.</p>
            <Button onPress={handleReset}>Send more photos</Button>
            <Button variant="outline" onPress={() => navigate('/dashboard')}>
              Done
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (status === 'review' || status === 'confirming') {
    return (
      <div className={styles.page}>
        <AppBrandHeader />
        <PageHeader title="Confirm upload" />
        <div className={styles.content}>
          <p className={styles.subtitle}>Check the uploaded photos before confirming.</p>

          <div className={styles.previewGrid}>
            {selected.map((item, index) => (
              <div key={item.previewUrl} className={styles.previewItem}>
                <img src={item.previewUrl} alt={`Photo ${index + 1}`} className={styles.previewImg} />
              </div>
            ))}
          </div>

          {errorMsg && <p className={styles.error}>{errorMsg}</p>}

          <Button fullWidth disabled={status === 'confirming'} onPress={handleConfirm}>
            {status === 'confirming' ? 'Confirming…' : 'Confirm'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Upload files" />
      <div className={styles.content}>
        <p className={styles.subtitle}>Take a photo or choose from the gallery. You can send several at once.</p>

        <div className={styles.actionsRow}>
          <Button variant="outline" fullWidth onPress={openCamera}>
            Take photo
          </Button>
          <Button variant="outline" fullWidth onPress={() => galleryInputRef.current?.click()}>
            Choose from gallery
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
                <img src={item.previewUrl} alt={`Photo ${index + 1}`} className={styles.previewImg} />
                <button
                  type="button"
                  className={styles.removeBtn}
                  onClick={() => removeFile(index)}
                  disabled={status === 'uploading'}
                  aria-label="Remove photo"
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
          onPress={handleSend}
        >
          {status === 'uploading' ? 'Sending…' : `Send${selected.length > 0 ? ` (${selected.length})` : ''}`}
        </Button>

        <canvas ref={canvasRef} className={styles.hiddenInput} />

        <Modal open={cameraOpen} onClose={closeCamera}>
          <button
            type="button"
            className={styles.cameraClose}
            onClick={closeCamera}
            aria-label="Close camera"
          >
            ×
          </button>
          <h2 className={styles.cameraTitle}>Take photo</h2>
          {cameraError ? (
            <p className={styles.error}>{cameraError}</p>
          ) : (
            <>
              <div className={styles.cameraVideoWrap}>
                <video ref={videoRef} className={styles.cameraVideo} autoPlay playsInline muted />
                <button
                  type="button"
                  className={styles.cameraSwitch}
                  onClick={() => void switchCamera()}
                  disabled={!!cameraError}
                  aria-label="Switch camera"
                >
                  ⇄
                </button>
              </div>
              <p className={styles.cameraHint}>Frame the ECG and tap Capture.</p>
            </>
          )}
          <div className={styles.cameraActions}>
            <Button variant="outline" fullWidth onPress={closeCamera}>
              Cancel
            </Button>
            <Button fullWidth onPress={capturePhoto} disabled={!!cameraError}>
              Capture
            </Button>
          </div>
        </Modal>
      </div>
    </div>
  )
}
