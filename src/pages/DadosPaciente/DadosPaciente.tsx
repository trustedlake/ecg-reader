import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import Input from '../../components/Input/Input'
import CheckboxGroup from '../../components/CheckboxGroup/CheckboxGroup'
import Button from '../../components/Button/Button'
import styles from './DadosPaciente.module.css'

const reasonOptions = [
  { value: 'rotina', label: 'Exame completo de rotina' },
  { value: 'dor', label: 'Dor precordial' },
  { value: 'dispneia', label: 'Dispneia' },
  { value: 'sincope', label: 'Síncope' },
  { value: 'taquicardia', label: 'Taquicardia (palpitações)' },
]

export default function DadosPaciente() {
  const navigate = useNavigate()
  const [reasons, setReasons] = useState<string[]>([])

  return (
    <div className={styles.page}>
      <Header title="Dados do Paciente" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>Dados do Paciente</h2>
        <span className={styles.optional}>Opcional</span>

        <div className={styles.fields}>
          <Input label="Nome completo do paciente" />
          <Input label="Idade do paciente" />
        </div>

        <h2 className={styles.sectionTitle}>Motivo do Exame</h2>
        <span className={styles.optional}>Opcional</span>

        <CheckboxGroup options={reasonOptions} values={reasons} onChange={setReasons} />

        <div className={styles.actions}>
          <Button fullWidth onClick={() => navigate('/ecg-viewer')}>
            Confirmar
          </Button>
        </div>
      </div>
    </div>
  )
}
