import styles from './BottomNav.module.css'

interface NavItem {
  label: string
  icon: string
  active: boolean
  onClick: () => void
}

interface BottomNavProps {
  items: NavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <nav className={styles.nav}>
      {items.map((item) => (
        <button
          key={item.label}
          className={`${styles.item} ${item.active ? styles.active : ''}`}
          onClick={item.onClick}
        >
          <span className={styles.icon}>{item.icon}</span>
          <span className={styles.label}>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}
