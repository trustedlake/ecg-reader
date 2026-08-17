import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppHeader from '../../components/AppHeader/AppHeader'
import ParamCard from '../../components/ParamCard/ParamCard'
import Button from '../../components/Button/Button'
import { useAuth } from '../../context/AuthContext'
import { useExamDraft } from '../../context/ExamDraftContext'
import { apiFetch } from '../../lib/api'
import { formatNumber } from '../../lib/format'
import styles from './Laudo.module.css'

interface Ritmo {
  ritmo: string
  fc_bpm: number
}

interface ReportResponse {
  id: string
  attempt_id: string
  ritmo: Ritmo | null
  eixo_graus: number | null
  sokolow_mm: number | null
  achados: unknown
  conclusao: string | null
  confiabilidade: string | null
  versao_codigo: string
  created_at: string
  imagem_original_url: string | null
  overlay_trace_url: string | null
  overlay_signal_url: string | null
}

interface Attempt {
  id: string
  exam_id: string
  status: string
  image_type: string
  fidelidade: string
  created_at: string
  updated_at: string
  original_url: string | null
  overlay_trace_url: string | null
  overlay_signal_url: string | null
  report: {
    id: string
    attempt_id: string
    ritmo: Ritmo | null
    eixo_graus: number | null
    sokolow_mm: number | null
    achados: unknown
    conclusao: string | null
    confiabilidade: string | null
    versao_codigo: string
    created_at: string
  } | null
}

interface ExamDetail {
  id: string
  status: string
  attempts: Attempt[]
}

export default function Laudo() {
  const navigate = useNavigate()
  const { examId: examIdParam } = useParams<{ examId: string }>()
  const { token } = useAuth()
  const { examId, attemptId, reset } = useExamDraft()

  const isViewMode = examIdParam !== undefined

  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<ReportResponse | null>(null)
  const [notConcluded, setNotConcluded] = useState<string | null>(null)
  const startedRef = useRef(false)

  const runApprove = useCallback(async () => {
    if (!examId || !attemptId || !token) return
    setLoading(true)
    setError(null)
    try {
      const data = await apiFetch<ReportResponse>(
        `/api/exams/${examId}/attempts/${attemptId}/aprovar/`,
        { method: 'POST', token },
      )
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao gerar o laudo.')
    } finally {
      setLoading(false)
    }
  }, [examId, attemptId, token])

  const runFetchExisting = useCallback(async () => {
    if (!examIdParam || !token) return
    setLoading(true)
    setError(null)
    setNotConcluded(null)
    try {
      const exam = await apiFetch<ExamDetail>(`/api/exams/${examIdParam}`, { token })
      const concluded = exam.attempts
        .filter((a) => a.report !== null)
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
      if (concluded.length === 0) {
        setNotConcluded(`Status atual: ${exam.status}`)
        return
      }
      const attempt = concluded[0]
      if (!attempt || !attempt.report) return
      const report = attempt.report
      setResult({
        id: report.id,
        attempt_id: report.attempt_id,
        ritmo: report.ritmo,
        eixo_graus: report.eixo_graus,
        sokolow_mm: report.sokolow_mm,
        achados: report.achados,
        conclusao: report.conclusao,
        confiabilidade: report.confiabilidade,
        versao_codigo: report.versao_codigo,
        created_at: report.created_at,
        imagem_original_url: attempt.original_url,
        overlay_trace_url: attempt.overlay_trace_url,
        overlay_signal_url: attempt.overlay_signal_url,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Falha ao carregar o laudo.')
    } finally {
      setLoading(false)
    }
  }, [examIdParam, token])

  const run = isViewMode ? runFetchExisting : runApprove

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true
    void run()
  }, [run])

  function handleRetry() {
    startedRef.current = true
    void run()
  }

  function handleSave() {
    if (!isViewMode) {
      reset()
    }
    navigate('/dashboard', { state: { savedMessage: 'Seu exame foi salvo!' } })
  }

  const fcBpm = formatNumber(result?.ritmo?.fc_bpm, 0)
  const eixoGraus = formatNumber(result?.eixo_graus, 0)
  const sokolowMm = formatNumber(result?.sokolow_mm, 1)

  if (!isViewMode && (!examId || !attemptId)) {
    return (
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Laudo</h1>
          <button className={styles.close} onClick={() => navigate('/dashboard')}>
            ✕
          </button>
        </div>
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
      <AppHeader />
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Laudo</h1>
        <button className={styles.close} onClick={() => navigate('/dashboard')}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {loading && (
          <>
            <div className={styles.imageArea}>
              <div className={styles.imageBox}>
                <span className={styles.detectedLabel}>Gerando laudo...</span>
              </div>
            </div>
            <Button fullWidth disabled>
              Confirmar e Continuar
            </Button>
          </>
        )}

        {error && !loading && (
          <>
            <div className={styles.imageArea}>
              <div className={styles.imageBox}>
                <span className={styles.detectedLabel}>{error}</span>
              </div>
            </div>
            <Button fullWidth onClick={handleRetry}>
              Tentar novamente
            </Button>
          </>
        )}

        {notConcluded && !loading && (
          <p className={styles.statusText}>{notConcluded}</p>
        )}

        {result && !loading && (
          <>
            <div className={styles.imageArea}>
              <div className={styles.imageBox}>
                {result.imagem_original_url ? (
                  <img
                    className={styles.originalImg}
                    src={result.imagem_original_url}
                    alt="Imagem original do ECG"
                  />
                ) : (
                  <span className={styles.detectedLabel}>Imagem indisponível</span>
                )}
              </div>
              <span className={styles.imageHint}>Clique na imagem para ampliá-la</span>
            </div>

            <h2 className={styles.sectionTitle}>Parâmetros</h2>

            <div className={styles.paramsGrid}>
              <div className={styles.paramCard}>
                <ParamCard label="Ritmo" value={result.ritmo?.ritmo ?? '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="FC" value={fcBpm != null ? `${fcBpm} bpm` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Eixo" value={eixoGraus != null ? `${eixoGraus}°` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Sokolow" value={sokolowMm != null ? `${sokolowMm} mm` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Confiabilidade" value={result.confiabilidade ?? '—'} />
              </div>
            </div>

            <h2 className={styles.sectionTitle}>Interpretação</h2>

            <div className={styles.interpretCard}>
              <p className={styles.interpretText}>
                {result.conclusao ?? 'Sem conclusão disponível'}
              </p>
              {Array.isArray(result.achados) && result.achados.length > 0 && (
                <ul className={styles.achadosList}>
                  {result.achados.map((achado, index) => (
                    <li key={index} className={styles.achadoItem}>
                      {typeof achado === 'string' ? achado : JSON.stringify(achado)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button fullWidth onClick={handleSave}>
              Concluir
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
