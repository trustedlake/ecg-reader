import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from 'shared'

export default function AppBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    {
      key: 'dashboard',
      label: 'Home',
      icon: '🏠',
      active: location.pathname === '/dashboard',
      onPress: () => navigate('/dashboard'),
    },
    {
      key: 'new-ecg',
      label: 'New ECG',
      icon: '➕',
      active: location.pathname === '/new-ecg',
      onPress: () => navigate('/new-ecg'),
    },
    {
      key: 'upload',
      label: 'Upload',
      icon: '📤',
      active: location.pathname === '/upload',
      onPress: () => navigate('/upload'),
    },
    {
      key: 'plans',
      label: 'Plans',
      icon: '💳',
      active: location.pathname === '/plans',
      onPress: () => navigate('/plans'),
    },
  ]

  return <BottomNav items={items} />
}