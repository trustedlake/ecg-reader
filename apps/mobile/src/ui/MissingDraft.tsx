import { Button } from 'shared'
import { ErrorBanner } from './Feedback'
import Screen from './Screen'

/** O rascunho vive em memória: se a página web foi recarregada no meio do fluxo, recomeça pela lista. */
export default function MissingDraft({ onBack }: { onBack: () => void }) {
  return (
    <Screen title="Nova tentativa">
      <ErrorBanner message="Os dados desta tentativa se perderam (a página foi recarregada). Abra o exame de novo na lista." />
      <Button fullWidth onPress={onBack}>
        Ir para os exames
      </Button>
    </Screen>
  )
}
