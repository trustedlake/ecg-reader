import { useCallback, useEffect, useState } from 'react'
import { useFocusEffect } from '@react-navigation/native'
import { Button, isProcessing } from 'shared'
import type { Attempt, Exam } from 'shared'
import { useApi } from '../api/ApiProvider'
import type { AppScreenProps } from '../navigation/types'
import { ErrorNotice, LoadingView } from '../ui/Feedback'
import Screen from '../ui/Screen'
import ErrorView from './attempt/ErrorView'
import NewPhotoView from './attempt/NewPhotoView'
import RefusedView from './attempt/RefusedView'
import ResultView from './attempt/ResultView'
import ValidationView from './attempt/ValidationView'
import type { AttemptViewProps } from './attempt/common'

/**
 * Tela de uma tentativa: carrega o estado no servidor e mostra o desfecho certo (docs/fluxo-usuario-v1.md §4).
 * Ao reabrir o app no meio do fluxo, a tentativa sempre leva à tela do estado atual.
 */
export default function AttemptStateScreen({ navigation, route }: AppScreenProps<'AttemptState'>) {
  const { examId, attemptId } = route.params
  const { api } = useApi()
  const [data, setData] = useState<{ exam: Exam; attempt: Attempt } | null>(null)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      const [exam, attempt] = await Promise.all([api.getExam(examId), api.getAttempt(examId, attemptId)])
      setData({ exam, attempt })
    } catch (err) {
      // Falha de rede não apaga a tentativa já carregada: o banner oferece reconsultar.
      setError(err)
    }
  }, [api, examId, attemptId])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  const status = data?.attempt.status
  useEffect(() => {
    // Ainda processando (ex.: saiu e voltou): a tela de processamento acompanha até o desfecho.
    if (status && isProcessing(status)) navigation.replace('Processing', { examId, attemptId })
  }, [attemptId, examId, navigation, status])

  if (!data || isProcessing(data.attempt.status)) {
    return (
      <Screen
        title="Tentativa"
        onBack={() => navigation.goBack()}
        footer={
          <Button fullWidth variant="outline" onPress={() => navigation.popToTop()}>
            Voltar aos exames
          </Button>
        }
      >
        {error != null ? <ErrorNotice error={error} onRetry={() => void load()} /> : <LoadingView />}
      </Screen>
    )
  }

  const props: AttemptViewProps = { ...data, navigation, reload: () => void load() }
  const banner = error != null ? <ErrorNotice error={error} onRetry={() => void load()} /> : null

  switch (data.attempt.status) {
    case 'aguardando_validacao':
      return <ValidationView {...props} banner={banner} />
    case 'leitura_recusada':
      return <RefusedView {...props} banner={banner} />
    case 'erro_leitura':
    case 'erro_interpretacao':
      return <ErrorView {...props} banner={banner} />
    case 'concluido':
      return <ResultView {...props} banner={banner} />
    default:
      return <NewPhotoView {...props} banner={banner} />
  }
}
