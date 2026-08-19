import { useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import PageHeader from '../../components/nav/PageHeader'
import AppBrandHeader from '../../components/nav/AppBrandHeader'
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

  function handleBack() {
    setImageFile(null)
    navigate(-1)
  }

  return (
    <div className={styles.page}>
      <AppBrandHeader />
      <PageHeader title="Novo ECG" onBack={handleBack} />

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
              <button
                type="button"
                className={styles.retakeButton}
                onClick={(e) => {
                  e.stopPropagation()
                  fileInputRef.current?.click()
                }}
              >
                Não gostou da imagem enviada? Clique aqui
              </button>
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

        {imageFile && (
          <div className={styles.actions}>
            <Button fullWidth onPress={() => navigate('/config-ecg')}>
              Continuar
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
