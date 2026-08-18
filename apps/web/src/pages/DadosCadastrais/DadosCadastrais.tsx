import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { Button } from 'shared'
import styles from './DadosCadastrais.module.css'

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  )
}

export default function DadosCadastrais() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <Header
        title="Dados Cadastrais"
        rightAction={{ label: 'Editar', onClick: () => {} }}
      />

      <div className={styles.content}>
        <h2 className={styles.section}>Dados Pessoais</h2>

        <InfoRow label="Nome" value="Dr. Carlos Silva" />
        <InfoRow label="Email" value="carlos.silva@clinica.com" />
        <InfoRow label="Telefone" value="(11) 99999-8888" />
        <InfoRow label="Data de Nascimento" value="15/03/1978" />
        <InfoRow label="Endereço" value="Rua das Flores, 123" />

        <h2 className={styles.section}>Dados Profissionais</h2>
        <InfoRow label="CRM" value="123456-SP" />
        <InfoRow label="Especialidade" value="Cardiologia" />

        <div className={styles.actions}>
          <Button fullWidth onPress={() => navigate('/dashboard')}>
            Salvar
          </Button>
        </div>
      </div>
    </div>
  )
}
