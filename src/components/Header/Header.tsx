import { useNavigate } from 'react-router-dom'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightAction?: { label: string; onClick: () => void }
  showBack?: boolean
}

export default function Header({ title, onBack, rightAction, showBack = true }: HeaderProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (onBack) {
      onBack()
    } else {
      navigate(-1)
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.left}>
        {showBack && (
          <button className={styles.back} onClick={handleBack}>
            ←
          </button>
        )}
      </div>
      <h1 className={styles.title}>{title}</h1>
      <div className={styles.right}>
        {rightAction && (
          <button className={styles.action} onClick={rightAction.onClick}>
            {rightAction.label}
          </button>
        )}
      </div>
    </header>
  )
}
