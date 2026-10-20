import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button, ParamCard, useAuth, useExamDraft, formatNumber, WIRE_PATHS } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './Report.module.css'

interface Rhythm {
  rhythm: string
  hr_bpm: number
}

interface ReportResponse {
  id: string
  attempt_id: string
  rhythm: Rhythm | null
  axis_degrees: number | null
  sokolow_mm: number | null
  findings: unknown
  conclusion: string | null
  reliability: string | null
  code_version: string
  created_at: string
  original_image_url: string | null
  overlay_trace_url: string | null
  overlay_signal_url: string | null
}

interface Attempt {
  id: string
  exam_id: string
  status: string
  image_type: string
  fidelity: string
  created_at: string
  updated_at: string
  original_url: string | null
  overlay_trace_url: string | null
  overlay_signal_url: string | null
  report: {
    id: string
    attempt_id: string
    rhythm: Rhythm | null
    axis_degrees: number | null
    sokolow_mm: number | null
    findings: unknown
    conclusion: string | null
    reliability: string | null
    code_version: string
    created_at: string
  } | null
}

interface ExamDetail {
  id: string
  status: string
  attempts: Attempt[]
}

export default function Report() {
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
        `/api/exams/${examId}/attempts/${attemptId}/${WIRE_PATHS.approve}/`,
        { method: 'POST', token },
      )
      setResult(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate the report.')
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
        setNotConcluded(`Current status: ${exam.status}`)
        return
      }
      const attempt = concluded[0]
      if (!attempt || !attempt.report) return
      const report = attempt.report
      setResult({
        id: report.id,
        attempt_id: report.attempt_id,
        rhythm: report.rhythm,
        axis_degrees: report.axis_degrees,
        sokolow_mm: report.sokolow_mm,
        findings: report.findings,
        conclusion: report.conclusion,
        reliability: report.reliability,
        code_version: report.code_version,
        created_at: report.created_at,
        original_image_url: attempt.original_url,
        overlay_trace_url: attempt.overlay_trace_url,
        overlay_signal_url: attempt.overlay_signal_url,
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load the report.')
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
    navigate('/dashboard', { state: { savedMessage: 'Your exam was saved!' } })
  }

  const hrBpm = formatNumber(result?.rhythm?.hr_bpm, 0)
  const axisDegrees = formatNumber(result?.axis_degrees, 0)
  const sokolowMm = formatNumber(result?.sokolow_mm, 1)

  if (!isViewMode && (!examId || !attemptId)) {
    return (
      <div className={styles.page}>
        <div className={styles.headerRow}>
          <h1 className={styles.title}>Report</h1>
          <button className={styles.close} onClick={() => navigate('/dashboard')}>
            ✕
          </button>
        </div>
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
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Report</h1>
        <button className={styles.close} onClick={() => navigate('/dashboard')}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        {loading && (
          <>
            <div className={styles.imageArea}>
              <div className={styles.imageBox}>
                <span className={styles.detectedLabel}>Generating report...</span>
              </div>
            </div>
            <Button fullWidth disabled>
              Confirm and Continue
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
            <Button fullWidth onPress={handleRetry}>
              Try again
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
                {result.original_image_url ? (
                  <img
                    className={styles.originalImg}
                    src={result.original_image_url}
                    alt="Original ECG image"
                  />
                ) : (
                  <span className={styles.detectedLabel}>Image unavailable</span>
                )}
              </div>
              <span className={styles.imageHint}>Click the image to enlarge it</span>
            </div>

            <h2 className={styles.sectionTitle}>Parameters</h2>

            <div className={styles.paramsGrid}>
              <div className={styles.paramCard}>
                <ParamCard label="Rhythm" value={result.rhythm?.rhythm ?? '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="HR" value={hrBpm != null ? `${hrBpm} bpm` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Axis" value={axisDegrees != null ? `${axisDegrees}°` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Sokolow" value={sokolowMm != null ? `${sokolowMm} mm` : '—'} />
              </div>
              <div className={styles.paramCard}>
                <ParamCard label="Reliability" value={result.reliability ?? '—'} />
              </div>
            </div>

            <h2 className={styles.sectionTitle}>Interpretation</h2>

            <div className={styles.interpretCard}>
              <p className={styles.interpretText}>
                {result.conclusion ?? 'No conclusion available'}
              </p>
              {Array.isArray(result.findings) && result.findings.length > 0 && (
                <ul className={styles.findingsList}>
                  {result.findings.map((finding, index) => (
                    <li key={index} className={styles.findingItem}>
                      {typeof finding === 'string' ? finding : JSON.stringify(finding)}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            <Button fullWidth onPress={handleSave}>
              Done
            </Button>
          </>
        )}
      </div>
    </div>
  )
}
