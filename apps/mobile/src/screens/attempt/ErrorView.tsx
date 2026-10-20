import { Text } from 'react-native'
import { Button } from 'shared'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox } from '../../ui/Feedback'
import Screen from '../../ui/Screen'
import { AttemptContext, backToExam, useAttemptAction, useNewPhoto, viewStyles } from './common'
import type { AttemptViewProps } from './common'

const PHASE_TITLES = {
  erro_leitura: 'Reading error',
  erro_interpretacao: 'Interpretation error',
} as const

/**
 * erro_leitura / erro_interpretacao: "Try again" reruns the phase on the same attempt when the backend
 * allows it (`can_retry`); otherwise the photo is unusable and the way forward is a new attempt.
 */
export default function ErrorView({ exam, attempt, navigation, reload, banner }: AttemptViewProps) {
  const { api } = useApi()
  const { busy, error, run } = useAttemptAction(reload)
  const newPhoto = useNewPhoto(exam, attempt, navigation)
  const phase = attempt.status === 'erro_interpretacao' ? 'erro_interpretacao' : 'erro_leitura'
  const contractError = phase === 'erro_interpretacao' ? attempt.interpretation?.error : attempt.reading?.error

  const retry = () =>
    run(async () => {
      await api.retry(exam.id, attempt.id)
      navigation.replace('Processing', { examId: exam.id, attemptId: attempt.id })
    })

  return (
    <Screen
      title={PHASE_TITLES[phase]}
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        <>
          {attempt.can_retry ? (
            <Button fullWidth loading={busy} onPress={() => void retry()} testID="retry">
              Try again
            </Button>
          ) : (
            <Button fullWidth onPress={newPhoto} testID="new-photo">
              Take a new photo
            </Button>
          )}
          <Button fullWidth variant="outline" disabled={busy} onPress={() => backToExam(navigation, exam.id)}>
            Back to exam
          </Button>
        </>
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.title} accessibilityRole="header">
        ✕ {phase === 'erro_interpretacao' ? 'Could not interpret the ECG' : 'Could not read the ECG'}
      </Text>
      <Text style={viewStyles.text} testID="error-message">
        {contractError?.message ?? 'An unexpected error occurred during processing.'}
      </Text>
      <InfoBox>
        {attempt.can_retry
          ? 'This was a temporary failure. The same photo can be processed again without taking another one.'
          : 'This photo cannot be processed. Take a new photo of the same ECG: it becomes a new attempt on this exam.'}
      </InfoBox>
      {contractError && <Text style={viewStyles.code}>Code: {contractError.code}</Text>}
      {error && <ErrorBanner message={error} />}
    </Screen>
  )
}
