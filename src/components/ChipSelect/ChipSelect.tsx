import styles from './ChipSelect.module.css'

interface ChipOption {
  value: string
  label: string
}

interface ChipSelectProps {
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
}

export default function ChipSelect({ options, value, onChange }: ChipSelectProps) {
  return (
    <div className={styles.chips}>
      {options.map((opt) => (
        <button
          key={opt.value}
          className={`${styles.chip} ${value === opt.value ? styles.selected : ''}`}
          onClick={() => onChange(opt.value)}
        >
          {opt.label}
        </button>
      ))}
    </div>
  )
}
