import { Button } from 'shared'
import { InfoBox } from '../../ui/Feedback'
import Screen from '../../ui/Screen'
import { AttemptContext, backToExam, useNewPhoto } from './common'
import type { AttemptViewProps } from './common'

const TEXTS = {
  rejeitado_usuario: {
    title: 'Reading refused',
    box: 'You refused this reading',
    body: 'Take a new photo of the same ECG. It becomes a new attempt on this exam.',
  },
  criado: {
    title: 'Upload not completed',
    box: 'The photo for this attempt was never uploaded',
    body: 'Take or choose the photo again to continue this exam.',
  },
} as const

/** Attempts that ended without an outcome from the lambda: refused by the user or abandoned before upload. */
export default function NewPhotoView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const newPhoto = useNewPhoto(exam, attempt, navigation)
  const text = attempt.status === 'criado' ? TEXTS.criado : TEXTS.rejeitado_usuario

  return (
    <Screen
      title={text.title}
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
      <InfoBox title={text.box}>{text.body}</InfoBox>
    </Screen>
  )
}
