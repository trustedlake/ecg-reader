import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button, CheckboxGroup, useAuth, useExamDraft } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './Feedback.module.css'

const options = [
  { value: 'not-recognized', label: 'Part of the ECG was not recognized.' },
  { value: 'cropped', label: 'The image was cropped.' },
  { value: 'extra-areas', label: 'The detection included areas that are not part of the ECG.' },
  { value: 'quality', label: 'The image quality was compromised.' },
  { value: 'other', label: 'Other.' },
]

export default function Feedback() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { attemptId } = useExamDraft()
  const [selected, setSelected] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSend() {
    setError(null)
    if (!attemptId) {
      setError('No associated attempt')
      return
    }
    setLoading(true)
    try {
      await apiFetch(`/api/attempts/${attemptId}/feedback/`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({ issues: selected, description }),
      })
      navigate(-1)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send the feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Feedback" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>What happened?</h2>

        <CheckboxGroup options={options} values={selected} onChange={setSelected} />

        <div className={styles.descSection}>
          <span className={styles.descLabel}>Describe the problem (optional)</span>
          <textarea
            className={styles.descField}
            placeholder="Describe here..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button fullWidth disabled={loading} onPress={handleSend}>
          {loading ? 'Sending...' : 'Send'}
        </Button>
      </div>
    </div>
  )
}
