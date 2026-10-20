import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { PatientCard, ComingSoonPopup, useAuth } from 'shared'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { apiFetch } from '../../platform/api'
import styles from './Dashboard.module.css'

interface Exam {
  id: string
  patient: { id: string; name: string; age: number; gender: string }
  status: string
  reason: string
  ecg_layout: string
  created_at: string
  updated_at: string
}

interface ExamsResponse {
  count: number
  next: string | null
  previous: string | null
  results: Exam[]
}

function mapStatus(status: string): 'success' | 'warning' | 'error' {
  if (status === 'completed') return 'success'
  if (status.endsWith('_error') || status === 'user_rejected' || status === 'reading_refused') return 'error'
  return 'warning'
}

const dateFormatter = new Intl.DateTimeFormat('en-US', {
  day: '2-digit',
  month: 'short',
  year: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
})

export default function Dashboard() {
  const navigate = useNavigate()
  const location = useLocation()
  const { token, user } = useAuth()
  const [exams, setExams] = useState<Exam[] | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [comingSoonOpen, setComingSoonOpen] = useState(false)
  const hasExams = exams !== null && exams.length > 0
  const [successMessage, setSuccessMessage] = useState<string | null>(
    (location.state as { savedMessage?: string } | null)?.savedMessage ?? null,
  )

  function dismissSuccessMessage() {
    setSuccessMessage(null)
    navigate('.', { replace: true, state: {} })
  }

  function handleNewExam() {
    if (user?.is_admin) {
      navigate('/new-ecg')
    } else {
      setComingSoonOpen(true)
    }
  }

  useEffect(() => {
    if (!successMessage) return
    const timer = setTimeout(dismissSuccessMessage, 3500)
    return () => clearTimeout(timer)
  }, [successMessage])

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const data = await apiFetch<ExamsResponse>('/api/exams/', { token: token ?? undefined })
        if (!cancelled) setExams(data.results)
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : 'Failed to load exams.')
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token])

  return (
    <div className={styles.page}>
      {successMessage && (
        <div className={styles.successBanner}>
          <span>{successMessage}</span>
          <button className={styles.successBannerClose} onClick={dismissSuccessMessage}>
            ✕
          </button>
        </div>
      )}
      <div className={styles.headerBleed}>
        <AppBrandHeader />
      </div>

      <p className={styles.greeting}>Hello, {user?.name}</p>

      {hasExams && (
        <div className={styles.searchBar}>
          <span className={styles.searchPlaceholder}>Search patient or exam...</span>
        </div>
      )}

      <h2 className={styles.sectionTitle}>Recent Exams</h2>

      <div className={styles.list}>
        {error ? (
          <p className={styles.emptyText}>{error}</p>
        ) : exams === null ? (
          <p className={styles.emptyText}>Loading exams...</p>
        ) : exams.length === 0 ? (
          <p className={styles.emptyText}>
            No exams yet
            <br />
            Tap + to create the first one.
          </p>
        ) : (
          exams.map((exam) => (
            <PatientCard
              key={exam.id}
              name={exam.patient.name}
              date={dateFormatter.format(new Date(exam.created_at))}
              status={mapStatus(exam.status)}
              onPress={() => navigate(`/report/${exam.id}`)}
            />
          ))
        )}

        <button className={styles.uploadTempButton} onClick={() => navigate('/upload')}>
          Upload files
        </button>
      </div>

      <button className={styles.fab} onClick={handleNewExam}>
        +
      </button>

      <ComingSoonPopup open={comingSoonOpen} onClose={() => setComingSoonOpen(false)} />
    </div>
  )
}