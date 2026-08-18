import { useLocation, useNavigate } from 'react-router-dom'
import { BottomNav } from 'shared'

export default function AppBottomNav() {
  const navigate = useNavigate()
  const location = useLocation()

  const items = [
    {
      key: 'dashboard',
      label: 'Início',
      icon: '🏠',
      active: location.pathname === '/dashboard',
      onPress: () => navigate('/dashboard'),
    },
    {
      key: 'novo-ecg',
      label: 'Novo ECG',
      icon: '➕',
      active: location.pathname === '/novo-ecg',
      onPress: () => navigate('/novo-ecg'),
    },
    {
      key: 'upload',
      label: 'Upload',
      icon: '📤',
      active: location.pathname === '/upload',
      onPress: () => navigate('/upload'),
    },
    {
      key: 'planos',
      label: 'Planos',
      icon: '💳',
      active: location.pathname === '/planos',
      onPress: () => navigate('/planos'),
    },
  ]

  return <BottomNav items={items} />
}