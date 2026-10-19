import { useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { Button, colors } from 'shared'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox, Tag, WarningList } from '../../ui/Feedback'
import { LEAD_QUALITY_LABELS } from '../../ui/labels'
import Screen from '../../ui/Screen'
import ZoomableImage from '../../ui/ZoomableImage'
import { AttemptContext, backToExam, useAttemptAction, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** aguardando_validacao: o usuário confere o overlay (grade + traço) e aceita ou recusa a leitura. */
export default function ValidationView({ exam, attempt, navigation, reload, banner }: AttemptViewProps) {
  const { api } = useApi()
  const { busy, error, run } = useAttemptAction(reload)
  const [confirmingReject, setConfirmingReject] = useState(false)
  const reading = attempt.reading
  const image = reading?.overlay_url ?? attempt.original_image_url

  const accept = () =>
    run(async () => {
      await api.accept(exam.id, attempt.id)
      navigation.replace('Processing', { examId: exam.id, attemptId: attempt.id })
    })

  const reject = () =>
    run(async () => {
      await api.reject(exam.id, attempt.id)
      setConfirmingReject(false)
      reload() // rejeitado_usuario → NewPhotoView oferece a nova foto
    })

  return (
    <Screen
      title="Confira a leitura"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        confirmingReject ? (
          <View style={styles.confirm} accessibilityRole="alert">
            <Text style={styles.confirmText}>Recusar esta leitura? Você vai precisar tirar outra foto.</Text>
            <Button fullWidth variant="danger" loading={busy} onPress={() => void reject()} testID="reject-confirm">
              Sim, recusar
            </Button>
            <Button fullWidth variant="outline" disabled={busy} onPress={() => setConfirmingReject(false)}>
              Cancelar
            </Button>
          </View>
        ) : (
          <>
            <Button fullWidth loading={busy} onPress={() => void accept()} testID="accept">
              Aceitar leitura
            </Button>
            <Button fullWidth variant="outline" disabled={busy} onPress={() => setConfirmingReject(true)} testID="reject">
              Recusar
            </Button>
          </>
        )
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.text}>
        As linhas desenhadas por cima da foto mostram a grade e o traçado que o sistema extraiu. Amplie e confira se o
        traçado acompanha o do papel em todas as derivações antes de aceitar.
      </Text>

      {image ? (
        <ZoomableImage uri={image} accessibilityLabel="Foto do ECG com a grade e o traçado extraído" testID="overlay" />
      ) : (
        <InfoBox>A imagem da leitura não está disponível no momento. Atualize a tela para tentar de novo.</InfoBox>
      )}

      {reading && <WarningList title="Avisos da leitura" warnings={reading.warnings} />}

      {reading && reading.leads.length > 0 && (
        <View style={styles.leads}>
          <Text style={viewStyles.section}>Qualidade por derivação</Text>
          <View style={styles.chips}>
            {reading.leads.map((lead) => {
              const quality = LEAD_QUALITY_LABELS[lead.quality]
              const name = lead.kind === 'rhythm' ? `${lead.name} (ritmo)` : lead.name
              return (
                <View key={`${lead.name}-${lead.kind}`} style={styles.chip} accessibilityLabel={`${name}: qualidade ${quality.label}`}>
                  <Text style={styles.chipName}>{name}</Text>
                  <Tag label={quality.label} icon={quality.icon} tone={quality.tone} />
                </View>
              )
            })}
          </View>
        </View>
      )}

      {error && <ErrorBanner message={error} />}
    </Screen>
  )
}

const styles = StyleSheet.create({
  leads: { gap: 8 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingLeft: 10,
    paddingRight: 4,
    paddingVertical: 4,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colors.gridBorder,
  },
  chipName: { fontSize: 14, fontWeight: '700', color: colors.dark },
  confirm: { gap: 8 },
  confirmText: { fontSize: 15, fontWeight: '600', color: colors.dark, textAlign: 'center' },
})
