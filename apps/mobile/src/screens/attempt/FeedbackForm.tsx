import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button, CheckboxGroup, colors } from 'shared'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox } from '../../ui/Feedback'
import { errorMessage } from '../../ui/labels'
import TextField from '../../ui/TextField'

const ISSUES = [
  { value: 'not-recognized', label: 'Parte do ECG não foi reconhecida.' },
  { value: 'wrong-trace', label: 'O traçado extraído não acompanha o do papel.' },
  { value: 'wrong-measurement', label: 'Alguma medida parece errada.' },
  { value: 'wrong-interpretation', label: 'A interpretação não condiz com o ECG.' },
  { value: 'other', label: 'Outro.' },
]

/** Feedback do usuário sobre a tentativa (POST /api/attempts/<id>/feedback/). */
export default function FeedbackForm({ attemptId, onClose }: { attemptId: string; onClose: () => void }) {
  const { api } = useApi()
  const [issues, setIssues] = useState<string[]>([])
  const [description, setDescription] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const canSend = (issues.length > 0 || description.trim() !== '') && !sending

  async function send() {
    setSending(true)
    setError(null)
    try {
      await api.sendFeedback(attemptId, { issues, description: description.trim() })
      setSent(true)
    } catch (err) {
      setError(errorMessage(err))
    } finally {
      setSending(false)
    }
  }

  if (sent) {
    return (
      <View style={styles.box} testID="feedback-sent">
        <InfoBox title="✓ Feedback enviado">Obrigado! Ele ajuda a melhorar a leitura e a interpretação.</InfoBox>
        <Button fullWidth variant="outline" onPress={onClose}>
          Fechar
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.box} testID="feedback-form">
      <Text style={styles.title}>O que não ficou certo?</Text>
      <CheckboxGroup options={ISSUES} values={issues} onChange={setIssues} />
      <TextField
        label="Comentário (opcional)"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={2000}
        testID="feedback-description"
      />
      {error && <ErrorBanner message={error} />}
      <Button fullWidth disabled={!canSend} loading={sending} onPress={() => void send()} testID="feedback-send">
        Enviar
      </Button>
      <Button fullWidth variant="text" disabled={sending} onPress={onClose}>
        Cancelar
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { gap: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.gridBorder },
  title: { fontSize: 16, fontWeight: '700', color: colors.dark },
})
