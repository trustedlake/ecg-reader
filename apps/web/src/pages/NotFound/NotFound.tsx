import { useNavigate } from 'react-router-dom'
import { Button } from 'shared'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <h1 className={styles.code}>404</h1>
      <p className={styles.message}>Página não encontrada</p>
      <Button onPress={() => navigate('/dashboard')}>
        Voltar ao início
      </Button>
    </div>
  )
}
