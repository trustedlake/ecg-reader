import { useNavigate } from 'react-router-dom'
import AppHeader from '../../components/AppHeader/AppHeader'
import Button from '../../components/Button/Button'
import styles from './NotFound.module.css'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <AppHeader />
      <div className={styles.content}>
        <h1 className={styles.code}>404</h1>
        <p className={styles.message}>Página não encontrada</p>
        <Button onClick={() => navigate('/dashboard')}>
          Voltar ao início
        </Button>
      </div>
    </div>
  )
}
