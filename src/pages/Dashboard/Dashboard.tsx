import { useNavigate } from 'react-router-dom'
import PatientCard from '../../components/PatientCard/PatientCard'
import styles from './Dashboard.module.css'

const exams = [
  { name: 'Carlos Oliveira', date: 'Hoje, 08 Jun 2026 • 09:23', status: 'success' as const },
  { name: 'Maria Santos', date: 'Ontem, 07 Jun 2026 • 14:15', status: 'success' as const },
  { name: 'Ana Costa', date: '06 Jun 2026 • 10:30', status: 'warning' as const },
  { name: 'Pedro Almeida', date: '05 Jun 2026 • 08:45', status: 'error' as const },
]

export default function Dashboard() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <div className={styles.headerRow}>
        <h1 className={styles.brand}>ECG Reader</h1>
        <div className={styles.profile}>
          <span className={styles.profileInitial}>D</span>
        </div>
      </div>

      <p className={styles.greeting}>Olá, Dr. Silva</p>

      <div className={styles.searchBar}>
        <span className={styles.searchPlaceholder}>Buscar paciente ou exame...</span>
      </div>

      <h2 className={styles.sectionTitle}>Exames Recentes</h2>

      <div className={styles.list}>
        {exams.map((exam) => (
          <PatientCard
            key={exam.name}
            name={exam.name}
            date={exam.date}
            status={exam.status}
            onClick={() => navigate('/ecg-viewer')}
          />
        ))}
      </div>

      <button className={styles.fab} onClick={() => navigate('/novo-ecg')}>
        +
      </button>
    </div>
  )
}
