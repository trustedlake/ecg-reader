import { Text } from 'react-native'
import { Button } from 'shared'
import { InfoBox } from '../../ui/Feedback'
import { REFUSAL_TIPS, REFUSAL_TIP_FALLBACK } from '../../ui/labels'
import Screen from '../../ui/Screen'
import ZoomableImage from '../../ui/ZoomableImage'
import { AttemptContext, backToExam, useNewPhoto, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** leitura_recusada: a lambda recusou a foto (borrada, cortada, ocluída…). Só resta tirar outra. */
export default function RefusedView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const newPhoto = useNewPhoto(exam, attempt, navigation)
  const reading = attempt.reading
  const error = reading?.error
  const tip = (error && REFUSAL_TIPS[error.code]) ?? REFUSAL_TIP_FALLBACK
  // A prévia já vem com a região marcada; sem ela, a região é desenhada sobre a foto original.
  const preview = reading?.refusal_preview_url
  const image = preview ?? attempt.original_image_url
  const highlight = preview ? null : reading?.refusal_region_px

  return (
    <Screen
      title="Foto recusada"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        <>
          <Button fullWidth onPress={newPhoto} testID="new-photo">
            Tirar nova foto
          </Button>
          <Button fullWidth variant="outline" onPress={() => backToExam(navigation, exam.id)}>
            Voltar ao exame
          </Button>
        </>
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />
      <Text style={viewStyles.title} accessibilityRole="header">
        ✕ Não foi possível ler esta foto
      </Text>
      <Text style={viewStyles.text} testID="refusal-message">
        {error?.message ?? 'A foto não tem qualidade suficiente para a leitura.'}
      </Text>

      {image && (
        <ZoomableImage
          uri={image}
          highlight={highlight}
          highlightLabel="Região com problema"
          accessibilityLabel="Foto enviada com a região do problema destacada"
          testID="refusal-preview"
        />
      )}

      <InfoBox title="Como tirar a próxima foto">{tip}</InfoBox>
      {error && <Text style={viewStyles.code}>Código: {error.code}</Text>}
    </Screen>
  )
}
