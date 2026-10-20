import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button, CheckboxGroup, ChipSelect, Input, useAuth, useExamDraft } from 'shared'
import { apiFetch } from '../../platform/api'
import styles from './PatientDetails.module.css'

const reasonOptions = [
  { value: 'routine', label: 'Routine full exam' },
  { value: 'chest-pain', label: 'Chest pain' },
  { value: 'dyspnea', label: 'Dyspnea' },
  { value: 'syncope', label: 'Syncope' },
  { value: 'tachycardia', label: 'Tachycardia (palpitations)' },
]

const genderOptions = [
  { value: 'M', label: 'Male' },
  { value: 'F', label: 'Female' },
]

interface CreateExamResponse {
  id: string
}

interface CreateAttemptResponse {
  attempt_id: string
  upload_url: string
}

export default function PatientDetails() {
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
      setError("Enter the patient's name.")
      return
    }
    const ageNumber = Number(age)
    if (!age.trim() || !Number.isFinite(ageNumber) || ageNumber <= 0) {
      setError('Enter a valid age (greater than 0).')
      return
    }
    if (!imageFile) {
      setError('No image captured: go back and capture the ECG.')
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
        throw new Error(`Image upload to S3 failed (HTTP ${uploadResponse.status}).`)
      }

      navigate('/ecg-viewer')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not create the exam. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Patient Details" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Patient Details</h2>

        <div className={styles.fields}>
          <Input
            label="Patient's full name"
            value={name}
            onChangeText={setName}
          />
          <Input
            label="Patient's age"
            value={age}
            onChangeText={setAge}
            keyboardType="numeric"
          />
        </div>

        <h2 className={styles.sectionTitle}>Sex</h2>

        <div className={styles.chipSection}>
          <ChipSelect options={genderOptions} value={gender} onChange={setGender} />
        </div>

        <h2 className={styles.sectionTitle}>Reason for Exam</h2>
        <span className={styles.optional}>Optional</span>

        <CheckboxGroup options={reasonOptions} values={reasons} onChange={setReasons} />

        {error && <p className={styles.error}>{error}</p>}

        <div className={styles.actions}>
          <Button fullWidth disabled={loading} onPress={handleConfirm}>
            {loading ? 'Sending...' : 'Confirm'}
          </Button>
        </div>
      </div>
    </div>
  )
}
