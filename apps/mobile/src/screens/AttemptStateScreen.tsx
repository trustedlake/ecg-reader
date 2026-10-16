import { useCallback, useState } from 'react'
import { ScrollView, StyleSheet, Text } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Button, colors } from 'shared'
import type { Attempt } from 'shared'
import { useApi } from '../api/ApiProvider'
import type { AppScreenProps } from '../navigation/types'
import { ErrorBanner, LoadingView, StatusBadge } from '../ui/Feedback'
import { errorMessage } from '../ui/labels'
import Screen from '../ui/Screen'

// PROVISÓRIA (F2): mostra o JSON da tentativa. As telas de validação, recusa, erro e resultado são da F3.
export default function AttemptStateScreen({ navigation, route }: AppScreenProps<'AttemptState'>) {
  const { examId, attemptId } = route.params
  const { api } = useApi()
  const [attempt, setAttempt] = useState<Attempt | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setAttempt(await api.getAttempt(examId, attemptId))
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [api, examId, attemptId])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

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
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      {!attempt && !error && <LoadingView />}
      {attempt && (
        <>
          <StatusBadge status={attempt.status} />
          <Text style={styles.note}>Tela provisória (F2): o estado completo da tentativa.</Text>
          <ScrollView horizontal style={styles.jsonBox}>
            <Text style={styles.json} selectable>
              {JSON.stringify(attempt, null, 2)}
            </Text>
          </ScrollView>
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  note: { fontSize: 13, color: colors.textMuted },
  jsonBox: { borderRadius: 8, backgroundColor: '#1d2a21' },
  json: { padding: 12, fontFamily: 'monospace', fontSize: 11, color: '#e8f0e4' },
})
