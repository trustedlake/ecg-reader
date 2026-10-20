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

/** aguardando_validacao: the user checks the overlay (grid + trace) and accepts or refuses the reading. */
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
      reload() // rejeitado_usuario → NewPhotoView offers the new photo
    })

  return (
    <Screen
      title="Check the reading"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        confirmingReject ? (
          <View style={styles.confirm} accessibilityRole="alert">
            <Text style={styles.confirmText}>Refuse this reading? You will need to take another photo.</Text>
            <Button fullWidth variant="danger" loading={busy} onPress={() => void reject()} testID="reject-confirm">
              Yes, refuse
            </Button>
            <Button fullWidth variant="outline" disabled={busy} onPress={() => setConfirmingReject(false)}>
              Cancel
            </Button>
          </View>
        ) : (
          <>
            <Button fullWidth loading={busy} onPress={() => void accept()} testID="accept">
              Accept reading
            </Button>
            <Button fullWidth variant="outline" disabled={busy} onPress={() => setConfirmingReject(true)} testID="reject">
              Refuse
            </Button>
          </>
        )
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.text}>
        The lines drawn over the photo show the grid and the trace the system extracted. Zoom in and check that the
        trace matches the one on the paper in every lead before accepting.
      </Text>

      {image ? (
        <ZoomableImage uri={image} accessibilityLabel="ECG photo with the grid and the extracted trace" testID="overlay" />
      ) : (
        <InfoBox>The reading image is not available right now. Refresh the screen to try again.</InfoBox>
      )}

      {reading && <WarningList title="Reading warnings" warnings={reading.warnings} />}

      {reading && reading.leads.length > 0 && (
        <View style={styles.leads}>
          <Text style={viewStyles.section}>Quality per lead</Text>
          <View style={styles.chips}>
            {reading.leads.map((lead) => {
              const quality = LEAD_QUALITY_LABELS[lead.quality]
              const name = lead.kind === 'rhythm' ? `${lead.name} (rhythm)` : lead.name
              return (
                <View key={`${lead.name}-${lead.kind}`} style={styles.chip} accessibilityLabel={`${name}: ${quality.label} quality`}>
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
