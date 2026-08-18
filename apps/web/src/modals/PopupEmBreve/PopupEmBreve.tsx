import Modal from '../../components/Modal/Modal'
import Button from '../../components/Button/Button'
import styles from './PopupEmBreve.module.css'

interface PopupEmBreveProps {
  open: boolean
  onClose: () => void
}

export default function PopupEmBreve({ open, onClose }: PopupEmBreveProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <div className={styles.content}>
        <div className={styles.icon}>
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
        </div>
        <h2 className={styles.title}>Novidade a caminho</h2>
        <p className={styles.description}>
          O Leitor ECG ainda está em fase de testes. A criação de novos exames
          está liberada apenas para a equipe interna por enquanto, mas logo
          estará disponível pra todos os usuários.
        </p>
        <div className={styles.actions}>
          <Button fullWidth onClick={onClose}>Entendi</Button>
        </div>
      </div>
    </Modal>
  )
}
