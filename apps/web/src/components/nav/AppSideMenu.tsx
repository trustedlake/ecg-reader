import { useLocation, useNavigate } from 'react-router-dom'
import { SideMenu, useAuth, colors, HomeIcon } from 'shared'
import type { SideMenuItem } from 'shared'

interface AppSideMenuProps {
  open: boolean
  onClose: () => void
}

export default function AppSideMenu({ open, onClose }: AppSideMenuProps) {
  const navigate = useNavigate()
  const location = useLocation()
  const { logout } = useAuth()

  const items: SideMenuItem[] = [
    {
      key: 'home',
      label: 'Home',
      icon: <HomeIcon color={colors.dark} size={20} />,
      active: location.pathname === '/dashboard',
      onPress: () => navigate('/dashboard'),
    },
  ]

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return <SideMenu open={open} onClose={onClose} items={items} onLogout={handleLogout} />
}