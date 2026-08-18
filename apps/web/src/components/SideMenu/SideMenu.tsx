import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from 'shared'
import styles from './SideMenu.module.css'

interface SideMenuProps {
  open: boolean
  onClose: () => void
}

const EXIT_DURATION = 200

export default function SideMenu({ open, onClose }: SideMenuProps) {
  const navigate = useNavigate()
  const { logout } = useAuth()
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      return
    }
    if (!rendered) return

    setClosing(true)
    const timer = setTimeout(() => {
      setRendered(false)
      setClosing(false)
      pendingActionRef.current?.()
      pendingActionRef.current = null
    }, EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [open, rendered])

  if (!rendered) return null

  function handleHome() {
    pendingActionRef.current = () => navigate('/dashboard')
    onClose()
  }

  function handleLogout() {
    pendingActionRef.current = () => {
      logout()
      navigate('/login')
    }
    onClose()
  }

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div
        className={`${styles.panel} ${closing ? styles.slideOut : ''}`}
        onClick={(e) => e.stopPropagation()}
      >
        <nav className={styles.nav}>
          <button className={styles.item} onClick={handleHome}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 11l9-8 9 8" />
              <path d="M5 10v10h14V10" />
            </svg>
            Home
          </button>
        </nav>
        <div className={styles.divider} />
        <button className={styles.logout} onClick={handleLogout}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 4H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h9" />
            <path d="M10 12h11" />
            <path d="M17 8l4 4-4 4" />
          </svg>
          Sair
        </button>
      </div>
    </div>
  )
}
