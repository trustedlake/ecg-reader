import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button, Input, useAuth } from 'shared'
import styles from './Login.module.css'

export default function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(identifier, password)
      navigate('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign in. Please try again.')
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

        <h1 className={styles.title}>ECG Reader</h1>
        <p className={styles.subtitle}>ECG reading and analysis</p>

        <form className={styles.form} onSubmit={(e) => { e.preventDefault(); void handleSubmit() }}>
          <Input
            label="Username or email"
            value={identifier}
            onChangeText={setIdentifier}
            autoComplete="username"
          />
          <Input
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
          />

          {error && <p className={styles.error}>{error}</p>}

          <Button fullWidth disabled={loading} onPress={() => void handleSubmit()}>
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>

        {/* <button className={styles.signupLink} onClick={() => navigate('/account-details')}>
          Create new account
        </button> */}

        <span className={styles.version}>Test environment · Version 1.1.14</span>
      </div>
    </div>
  )
}
