import { useEffect, useMemo, useRef, useState } from 'react'
import { Image, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '../../ui/Text'
import { colors } from 'shared'
import Button from '../../ui/Button'
import { useApi } from '../../api/ApiProvider'
import { ErrorBanner, InfoBox } from '../../ui/Feedback'
import Screen from '../../ui/Screen'
import ZoomableImage from '../../ui/ZoomableImage'
import { AttemptContext, backToExam, useAttemptAction, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** awaiting_validation: the user checks the overlay (grid + trace) and accepts or refuses the reading. */
export default function ValidationView({ exam, attempt, navigation, reload, banner }: AttemptViewProps) {
  const { api } = useApi()
  const { busy, error, run } = useAttemptAction(reload)
  const [confirmingReject, setConfirmingReject] = useState(false)
  const reading = attempt.reading
  // The extractor's variants, best score first; the score is never shown.
  const variants = useMemo(
    () => [...(reading?.variants ?? [])].sort((a, b) => b.score - a.score),
    [reading?.variants],
  )
  const [page, setPage] = useState(0)
  const variant = variants[page]
  const strip = useRef<ScrollView>(null)
  // Keeps the selected thumbnail in view when the reading changes by swipe or arrows.
  useEffect(() => {
    strip.current?.scrollTo({ x: Math.max(0, page * 112 - 112), animated: false })
  }, [page])
  const image = variant?.overlay_url ?? reading?.overlay_url ?? attempt.original_image_url

  const accept = () =>
    run(async () => {
      await api.accept(exam.id, attempt.id, variant?.id)
      navigation.replace('Processing', { examId: exam.id, attemptId: attempt.id })
    })

  const reject = () =>
    run(async () => {
      await api.reject(exam.id, attempt.id)
      setConfirmingReject(false)
      reload() // user_rejected → NewPhotoView offers the new photo
    })

  return (
    <Screen
      title=""
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
              {variants.length > 1 ? `Accept reading ${page + 1} of ${variants.length}` : 'Accept reading'}
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
        The lines drawn over the photo show the grid and the trace the system extracted. Open it full screen and check that the
        trace matches the one on the paper in every lead before accepting.
      </Text>

      {image ? (
        <ZoomableImage
          uri={image}
          accessibilityLabel="ECG photo with the grid and the extracted trace"
          pageCount={variants.length}
          page={page}
          onPageChange={setPage}
          testID="overlay"
        />
      ) : (
        <InfoBox>The reading image is not available right now. Refresh the screen to try again.</InfoBox>
      )}

      {variants.length > 1 && (
        <View style={styles.variants}>
          <ScrollView ref={strip} horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.strip} testID="variants-strip">
            {variants.map((item, index) => (
              <Pressable
                key={item.id}
                onPress={() => setPage(index)}
                style={[styles.thumb, index === page && styles.thumbActive]}
                accessibilityRole="button"
                accessibilityState={{ selected: index === page }}
                accessibilityLabel={`Reading ${index + 1} of ${variants.length}`}
                testID={`variant-thumb-${index}`}
              >
                <Image source={{ uri: item.overlay_url }} style={styles.thumbImage} resizeMode="cover" />
                <Text style={[styles.thumbLabel, index === page && styles.thumbLabelActive]}>
                  {index === page ? '✓ Selected' : index === 0 ? 'Best' : `#${index + 1}`}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
          <Text style={viewStyles.text} testID="variants-note">
            We sorted the readings from best to worst for you. Swipe the image, use the arrows in full screen or tap a
            thumbnail to compare them. The selected one is used when you accept.
          </Text>
        </View>
      )}

      {error && <ErrorBanner message={error} />}
    </Screen>
  )
}

const styles = StyleSheet.create({
  variants: { gap: 8 },
  strip: { gap: 8, paddingVertical: 2 },
  thumb: {
    width: 104,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: colors.gridBorder,
    overflow: 'hidden',
    backgroundColor: colors.white,
  },
  thumbActive: { borderColor: colors.primary },
  thumbImage: { width: '100%', height: 64, backgroundColor: '#1d2a21' },
  thumbLabel: { fontSize: 12, fontWeight: '600', color: colors.textMuted, textAlign: 'center', paddingVertical: 4 },
  thumbLabelActive: { color: colors.white, backgroundColor: colors.primary },
  confirm: { gap: 8 },
  confirmText: { fontSize: 15, fontWeight: '600', color: colors.dark, textAlign: 'center' },
})
