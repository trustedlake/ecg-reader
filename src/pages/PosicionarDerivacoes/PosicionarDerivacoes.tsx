import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Button from '../../components/Button/Button'
import styles from './PosicionarDerivacoes.module.css'

interface FormatOption {
  value: string
  label: string
  id: string
}

const options: FormatOption[] = [
  { value: '3x4', label: '3×4 Derivações', id: 'A' },
  { value: '3x4+dii', label: '3×4 Derivações + DII Longo', id: 'B' },
  { value: '6x2', label: '6×2 Derivações', id: 'C' },
  { value: '12x1', label: '12×1 Derivações', id: 'D' },
]

export default function PosicionarDerivacoes() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('3x4')

  return (
    <div className={styles.page}>
      <Header title="Formato do ECG" />

      <div className={styles.content}>
        {options.map((opt) => (
          <button
            key={opt.value}
            className={`${styles.card} ${selected === opt.value ? styles.cardSelected : ''}`}
            onClick={() => setSelected(opt.value)}
          >
            <div className={styles.paperPreview}>
              <div className={styles.paperGrid} />
            </div>
            <span className={styles.cardLabel}>{opt.label}</span>
            <div className={`${styles.radio} ${selected === opt.value ? styles.radioSelected : ''}`} />
          </button>
        ))}

        <div className={styles.actions}>
          <Button fullWidth onClick={() => navigate('/dados-paciente')}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
