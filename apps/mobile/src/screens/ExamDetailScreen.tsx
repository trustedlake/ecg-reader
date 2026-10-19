import { useCallback, useState } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { Button, colors } from 'shared'
import type { Attempt, Exam } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import { DEFAULT_CALIBRATION } from '../flow/defaults'
import type { AppScreenProps } from '../navigation/types'
import { ErrorNotice, LoadingView, StatusBadge } from '../ui/Feedback'
import { CLASSIFICATION_LABELS, LAYOUT_LABELS, SEX_LABELS, STATUS_LABELS, formatDateTime } from '../ui/labels'
import Screen from '../ui/Screen'

/** Uma linha sobre o desfecho, para o histórico: classificação, motivo da recusa ou do erro. */
function outcomeLine(attempt: Attempt): string | null {
  if (attempt.status === 'concluido') {
    const summary = attempt.interpretation?.summary
    return summary ? `${CLASSIFICATION_LABELS[summary.classification].label} · ${summary.headline}` : null
  }
  if (attempt.status === 'erro_interpretacao') return attempt.interpretation?.error?.message ?? null
  if (attempt.status === 'leitura_recusada' || attempt.status === 'erro_leitura') return attempt.reading?.error?.message ?? null
  return null
}

/** Histórico do exame: cada tentativa abre a tela do seu estado atual (AttemptState decide qual). */
export default function ExamDetailScreen({ navigation, route }: AppScreenProps<'ExamDetail'>) {
  const { examId } = route.params
  const { api, config } = useApi()
  const { start } = useAttemptDraft()
  const [exam, setExam] = useState<Exam | null>(null)
  const [error, setError] = useState<unknown>(null)

  const load = useCallback(async () => {
    setError(null)
    try {
      setExam(await api.getExam(examId))
    } catch (err) {
      setError(err)
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
      {error != null && <ErrorNotice error={error} onRetry={() => void load()} />}
      {!exam && error == null && <LoadingView />}
      {exam && (
        <>
          <View style={styles.block}>
            <Text style={styles.name}>{exam.patient.name}</Text>
            <Text style={styles.meta}>
              {exam.patient.age} anos{exam.patient.sex ? ` · ${SEX_LABELS[exam.patient.sex]}` : ''}
            </Text>
            {exam.reason ? <Text style={styles.meta}>Motivo: {exam.reason}</Text> : null}
            <StatusBadge status={exam.status} />
          </View>
          <Text style={styles.section}>Tentativas</Text>
          {(exam.attempts ?? []).length === 0 && <Text style={styles.meta}>Nenhuma foto enviada ainda.</Text>}
          {(exam.attempts ?? []).map((attempt, index, all) => (
            <Pressable
              key={attempt.id}
              onPress={() => navigation.navigate('AttemptState', { examId, attemptId: attempt.id })}
              accessibilityRole="button"
              accessibilityLabel={`Tentativa ${all.length - index}: ${STATUS_LABELS[attempt.status]}`}
              style={({ pressed }) => [styles.card, pressed && styles.pressed]}
            >
              <Text style={styles.cardTitle}>
                Tentativa {all.length - index} · {LAYOUT_LABELS[attempt.layout]}
              </Text>
              <Text style={styles.meta}>{formatDateTime(attempt.created_at)}</Text>
              <StatusBadge status={attempt.status} />
              {outcomeLine(attempt) && (
                <Text style={styles.outcome} numberOfLines={2}>
                  {outcomeLine(attempt)}
                </Text>
              )}
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
  outcome: { fontSize: 14, color: colors.dark },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.dark },
})
