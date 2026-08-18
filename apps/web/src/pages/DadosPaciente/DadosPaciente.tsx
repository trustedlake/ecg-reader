import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Input from '../../components/Input/Input'
import CheckboxGroup from '../../components/CheckboxGroup/CheckboxGroup'
import ChipSelect from '../../components/ChipSelect/ChipSelect'
import Button from '../../components/Button/Button'
import { useAuth, useExamDraft } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './DadosPaciente.module.css'

const reasonOptions = [
  { value: 'rotina', label: 'Exame completo de rotina' },
  { value: 'dor', label: 'Dor precordial' },
  { value: 'dispneia', label: 'Dispneia' },
  { value: 'sincope', label: 'Síncope' },
  { value: 'taquicardia', label: 'Taquicardia (palpitações)' },
]

const genderOptions = [
  { value: 'M', label: 'Masculino' },
  { value: 'F', label: 'Feminino' },
]

interface CreateExamResponse {
  id: string
}

interface CreateAttemptResponse {
  attempt_id: string
  upload_url: string
  imagem_s3_key: string
}

export default function DadosPaciente() {
  const navigate = useNavigate()
  const { token } = useAuth()
  const { imageFile, setExamCreated, setAttemptCreated } = useExamDraft()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('M')
  const [reasons, setReasons] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleConfirm() {
    setError(null)

    if (!name.trim()) {
      setError('Informe o nome do paciente.')
      return
    }
    const ageNumber = Number(age)
    if (!age.trim() || !Number.isFinite(ageNumber) || ageNumber <= 0) {
      setError('Informe uma idade válida (maior que 0).')
      return
    }
    if (!imageFile) {
      setError('Nenhuma imagem capturada — volte e capture o ECG.')
      return
    }

    setLoading(true)
    try {
      const reason = reasons
        .map((value) => reasonOptions.find((opt) => opt.value === value)?.label)
        .filter((label): label is string => Boolean(label))
        .join(', ')

      const exam = await apiFetch<CreateExamResponse>('/api/exams/', {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          name: name.trim(),
          age: ageNumber,
          gender,
          reason,
          ecg_layout: '3x4+1',
        }),
      })
      setExamCreated(exam.id)

      const attempt = await apiFetch<CreateAttemptResponse>(`/api/exams/${exam.id}/attempts/`, {
        method: 'POST',
        token: token ?? undefined,
        body: JSON.stringify({
          filename: imageFile.name,
          content_type: imageFile.type,
        }),
      })
      setAttemptCreated(attempt.attempt_id)

      const uploadResponse = await fetch(attempt.upload_url, {
        method: 'PUT',
        headers: { 'Content-Type': imageFile.type },
        body: imageFile,
      })
      if (!uploadResponse.ok) {
        throw new Error(`Falha no upload da imagem para o S3 (HTTP ${uploadResponse.status}).`)
      }

      navigate('/ecg-viewer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível criar o exame. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <Header title="Dados do Paciente" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Dados do Paciente</h2>

        <div className={styles.fields}>
          <Input
            label="Nome completo do paciente"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
          <Input
            label="Idade do paciente"
            type="number"
            min={1}
            value={age}
            onChange={(e) => setAge(e.target.value)}
            required
          />
        </div>

        <h2 className={styles.sectionTitle}>Gênero</h2>

        <div className={styles.chipSection}>
          <ChipSelect options={genderOptions} value={gender} onChange={setGender} />
        </div>

        <h2 className={styles.sectionTitle}>Motivo do Exame</h2>
        <span className={styles.optional}>Opcional</span>

        <CheckboxGroup options={reasonOptions} values={reasons} onChange={setReasons} />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button fullWidth disabled={loading} onClick={handleConfirm}>
            {loading ? 'Enviando...' : 'Confirmar'}
          </Button>
        </div>
      </div>
    </div>
  )
}
