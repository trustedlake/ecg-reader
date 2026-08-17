import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SideMenu from '../SideMenu/SideMenu'
import { useAuth } from '../../context/AuthContext'
import styles from './AppHeader.module.css'

export default function AppHeader() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const profileInitial = user?.name?.trim()?.[0]?.toUpperCase() ?? ''

  return (
    <>
      <div className={styles.header} onClick={() => setMenuOpen(true)}>
        <div className={styles.logoGroup} onClick={(e) => { e.stopPropagation(); navigate('/dashboard') }}>
          <div className={styles.logoIcon}>
            <svg viewBox="-2 0 48 28" fill="none">
              <path d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0" stroke="white" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className={styles.logoText}>ECG Reader</span>
        </div>
        <div className={styles.profile}>
          <span className={styles.profileInitial}>{profileInitial}</span>
        </div>
      </div>

      <SideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}
