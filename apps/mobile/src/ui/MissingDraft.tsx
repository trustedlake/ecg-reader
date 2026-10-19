import { useEffect } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../navigation/types'
import { LoadingView } from './Feedback'

/**
 * O rascunho vive em memória. Sem ele (página web recarregada no meio do fluxo, ou "voltar" do navegador
 * depois de a foto já ter sido enviada), as telas de foto, layout e processamento voltam para o exame.
 */
export default function MissingDraft({
  examId,
  navigation,
}: {
  examId: string
  navigation: NativeStackNavigationProp<AppStackParamList>
}) {
  useEffect(() => {
    // Adiado: aberta direto pela URL, a tela monta antes de o navegador aceitar ações.
    const timer = setTimeout(() => {
      // popTo não faz nada se o exame não está na pilha (ex.: URL aberta direto): aí troca a tela atual.
      const inStack = navigation.getState().routes.some((r) => r.name === 'ExamDetail')
      if (inStack) navigation.popTo('ExamDetail', { examId })
      else navigation.replace('ExamDetail', { examId })
    }, 0)
    return () => clearTimeout(timer)
  }, [examId, navigation])
  return <LoadingView />
}
