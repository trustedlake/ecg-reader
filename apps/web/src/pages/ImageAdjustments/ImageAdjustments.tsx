import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
import { Button } from 'shared'
import styles from './ImageAdjustments.module.css'

export default function ImageAdjustments() {
  const navigate = useNavigate()

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Image Adjustments" />
      <div className={styles.content}>
        <div className={styles.imageArea}>
          <div className={styles.imagePlaceholder}>
            <span className={styles.imageIcon}>🖼</span>
            <span className={styles.imageLabel}>ECG preview</span>
          </div>
        </div>

        <div className={styles.controls}>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Brightness</span>
            <input type="range" className={styles.slider} />
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Contrast</span>
            <input type="range" className={styles.slider} />
          </div>
          <div className={styles.controlRow}>
            <span className={styles.controlLabel}>Rotation</span>
            <input type="range" className={styles.slider} />
          </div>
        </div>

        <Button fullWidth onPress={() => navigate('/ecg-viewer')}>
          Confirm
        </Button>
      </div>
    </div>
  )
}
