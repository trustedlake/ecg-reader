import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button, useAuth, useExamDraft } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './ECGViewer.module.css'

interface ProcessResponse {
  overlay_trace_url: string
  overlay_signal_url: string
  fidelity: string
  image_type: string
  status: string
}

export default function ECGViewer() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { examId, attemptId } = useExamDraft()

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ProcessResponse | null>(null)
  const startedRef = useRef(false)

  const runProcess = useCallback(async () => {
    if (!examId || !attemptId || !token) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<ProcessResponse>(
        `/api/exams/${examId}/attempts/${attemptId}/process/`,
        { method: 'POST', token },
      )
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to process the ECG.')
    } finally {
      setLoading(false)
    }
  }, [examId, attemptId, token])

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void runProcess()
  }, [runProcess])

  function handleRetry() {
    startedRef.current = true
    void runProcess()
  }

  if (!examId || !attemptId) {
    return (
      <div className={styles.page}>
        <AppBrandHeader />
        <PageHeader title="ECG Analysis" showBack />
        <div className={styles.content}>
          <p className={styles.statusText}>No exam in progress.</p>
          <Button fullWidth onPress={() => navigate('/new-ecg')}>
            Start new ECG
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="ECG Analysis" showBack />

      <div className={styles.content}>
        {loading && (
          <div className={styles.gridArea}>
            <div className={styles.gridBg}>
              <span className={styles.detectedText}>
                Processing ECG... this may take a few minutes
              </span>
            </div>
          </div>
        )}

        {error && !loading && (
          <>
            <div className={styles.gridArea}>
              <div className={styles.gridBg}>
                <span className={styles.detectedText}>{error}</span>
              </div>
            </div>
            <Button fullWidth onPress={handleRetry}>
              Try again
            </Button>
          </>
        )}

        {result && !loading && (
          <>
            <div className={styles.gridArea}>
              <div className={styles.overlayStack}>
                <img className={styles.overlayImg} src={result.overlay_trace_url} alt="Trace overlay" />
                <img className={styles.overlayImg} src={result.overlay_signal_url} alt="Signal overlay" />
              </div>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge}>Type: {result.image_type}</span>
              <span className={styles.badge}>Fidelity: {result.fidelity}</span>
            </div>

            <Button fullWidth onPress={() => navigate('/report')}>
              Confirm and Continue
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
