import { useNavigate } from 'react-router-dom'
import { Header } from 'shared'

interface PageHeaderProps {
  title: string
  onBack?: () => void
  rightAction?: { label: string; onClick: () => void }
  showBack?: boolean
}

export default function PageHeader({ title, onBack, rightAction, showBack = true }: PageHeaderProps) {
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