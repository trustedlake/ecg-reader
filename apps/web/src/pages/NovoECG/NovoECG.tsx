import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import Header from '../../components/Header/Header'
import { Button, useExamDraft } from 'shared'
import styles from './NovoECG.module.css'

export default function NovoECG() {
  const navigate = useNavigate()
  const { imageFile, setImageFile } = useExamDraft()
  const fileInputRef = useRef<HTMLInputElement>(null)

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null
    setImageFile(file)
    event.target.value = ''
  }

  return (
    <div className={styles.page}>
      <Header title="Novo ECG" />

      <div className={styles.content}>
        <h2 className={styles.sectionTitle}>1. Capturar Imagem do ECG</h2>

        <div
          className={styles.cameraArea}
          role="button"
          tabIndex={0}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              fileInputRef.current?.click()
            }
          }}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            style={{ display: 'none' }}
            onChange={handleFileChange}
          />

          {imageFile ? (
            <>
              <img
                className={styles.preview}
                src={URL.createObjectURL(imageFile)}
                alt="Pré-visualização do ECG"
              />
              <p className={styles.cameraLabel}>{imageFile.name}</p>
            </>
          ) : (
            <>
              <div className={styles.cameraButton}>
                <span className={styles.cameraIcon}>+</span>
              </div>
              <p className={styles.cameraLabel}>Toque para fotografar o ECG</p>
              <p className={styles.cameraSub}>Inserir foto do exame</p>
            </>
          )}
        </div>

        <div className={styles.actions}>
          <Button fullWidth disabled={!imageFile} onPress={() => navigate('/config-ecg')}>
            Continuar
          </Button>
        </div>
      </div>
    </div>
  )
}
