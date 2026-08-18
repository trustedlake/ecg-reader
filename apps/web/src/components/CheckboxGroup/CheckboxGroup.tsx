import styles from './CheckboxGroup.module.css'

interface CheckboxOption {
  value: string
  label: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  values: string[]
  onChange: (values: string[]) => void
}

export default function CheckboxGroup({ options, values, onChange }: CheckboxGroupProps) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  return (
    <div className={styles.group}>
      {options.map((opt) => (
        <label key={opt.value} className={styles.item} onClick={() => toggle(opt.value)}>
          <div className={`${styles.checkbox} ${values.includes(opt.value) ? styles.checked : ''}`}>
            {values.includes(opt.value) && <span className={styles.checkmark}>✓</span>}
          </div>
          <span className={styles.label}>{opt.label}</span>
        </label>
      ))}
    </div>
  )
}
