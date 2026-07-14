import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import styles from './PopupSentimosMuito.module.css'

interface PopupSentimosMuitoProps {
  open: boolean
  onClose: () => void
  onSendFeedback?: () => void
}

export default function PopupSentimosMuito({ open, onClose, onSendFeedback }: PopupSentimosMuitoProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.icon}>:(</div>
        <h2 className={styles.title}>Sentimos Muito</h2>
        <p className={styles.description}>
          Não foi possível processar a imagem do ECG. Por favor, tente novamente
          ou entre em contato com o suporte.
        </p>
        <div className={styles.actions}>
          <Button fullWidth onClick={onClose}>Tentar Novamente</Button>
          {onSendFeedback && (
            <Button variant="text" onClick={onSendFeedback}>Enviar Feedback</Button>
          )}
        </div>
      </div>
    </Modal>
  )
}
