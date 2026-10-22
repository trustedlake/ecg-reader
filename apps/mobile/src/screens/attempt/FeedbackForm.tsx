import { useState } from 'react'
import { StyleSheet, View } from 'react-native'
import { Text } from '../../ui/Text'
import { CheckboxGroup, colors } from 'shared'
import Button from '../../ui/Button'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox } from '../../ui/Feedback'
import { errorMessage } from '../../ui/labels'
import TextField from '../../ui/TextField'

const ISSUES = [
  { value: 'not-recognized', label: 'Part of the ECG was not recognized.' },
  { value: 'wrong-trace', label: 'The extracted trace does not match the one on the paper.' },
  { value: 'wrong-measurement', label: 'A measurement looks wrong.' },
  { value: 'wrong-interpretation', label: 'The interpretation does not match the ECG.' },
  { value: 'other', label: 'Other.' },
]

/** User feedback about the attempt (POST /api/attempts/<id>/feedback/). */
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
        <InfoBox title="✓ Feedback sent">Thank you! It helps improve the reading and the interpretation.</InfoBox>
        <Button fullWidth variant="outline" onPress={onClose}>
          Close
        </Button>
      </View>
    )
  }

  return (
    <View style={styles.box} testID="feedback-form">
      <Text style={styles.title}>What was not right?</Text>
      <CheckboxGroup options={ISSUES} values={issues} onChange={setIssues} />
      <TextField
        label="Comment (optional)"
        value={description}
        onChangeText={setDescription}
        multiline
        maxLength={2000}
        testID="feedback-description"
      />
      {error && <ErrorBanner message={error} />}
      <Button fullWidth disabled={!canSend} loading={sending} onPress={() => void send()} testID="feedback-send">
        Send
      </Button>
      <Button fullWidth variant="text" disabled={sending} onPress={onClose}>
        Cancel
      </Button>
    </View>
  )
}

const styles = StyleSheet.create({
  box: { gap: 12, padding: 14, borderRadius: 10, borderWidth: 1, borderColor: colors.gridBorder },
  title: { fontSize: 16, fontWeight: '700', color: colors.dark },
})
