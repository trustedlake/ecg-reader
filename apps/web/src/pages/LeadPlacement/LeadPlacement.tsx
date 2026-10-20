import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button } from 'shared'
import styles from './LeadPlacement.module.css'

interface FormatOption {
  value: string
  label: string
  id: string
  disabled?: boolean
}

const options: FormatOption[] = [
  { value: '3x4', label: '3×4 Leads', id: 'A' },
  { value: '3x4+dii', label: '3×4 Leads + Long II', id: 'B', disabled: true },
  { value: '6x2', label: '6×2 Leads', id: 'C', disabled: true },
  { value: '12x1', label: '12×1 Leads', id: 'D', disabled: true },
]

export default function LeadPlacement() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState('3x4')

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="ECG Format" />

      <div className={styles.content}>
        {options.map((opt) => (
          <button
            key={opt.value}
            disabled={opt.disabled}
            className={`${styles.card} ${selected === opt.value ? styles.cardSelected : ''} ${opt.disabled ? styles.cardDisabled : ''}`}
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
          <Button fullWidth onPress={() => navigate('/patient-details')}>
            Continue
          </Button>
        </div>
      </div>
    </div>
  )
}
