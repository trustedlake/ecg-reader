import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import styles from './PopupImagemLida2.module.css'

interface PopupImagemLida2Props {
  open: boolean
  onClose: () => void
}

export default function PopupImagemLida2({ open, onClose }: PopupImagemLida2Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.icon}>!</div>
        <h2 className={styles.title}>Atenção</h2>
        <p className={styles.description}>
          Algumas partes da imagem não foram reconhecidas corretamente.
          Deseja ajustar a imagem?
        </p>
        <div className={styles.actions}>
          <Button fullWidth onClick={onClose}>Ajustar Imagem</Button>
          <Button variant="text" onClick={onClose}>Continuar mesmo assim</Button>
        </div>
      </div>
    </Modal>
  )
}
