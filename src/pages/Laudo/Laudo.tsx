import { useNavigate } from 'react-router-dom'
import ParamCard from '../../components/ParamCard/ParamCard'
import Button from '../../components/Button/Button'
import styles from './Laudo.module.css'

const params = [
  { label: 'Frequência Cardíaca', value: '76 bpm' },
  { label: 'Intervalo PR', value: '152 ms' },
  { label: 'Duração QRS', value: '98 ms' },
  { label: 'Intervalo QT', value: '386 ms' },
  { label: 'QTc (Bazett)', value: '412 ms', color: '#4caf50' },
  { label: 'Eixo Cardíaco', value: '+62°' },
]

export default function Laudo() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.title}>Laudo</h1>
        <button className={styles.close} onClick={() => navigate('/dashboard')}>
          ✕
        </button>
      </div>

      <div className={styles.content}>
        <div className={styles.patientCard}>
          <span className={styles.patientName}>Carlos Oliveira</span>
          <span className={styles.patientInfo}>68 anos • Masculino • 08 Jun 2026 09:23</span>
        </div>

        <div className={styles.imageArea}>
          <div className={styles.imageBox}>
            <span className={styles.detectedLabel}>Imagem Detectada</span>
            <span className={styles.checkIcon}>✓</span>
          </div>
          <span className={styles.imageHint}>Clique na imagem para ampliá-la</span>
        </div>

        <h2 className={styles.sectionTitle}>Parâmetros</h2>

        <div className={styles.paramsGrid}>
          {params.slice(0, 2).map((p) => (
            <div key={p.label} className={styles.paramCard}>
              <ParamCard label={p.label} value={p.value} color={p.color} />
            </div>
          ))}
          {params.slice(2, 4).map((p) => (
            <div key={p.label} className={styles.paramCard}>
              <ParamCard label={p.label} value={p.value} color={p.color} />
            </div>
          ))}
          {params.slice(4).map((p) => (
            <div key={p.label} className={styles.paramCard}>
              <ParamCard label={p.label} value={p.value} color={p.color} />
            </div>
          ))}
        </div>

        <h2 className={styles.sectionTitle}>Interpretação</h2>

        <div className={styles.interpretCard}>
          <p className={styles.interpretText}>
            Ritmo sinusal regular. FC 76 bpm. PR 152 ms, QRS 98 ms, QT 386 ms (QTc 412 ms).
            Eixo cardíaco +62° (normal). Sem alterações isquêmicas evidentes.
            Segmento ST e onda T dentro da normalidade.
          </p>
        </div>

        <Button fullWidth onClick={() => navigate('/dashboard')}>
          Salvar Laudo
        </Button>
      </div>
    </div>
  )
}
