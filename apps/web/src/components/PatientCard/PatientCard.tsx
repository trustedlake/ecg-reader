import styles from './PatientCard.module.css'

interface PatientCardProps {
  name: string
  date: string
  status?: 'success' | 'warning' | 'error'
  onClick?: () => void
}

const statusColors = {
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
}

export default function PatientCard({ name, date, status = 'success', onClick }: PatientCardProps) {
  return (
    <button className={styles.card} onClick={onClick}>
      <div className={styles.status} style={{ backgroundColor: statusColors[status] }} />
      <div className={styles.info}>
        <span className={styles.name}>{name}</span>
        <span className={styles.date}>{date}</span>
      </div>
    </button>
  )
}
