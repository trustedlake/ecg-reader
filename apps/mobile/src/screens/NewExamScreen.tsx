import { useState } from 'react'
import Button from '../ui/Button'
import type { Sex } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import type { AppScreenProps } from '../navigation/types'
import { DEFAULT_CALIBRATION } from '../flow/defaults'
import { useReadingDefaults } from '../flow/readingDefaults'
import { ErrorNotice } from '../ui/Feedback'
import Screen from '../ui/Screen'
import SegmentedControl from '../ui/SegmentedControl'
import TextField from '../ui/TextField'

interface FieldErrors {
  name?: string
  age?: string
  sex?: string
}

function validate(name: string, age: string, sex: Sex | null): FieldErrors {
  const errors: FieldErrors = {}
  if (!name.trim()) errors.name = 'Enter the patient name.'
  const ageNumber = Number(age)
  if (!age.trim()) errors.age = 'Enter the age.'
  else if (!/^\d+$/.test(age.trim()) || ageNumber > 130) errors.age = 'Invalid age (0 to 130 years).'
  if (!sex) errors.sex = 'Select the sex: it is used in the interpretation.'
  return errors
}

export default function NewExamScreen({ navigation }: AppScreenProps<'NewExam'>) {
  const { api, config } = useApi()
  const { start } = useAttemptDraft()
  const [saved] = useReadingDefaults()
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [sex, setSex] = useState<Sex | null>(null)
  const [touched, setTouched] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<unknown>(null)

  const errors = touched ? validate(name, age, sex) : {}

  async function handleSubmit() {
    setTouched(true)
    if (Object.keys(validate(name, age, sex)).length > 0 || !sex) return
    setSubmitting(true)
    setError(null)
    try {
      const exam = await api.createExam({ name: name.trim(), age: Number(age), sex })
      start(exam.id, exam.patient, saved.calibration ?? config?.calibration.default ?? DEFAULT_CALIBRATION, saved.layout)
      // replace: going back from the photo leads to the list, without recreating the exam.
      navigation.replace('Capture', { examId: exam.id })
    } catch (err) {
      setError(err)
      setSubmitting(false)
    }
  }

  return (
    <Screen
      title="New exam"
      onBack={() => navigation.goBack()}
      footer={
        <Button fullWidth loading={submitting} onPress={() => void handleSubmit()} testID="new-exam-submit">
          Continue to photo
        </Button>
      }
    >
      <TextField
        label="Patient name"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="next"
        maxLength={255}
        testID="patient-name"
      />
      <TextField
        label="Age (years)"
        value={age}
        onChangeText={(text) => setAge(text.replace(/[^\d]/g, ''))}
        error={errors.age}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={3}
        testID="patient-age"
      />
      <SegmentedControl<Sex>
        label="Sex"
        options={[
          { value: 'F', label: 'Female' },
          { value: 'M', label: 'Male' },
        ]}
        value={sex}
        onChange={setSex}
        error={errors.sex}
      />
      {error != null && <ErrorNotice error={error} />}
    </Screen>
  )
}
