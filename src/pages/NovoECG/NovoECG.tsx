import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import styles from './NovoECG.module.css'

export default function NovoECG() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Header title="Novo ECG" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>1. Capturar Imagem do ECG</h2>

        <div className={styles.cameraArea}>
          <div className={styles.cameraButton}>
            <span className={styles.cameraIcon}>+</span>
          </div>
          <p className={styles.cameraLabel}>Toque para fotografar o ECG</p>
          <p className={styles.cameraSub}>Inserir foto do exame</p>
        </div>

        <div className={styles.actions}>
          <Button fullWidth onClick={() => navigate('/config-ecg')}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
