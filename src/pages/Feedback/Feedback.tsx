import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import CheckboxGroup from '../../components/CheckboxGroup/CheckboxGroup'
import Button from '../../components/Button/Button'
import styles from './Feedback.module.css'

const options = [
  { value: 'not-recognized', label: 'Parte do ECG não foi reconhecida.' },
  { value: 'cropped', label: 'A imagem foi cortada.' },
  { value: 'extra-areas', label: 'A detecção incluiu áreas que não fazem parte do ECG.' },
  { value: 'quality', label: 'A qualidade da imagem ficou comprometida.' },
  { value: 'other', label: 'Outro.' },
]

export default function Feedback() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])

  return (
    <div className={styles.page}>
      <Header title="Feedback" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>O que aconteceu?</h2>

        <CheckboxGroup options={options} values={selected} onChange={setSelected} />

        <div className={styles.descSection}>
          <span className={styles.descLabel}>Descreva o problema (opcional)</span>
          <textarea className={styles.descField} placeholder="Descreva aqui..." rows={4} />
        </div>

        <Button fullWidth onClick={() => navigate(-1)}>
          Enviar
        </Button>
      </div>
    </div>
  )
}
