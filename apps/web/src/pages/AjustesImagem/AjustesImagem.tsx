import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button } from 'shared'
import styles from './AjustesImagem.module.css'

export default function AjustesImagem() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Ajustes da Imagem" />
      <div className={styles.content}>
        <div className={styles.imageArea}>
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageIcon}>🖼</span>
            <span className={styles.imageLabel}>Pré-visualização do ECG</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Brilho</span>
            <input type="range" className={styles.slider} />
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Contraste</span>
            <input type="range" className={styles.slider} />
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Rotação</span>
            <input type="range" className={styles.slider} />
          </div>
        </div>

        <Button fullWidth onPress={() => navigate('/ecg-viewer')}>
          Confirmar
        </Button>
      </div>
    </div>
  )
}
