import { Text } from 'react-native'
import { Button } from 'shared'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox } from '../../ui/Feedback'
import Screen from '../../ui/Screen'
import { AttemptContext, backToExam, useAttemptAction, useNewPhoto, viewStyles } from './common'
import type { AttemptViewProps } from './common'

const PHASE_TITLES = {
  erro_leitura: 'Erro na leitura',
  erro_interpretacao: 'Erro na interpretação',
} as const

/**
 * erro_leitura / erro_interpretacao: "Tentar de novo" reexecuta a fase na mesma tentativa quando o backend
 * permite (`can_retry`); senão a foto não serve e o caminho é uma nova tentativa.
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
              Tentar de novo
            </Button>
          ) : (
            <Button fullWidth onPress={newPhoto} testID="new-photo">
              Tirar nova foto
            </Button>
          )}
          <Button fullWidth variant="outline" disabled={busy} onPress={() => backToExam(navigation, exam.id)}>
            Voltar ao exame
          </Button>
        </>
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.title} accessibilityRole="header">
        ✕ {phase === 'erro_interpretacao' ? 'Não foi possível interpretar o ECG' : 'Não foi possível ler o ECG'}
      </Text>
      <Text style={viewStyles.text} testID="error-message">
        {contractError?.message ?? 'Ocorreu um erro inesperado no processamento.'}
      </Text>
      <InfoBox>
        {attempt.can_retry
          ? 'Foi uma falha temporária. A mesma foto pode ser processada de novo, sem precisar fotografar outra vez.'
          : 'Esta foto não pode ser processada. Tire uma nova foto do mesmo ECG: ela vira uma nova tentativa neste exame.'}
      </InfoBox>
      {contractError && <Text style={viewStyles.code}>Código: {contractError.code}</Text>}
      {error && <ErrorBanner message={error} />}
    </Screen>
  )
}
