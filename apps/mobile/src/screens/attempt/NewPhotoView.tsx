import { Button } from 'shared'
import { InfoBox } from '../../ui/Feedback'
import Screen from '../../ui/Screen'
import { AttemptContext, backToExam, useNewPhoto } from './common'
import type { AttemptViewProps } from './common'

const TEXTS = {
  rejeitado_usuario: {
    title: 'Leitura recusada',
    box: 'Você recusou esta leitura',
    body: 'Tire uma nova foto do mesmo ECG. Ela vira uma nova tentativa neste exame.',
  },
  criado: {
    title: 'Envio não concluído',
    box: 'A foto desta tentativa não chegou a ser enviada',
    body: 'Tire ou escolha a foto de novo para continuar este exame.',
  },
} as const

/** Tentativas encerradas sem desfecho da lambda: recusada pelo usuário ou abandonada antes do envio. */
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
      <InfoBox title={text.box}>{text.body}</InfoBox>
    </Screen>
  )
}
