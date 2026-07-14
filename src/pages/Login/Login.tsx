import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.iconBg}>
        <svg className={styles.ecgIcon} viewBox="0 0 70 50" fill="none">
          <path d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className={styles.title}>ECG Reader</h1>
      <p className={styles.subtitle}>Leitura e análise de ECG</p>

      <div className={styles.form}>
        <Input label="CRM ou Email da Faculdade" />
        <Input label="Senha" type="password" />

        <Button fullWidth onClick={() => navigate('/dashboard')}>
          Entrar
        </Button>
      </div>

      <button className={styles.signupLink} onClick={() => navigate('/dados-cadastrais')}>
        Criar nova conta
      </button>

      <span className={styles.version}>v1.0.0</span>
    </div>
  )
}
