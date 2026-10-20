import { Text } from 'react-native'
import { Button } from 'shared'
import { InfoBox } from '../../ui/Feedback'
import { REFUSAL_TIPS, REFUSAL_TIP_FALLBACK } from '../../ui/labels'
import Screen from '../../ui/Screen'
import ZoomableImage from '../../ui/ZoomableImage'
import { AttemptContext, backToExam, useNewPhoto, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** leitura_recusada: the lambda refused the photo (blurry, cropped, occluded…). The only option left is to take another. */
export default function RefusedView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const newPhoto = useNewPhoto(exam, attempt, navigation)
  const reading = attempt.reading
  const error = reading?.error
  const tip = (error && REFUSAL_TIPS[error.code]) ?? REFUSAL_TIP_FALLBACK
  // The preview already comes with the region marked; without it, the region is drawn over the original photo.
  const preview = reading?.refusal_preview_url
  const image = preview ?? attempt.original_image_url
  const highlight = preview ? null : reading?.refusal_region_px

  return (
    <Screen
      title="Photo refused"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        <>
          <Button fullWidth onPress={newPhoto} testID="new-photo">
            Take a new photo
          </Button>
          <Button fullWidth variant="outline" onPress={() => backToExam(navigation, exam.id)}>
            Back to exam
          </Button>
        </>
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.title} accessibilityRole="header">
        ✕ Could not read this photo
      </Text>
      <Text style={viewStyles.text} testID="refusal-message">
        {error?.message ?? 'The photo is not good enough quality to be read.'}
      </Text>

      {image && (
        <ZoomableImage
          uri={image}
          highlight={highlight}
          highlightLabel="Problem region"
          accessibilityLabel="Submitted photo with the problem region highlighted"
          testID="refusal-preview"
        />
      )}

      <InfoBox title="How to take the next photo">{tip}</InfoBox>
      {error && <Text style={viewStyles.code}>Code: {error.code}</Text>}
    </Screen>
  )
}
