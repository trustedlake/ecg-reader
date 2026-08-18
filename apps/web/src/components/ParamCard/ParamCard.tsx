import styles from './ParamCard.module.css'

interface ParamCardProps {
  label: string
  value: string
  color?: string
}

export default function ParamCard({ label, value, color }: ParamCardProps) {
  return (
    <div className={styles.card}>
      <span className={styles.label}>{label}</span>
      <span className={styles.value} style={color ? { color } : undefined}>{value}</span>
    </div>
  )
}
