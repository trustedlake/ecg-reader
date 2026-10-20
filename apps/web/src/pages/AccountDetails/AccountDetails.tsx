import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button } from 'shared'
import styles from './AccountDetails.module.css'

interface InfoRowProps {
  label: string
  value: string
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <div className={styles.infoRow}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoValue}>{value}</span>
    </div>
  )
}

export default function AccountDetails() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader
        title="Account Details"
        rightAction={{ label: 'Edit', onClick: () => {} }}
      />

      <div className={styles.content}>
        <h2 className={styles.section}>Personal Details</h2>

        <InfoRow label="Name" value="Dr. John Smith" />
        <InfoRow label="Email" value="john.smith@clinic.com" />
        <InfoRow label="Phone" value="+1 (555) 123-4567" />
        <InfoRow label="Date of Birth" value="03/15/1978" />
        <InfoRow label="Address" value="123 Main Street" />

        <h2 className={styles.section}>Professional Details</h2>
        <InfoRow label="Medical License" value="MD-123456" />
        <InfoRow label="Specialty" value="Cardiology" />

        <div className={styles.actions}>
          <Button fullWidth onPress={() => navigate('/dashboard')}>
            Save
          </Button>
        </div>
      </div>
    </div>
  )
}
