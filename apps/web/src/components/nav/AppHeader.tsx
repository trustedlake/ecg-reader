import { useNavigate } from 'react-router-dom'
import { Header } from 'shared'

interface AppHeaderProps {
  title: string
  onBack?: () => void
  rightAction?: { label: string; onClick: () => void }
  showBack?: boolean
}

export default function AppHeader({ title, onBack, rightAction, showBack = true }: AppHeaderProps) {
  const navigate = useNavigate()

  return (
    <Header
      title={title}
      showBack={showBack}
      onBack={onBack ?? (() => navigate(-1))}
      rightAction={rightAction}
    />
  )
}