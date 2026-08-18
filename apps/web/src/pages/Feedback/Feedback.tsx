import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { Button, CheckboxGroup, useAuth, useExamDraft } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './Feedback.module.css'

const options = [
  { value: 'not-recognized', label: 'Parte do ECG não foi reconhecida.' },
  { value: 'cropped', label: 'A imagem foi cortada.' },
  { value: 'extra-areas', label: 'A detecção incluiu áreas que não fazem parte do ECG.' },
  { value: 'quality', label: 'A qualidade da imagem ficou comprometida.' },
  { value: 'other', label: 'Outro.' },
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
      setError('Nenhuma tentativa associada')
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
      setError(err instanceof Error ? err.message : 'Falha ao enviar o feedback.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header title="Feedback" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>O que aconteceu?</h2>

        <CheckboxGroup options={options} values={selected} onChange={setSelected} />

        <div className={styles.descSection}>
          <span className={styles.descLabel}>Descreva o problema (opcional)</span>
          <textarea
            className={styles.descField}
            placeholder="Descreva aqui..."
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </div>

        {error && <p className={styles.error}>{error}</p>}

        <Button fullWidth disabled={loading} onPress={handleSend}>
          {loading ? 'Enviando...' : 'Enviar'}
        </Button>
      </div>
    </div>
  )
}
