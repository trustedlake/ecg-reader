import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import styles from './PopupImagemLida.module.css'

interface PopupImagemLidaProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export default function PopupImagemLida({ open, onClose, onConfirm }: PopupImagemLidaProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.icon}>✓</div>
        <h2 className={styles.title}>Imagem Lida</h2>
        <p className={styles.description}>
          A imagem do ECG foi processada com sucesso.
        </p>
        <div className={styles.actions}>
          <Button fullWidth onClick={onConfirm ?? onClose}>Continuar</Button>
          <Button variant="text" onClick={onClose}>Cancelar</Button>
        </div>
      </div>
    </Modal>
  )
}
