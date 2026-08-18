import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, useAuth } from 'shared'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.content}>
        <div className={styles.iconBg}>
          <svg className={styles.ecgIcon} viewBox="-2 0 48 28" fill="none">
            <path d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>

        <h1 className={styles.title}>Leitor ECG</h1>
        <p className={styles.subtitle}>Leitura e análise de ECG</p>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}>
          <Input
            label="Usuário"
            value={username}
            onChangeText={setUsername}
            autoComplete="username"
          />
          <Input
            label="Senha"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button fullWidth disabled={loading} onPress={() => void handleSubmit()}>
            {loading ? 'Entrando...' : 'Entrar'}
          </Button>
        </form>

        {/* <button className={styles.signupLink} onClick={() => navigate('/dados-cadastrais')}>
          Criar nova conta
        </button> */}

        <span className={styles.version}>Ambiente de testes · Versão 1.1.14</span>
      </div>
    </div>
  )
}
