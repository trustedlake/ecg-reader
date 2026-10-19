import { useState } from 'react'
import { Button } from 'shared'
import type { Sex } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import type { AppScreenProps } from '../navigation/types'
import { DEFAULT_CALIBRATION } from '../flow/defaults'
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
  if (!name.trim()) errors.name = 'Informe o nome do paciente.'
  const ageNumber = Number(age)
  if (!age.trim()) errors.age = 'Informe a idade.'
  else if (!/^\d+$/.test(age.trim()) || ageNumber > 130) errors.age = 'Idade inválida (0 a 130 anos).'
  if (!sex) errors.sex = 'Selecione o sexo: ele é usado na interpretação.'
  return errors
}

export default function NewExamScreen({ navigation }: AppScreenProps<'NewExam'>) {
  const { api, config } = useApi()
  const { start } = useAttemptDraft()
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
      start(exam.id, exam.patient, config?.calibration.default ?? DEFAULT_CALIBRATION)
      // replace: voltar da foto leva à lista, sem recriar o exame.
      navigation.replace('Capture', { examId: exam.id })
    } catch (err) {
      setError(err)
      setSubmitting(false)
    }
  }

  return (
    <Screen
      title="Novo exame"
      onBack={() => navigation.goBack()}
      footer={
        <Button fullWidth loading={submitting} onPress={() => void handleSubmit()} testID="new-exam-submit">
          Continuar para a foto
        </Button>
      }
    >
      <TextField
        label="Nome do paciente"
        value={name}
        onChangeText={setName}
        error={errors.name}
        autoCapitalize="words"
        returnKeyType="next"
        maxLength={255}
        testID="patient-name"
      />
      <TextField
        label="Idade (anos)"
        value={age}
        onChangeText={(text) => setAge(text.replace(/[^\d]/g, ''))}
        error={errors.age}
        keyboardType="number-pad"
        inputMode="numeric"
        maxLength={3}
        testID="patient-age"
      />
      <SegmentedControl<Sex>
        label="Sexo"
        options={[
          { value: 'F', label: 'Feminino' },
          { value: 'M', label: 'Masculino' },
        ]}
        value={sex}
        onChange={setSex}
        error={errors.sex}
      />
      {error != null && <ErrorNotice error={error} />}
    </Screen>
  )
}
