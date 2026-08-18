import { InputHTMLAttributes } from 'react'
import styles from './Input.module.css'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export default function Input({ label, className, ...props }: InputProps) {
  return (
    <div className={`${styles.wrapper} ${className ?? ''}`}>
      <input className={styles.input} placeholder={label} {...props} />
    </div>
  )
}
