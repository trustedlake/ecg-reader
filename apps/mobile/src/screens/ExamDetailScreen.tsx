import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Button, colors } from 'shared'
import type { Exam } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import { DEFAULT_CALIBRATION } from '../flow/defaults'
import type { AppScreenProps } from '../navigation/types'
import { ErrorBanner, LoadingView, StatusBadge } from '../ui/Feedback'
import { LAYOUT_LABELS, SEX_LABELS, errorMessage, formatDateTime } from '../ui/labels'
import Screen from '../ui/Screen'

// PROVISÓRIA (F2): o histórico completo do exame é da etapa F3.
export default function ExamDetailScreen({ navigation, route }: AppScreenProps<'ExamDetail'>) {
  const { examId } = route.params
  const { api, config } = useApi()
  const { start } = useAttemptDraft()
  const [exam, setExam] = useState<Exam | null>(null)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setExam(await api.getExam(examId))
    } catch (err) {
      setError(errorMessage(err))
    }
  }, [api, examId])

  useFocusEffect(
    useCallback(() => {
      void load()
    }, [load]),
  )

  function newAttempt() {
    if (!exam) return
    start(exam.id, exam.patient, config?.calibration.default ?? DEFAULT_CALIBRATION)
    navigation.navigate('Capture')
  }

  return (
    <Screen
      title="Exame"
      onBack={() => navigation.goBack()}
      footer={
        exam ? (
          <Button fullWidth onPress={newAttempt}>
            Nova foto neste exame
          </Button>
        ) : undefined
      }
    >
      {error && <ErrorBanner message={error} onRetry={() => void load()} />}
      {!exam && !error && <LoadingView />}
      {exam && (
        <>
          <View style={styles.block}>
            <Text style={styles.name}>{exam.patient.name}</Text>
            <Text style={styles.meta}>
              {exam.patient.age} anos{exam.patient.sex ? ` · ${SEX_LABELS[exam.patient.sex]}` : ''}
            </Text>
            <StatusBadge status={exam.status} />
          </View>
          <Text style={styles.section}>Tentativas</Text>
          {(exam.attempts ?? []).length === 0 && <Text style={styles.meta}>Nenhuma foto enviada ainda.</Text>}
          {(exam.attempts ?? []).map((attempt, index, all) => (
            <Pressable
              key={attempt.id}
              onPress={() => navigation.navigate('AttemptState', { examId, attemptId: attempt.id })}
              accessibilityRole="button"
              accessibilityLabel={`Tentativa ${all.length - index}`}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text style={styles.cardTitle}>
                Tentativa {all.length - index} · {LAYOUT_LABELS[attempt.layout]}
              </Text>
              <Text style={styles.meta}>{formatDateTime(attempt.created_at)}</Text>
              <StatusBadge status={attempt.status} />
            </Pressable>
          ))}
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  block: { gap: 6 },
  name: { fontSize: 22, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 14, color: colors.textMuted },
  section: { fontSize: 16, fontWeight: '700', color: colors.dark, marginTop: 8 },
  card: { gap: 6, padding: 14, borderRadius: 12, borderWidth: 1, borderColor: colors.gridBorder },
  pressed: { backgroundColor: colors.background },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.dark },
})
