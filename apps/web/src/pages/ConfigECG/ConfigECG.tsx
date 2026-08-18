import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/nav/AppHeader'
import { Button, ChipSelect } from 'shared'
import styles from './ConfigECG.module.css'

const speedOptions = [
  { value: '5', label: '5 mm/s' },
  { value: '12.5', label: '12.5 mm/s' },
  { value: '25', label: '25 mm/s' },
  { value: '50', label: '50 mm/s' },
  { value: '100', label: '100 mm/s' },
]

const ampOptions = [
  { value: '0.5', label: '0.5 mV' },
  { value: '1', label: '1 mV' },
  { value: '2', label: '2 mV' },
  { value: '5', label: '5 mV' },
  { value: '10', label: '10 mV' },
]

export default function ConfigECG() {
  const navigate = useNavigate()
  const [speed, setSpeed] = useState('25')
  const [amp, setAmp] = useState('1')

  return (
    <div className={styles.page}>
      <AppHeader title="Configurações do ECG" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Calibração</h2>

        <p className={styles.label}>1. Velocidade</p>
        <div className={styles.chipSection}>
          <ChipSelect options={speedOptions} value={speed} onChange={setSpeed} />
        </div>

        <p className={styles.label}>2. Amplitude</p>
        <div className={styles.chipSection}>
          <ChipSelect options={ampOptions} value={amp} onChange={setAmp} />
        </div>

        <div className={styles.actions}>
          <Button fullWidth onPress={() => navigate('/posicionar-derivacoes')}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
