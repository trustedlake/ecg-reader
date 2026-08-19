import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BrandHeader, useAuth } from 'shared'
import AppSideMenu from './AppSideMenu'

export default function AppBrandHeader() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const [menuOpen, setMenuOpen] = useState(false)
  const profileInitial = user?.name?.trim()?.[0]?.toUpperCase() ?? ''

  return (
    <>
      <BrandHeader
        profileInitial={profileInitial}
        onLogoPress={() => navigate('/dashboard')}
        onProfilePress={() => setMenuOpen(true)}
      />
      <AppSideMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  )
}