import { useCallback, useState } from 'react'
import type { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { ApiError, colors } from 'shared'
import type { Attempt, Exam } from 'shared'
import { useAttemptDraft } from '../../flow/AttemptDraft'
import type { AppScreenProps } from '../../navigation/types'
import { LAYOUT_LABELS, SEX_LABELS, errorMessage, formatDateTime } from '../../ui/labels'

export type AttemptNavigation = AppScreenProps<'AttemptState'>['navigation']

/** O que cada tela de desfecho recebe do AttemptStateScreen. */
export interface AttemptViewProps {
  exam: Exam
  attempt: Attempt
  navigation: AttemptNavigation
  /** Reconsulta a tentativa (ex.: depois de um 409 ou de uma falha de rede). */
  reload: () => void
  /** Falha ao reconsultar (rede, fora do horário): aparece no topo sem perder a tela atual. */
  banner?: ReactNode
}

/** Nova tentativa no mesmo exame, já com a calibração da tentativa atual. */
export function useNewPhoto(exam: Exam, attempt: Attempt, navigation: AttemptNavigation) {
  const { start } = useAttemptDraft()
  return useCallback(() => {
    start(exam.id, exam.patient, attempt.calibration)
    navigation.navigate('Capture')
  }, [attempt.calibration, exam.id, exam.patient, navigation, start])
}

/**
 * Executa uma ação da tentativa (aceitar, recusar, tentar de novo). Um 409 significa que o estado mudou
 * por fora (outra aba, resposta perdida): em vez de erro, reconsulta e mostra a tela do estado atual.
 */
export function useAttemptAction(reload: () => void) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true)
      setError(null)
      try {
        await action()
      } catch (err) {
        if (err instanceof ApiError && err.kind === 'conflict') reload()
        else setError(errorMessage(err))
      } finally {
        setBusy(false)
      }
    },
    [reload],
  )
  return { busy, error, run }
}

/** Volta ao histórico do exame (ou o abre, se a tela veio de outro caminho). */
export function backToExam(navigation: AttemptNavigation, examId: string) {
  navigation.popTo('ExamDetail', { examId })
}

export function AttemptContext({ exam, attempt }: { exam: Exam; attempt: Attempt }) {
  const { patient } = exam
  return (
    <View style={styles.context}>
      <Text style={styles.patient}>{patient.name}</Text>
      <Text style={styles.meta}>
        {patient.age} anos{patient.sex ? ` · ${SEX_LABELS[patient.sex]}` : ''} · {LAYOUT_LABELS[attempt.layout]} ·{' '}
        {String(attempt.calibration.speed_mm_s).replace('.', ',')} mm/s · {attempt.calibration.gain_mm_mv} mm/mV
      </Text>
      <Text style={styles.meta}>Foto enviada em {formatDateTime(attempt.created_at)}</Text>
    </View>
  )
}

export const viewStyles = StyleSheet.create({
  title: { fontSize: 20, fontWeight: '700', color: colors.dark },
  text: { fontSize: 15, lineHeight: 22, color: colors.dark },
  muted: { fontSize: 13, color: colors.textMuted },
  section: { fontSize: 16, fontWeight: '700', color: colors.dark, marginTop: 4 },
  code: { fontSize: 12, color: colors.textMuted, fontFamily: 'monospace' },
})

const styles = StyleSheet.create({
  context: { gap: 2 },
  patient: { fontSize: 16, fontWeight: '700', color: colors.dark },
  meta: { fontSize: 13, color: colors.textMuted },
})
