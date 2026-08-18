import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import styles from './PopupCupom.module.css'

interface PopupCupomProps {
  open: boolean
  onClose: () => void
}

export default function PopupCupom({ open, onClose }: PopupCupomProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <h2 className={styles.title}>Cupom de Desconto</h2>
        <p className={styles.description}>
          Utilize o cupom <strong>ECG10</strong> para ganhar 10% de desconto no seu primeiro mês!
        </p>
        <div className={styles.actions}>
          <Button fullWidth onClick={onClose}>Ok</Button>
        </div>
      </div>
    </Modal>
  )
}
