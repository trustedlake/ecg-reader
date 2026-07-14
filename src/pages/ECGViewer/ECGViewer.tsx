import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import ParamCard from '../../components/ParamCard/ParamCard'
import Button from '../../components/Button/Button'
import styles from './ECGViewer.module.css'

const measurements = [
  { label: 'FC (bpm)', value: '76' },
  { label: 'PR (ms)', value: '152' },
  { label: 'QRS (ms)', value: '98' },
  { label: 'QT (ms)', value: '386' },
  { label: 'QTc (ms)', value: '412', color: '#4caf50' },
  { label: 'Eixo (°)', value: '+62' },
]

export default function ECGViewer() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Header
        title="Carlos Oliveira"
        rightAction={{ label: '···', onClick: () => {} }}
        showBack
      />

      <div className={styles.content}>
        <div className={styles.gridArea}>
          <div className={styles.gridBg}>
            <span className={styles.detectedText}>Imagem Detectada</span>
            <span className={styles.checkIcon}>✓</span>
          </div>
        </div>

        <div className={styles.measurementsBar}>
          {measurements.slice(0, 3).map((m) => (
            <div key={m.label} className={styles.measCard}>
              <ParamCard label={m.label} value={m.value} color={m.color} />
            </div>
          ))}
          {measurements.slice(3).map((m) => (
            <div key={m.label} className={styles.measCard}>
              <ParamCard label={m.label} value={m.value} color={m.color} />
            </div>
          ))}
        </div>

        <Button fullWidth onClick={() => navigate('/laudo')}>
          Confirmar e Continuar
        </Button>

        <button className={styles.feedbackLink} onClick={() => navigate('/feedback')}>
          Informar problema na leitura
        </button>
      </div>
    </div>
  )
}
