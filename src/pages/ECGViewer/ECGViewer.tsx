import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import { useAuth } from '../../context/AuthContext'
import { useExamDraft } from '../../context/ExamDraftContext'
import { apiFetch } from '../../lib/api'
import styles from './ECGViewer.module.css'

interface ProcessResponse {
  overlay_trace_url: string
  overlay_signal_url: string
  fidelidade: string
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
      setError(err instanceof Error ? err.message : 'Falha ao processar o ECG.')
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
        <Header title="Análise do ECG" showBack />
        <div className={styles.content}>
          <p className={styles.statusText}>Nenhum exame em andamento.</p>
          <Button fullWidth onClick={() => navigate('/novo-ecg')}>
            Iniciar novo ECG
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Header title="Análise do ECG" showBack />

      <div className={styles.content}>
        {loading && (
          <div className={styles.gridArea}>
            <div className={styles.gridBg}>
              <span className={styles.detectedText}>
                Processando ECG... isso pode levar alguns minutos
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
            <Button fullWidth onClick={handleRetry}>
              Tentar novamente
            </Button>
          </>
        )}

        {result && !loading && (
          <>
            <div className={styles.gridArea}>
              <div className={styles.overlayStack}>
                <img className={styles.overlayImg} src={result.overlay_trace_url} alt="Sobreposição do traçado" />
                <img className={styles.overlayImg} src={result.overlay_signal_url} alt="Sobreposição do sinal" />
              </div>
            </div>

            <div className={styles.badges}>
              <span className={styles.badge}>Tipo: {result.image_type}</span>
              <span className={styles.badge}>Fidelidade: {result.fidelidade}</span>
            </div>

            <Button fullWidth onClick={() => navigate('/laudo')}>
              Confirmar e Continuar
            </Button>
          </>
        )}

        <button className={styles.feedbackLink} onClick={() => navigate('/feedback')}>
          Informar problema na leitura
        </button>
      </div>
    </div>
  )
}
