import { HTMLAttributes } from 'react'
import styles from './Card.module.css'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined'
  padding?: string | number
}

export default function Card({ variant = 'default', padding, className, children, ...props }: CardProps) {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${className ?? ''}`}
      style={padding ? { padding: typeof padding === 'number' ? `${padding}px` : padding } : undefined}
      {...props}
    >
      {children}
    </div>
  )
}
