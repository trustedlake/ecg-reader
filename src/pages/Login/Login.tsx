import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import { useAuth } from '../../context/AuthContext'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.iconBg}>
        <svg className={styles.ecgIcon} viewBox="0 0 70 50" fill="none">
          <path d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className={styles.title}>ECG Reader</h1>
      <p className={styles.subtitle}>Leitura e análise de ECG</p>

      <form className={styles.form} onSubmit={handleSubmit}>
        <Input
          label="CRM ou Email da Faculdade"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <Input
          label="Senha"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />

        {error && <p className={styles.error}>{error}</p>}

        <Button fullWidth type="submit" disabled={loading}>
          {loading ? 'Entrando...' : 'Entrar'}
        </Button>
      </form>

      <button className={styles.signupLink} onClick={() => navigate('/dados-cadastrais')}>
        Criar nova conta
      </button>

      <span className={styles.version}>v1.0.0</span>
    </div>
  )
}
