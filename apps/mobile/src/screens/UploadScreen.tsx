import { useState } from 'react'
import { Image, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import * as ImagePicker from 'expo-image-picker'
import { Button, Header, colors, confirmUploadBatch, uploadECGBatch, useAuth } from 'shared'
import type { UploadFile } from 'shared'
import { apiClient } from '../platform/api'

type Status = 'idle' | 'uploading' | 'review' | 'confirming' | 'done' | 'error'

interface SelectedImage {
  uri: string
  filename: string
  contentType: string
}

export default function UploadScreen() {
  const { logout } = useAuth()
  const [selected, setSelected] = useState<SelectedImage | null>(null)
  const [status, setStatus] = useState<Status>('idle')
  const [batchId, setBatchId] = useState<string | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  function handleError(err: unknown, fallback: string) {
    setErrorMessage(err instanceof Error ? err.message : fallback)
    setStatus('error')
  }

  function handleReset() {
    setSelected(null)
    setBatchId(null)
    setErrorMessage(null)
    setStatus('idle')
  }

  async function pickFromCamera() {
    const permission = await ImagePicker.requestCameraPermissionsAsync()
    if (!permission.granted) {
      setErrorMessage('Permissão de câmera negada. Permita o acesso nas configurações ou escolha da galeria.')
      setStatus('error')
      return
    }
    const result = await ImagePicker.launchCameraAsync({ quality: 0.8 })
    if (!result.canceled) {
      const asset = result.assets[0]!
      setSelected({
        uri: asset.uri,
        filename: asset.fileName ?? `ecg-${Date.now()}.jpg`,
        contentType: asset.mimeType ?? 'image/jpeg',
      })
      setErrorMessage(null)
      setStatus('idle')
    }
  }

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync()
    if (!permission.granted) {
      setErrorMessage('Permissão de galeria negada. Permita o acesso nas configurações ou use a câmera.')
      setStatus('error')
      return
    }
    const result = await ImagePicker.launchImageLibraryAsync({ quality: 0.8 })
    if (!result.canceled) {
      const asset = result.assets[0]!
      setSelected({
        uri: asset.uri,
        filename: asset.fileName ?? `exame-${Date.now()}.jpg`,
        contentType: asset.mimeType ?? 'image/jpeg',
      })
      setErrorMessage(null)
      setStatus('idle')
    }
  }

  async function handleSend() {
    if (!selected) return
    setStatus('uploading')
    setErrorMessage(null)

    try {
      const blob = await (await fetch(selected.uri)).blob()
      const files: UploadFile[] = [
        {
          blob,
          filename: selected.filename,
          contentType: selected.contentType,
        },
      ]
      const { batchId: newBatchId } = await uploadECGBatch(apiClient, files)
      setBatchId(newBatchId)
      setStatus('review')
    } catch (err) {
      handleError(err, 'Falha ao enviar')
    }
  }

  async function handleConfirm() {
    if (!batchId) return
    setStatus('confirming')
    setErrorMessage(null)

    try {
      await confirmUploadBatch(apiClient, batchId)
      setStatus('done')
    } catch (err) {
      handleError(err, 'Falha ao confirmar')
    }
  }

  if (status === 'done') {
    return (
      <SafeAreaView style={styles.safe}>
        <Header title="Upload de ECG" showBack={false} rightAction={{ label: 'Sair', onClick: logout }} />
        <View style={styles.content}>
          <Text style={styles.doneTitle}>Obrigado!</Text>
          <Text style={styles.subtitle}>Recebemos sua foto.</Text>
          <Button fullWidth onPress={handleReset}>Enviar outro</Button>
        </View>
      </SafeAreaView>
    )
  }

  return (
    <SafeAreaView style={styles.safe}>
      <Header title="Upload de ECG" showBack={false} rightAction={{ label: 'Sair', onClick: logout }} />
      <View style={styles.content}>
        {(status === 'idle' || status === 'error') && (
          <>
            <Text style={styles.subtitle}>
              Tire uma foto ou escolha da galeria para enviar o exame de ECG.
            </Text>
            <View style={styles.actionsRow}>
              <Button variant="outline" fullWidth onPress={pickFromCamera}>Tirar foto</Button>
              <Button variant="outline" fullWidth onPress={pickFromGallery}>Escolher da galeria</Button>
            </View>
            {status === 'error' && errorMessage && (
              <>
                <Text style={styles.error}>{errorMessage}</Text>
                <Button fullWidth onPress={handleReset}>Tentar novamente</Button>
              </>
            )}
          </>
        )}

        {selected && status !== 'error' && (
          <>
            <Image source={{ uri: selected.uri }} style={styles.preview} resizeMode="contain" />

            {status === 'review' || status === 'confirming' ? (
              <>
                <Text style={styles.subtitle}>Confira a foto antes de confirmar o envio.</Text>
                <Button fullWidth disabled={status === 'confirming'} onPress={handleConfirm}>
                  {status === 'confirming' ? 'Confirmando…' : 'Confirmar envio'}
                </Button>
              </>
            ) : (
              <>
                <Text style={styles.subtitle}>Foto selecionada ({selected.filename}).</Text>
                <Button fullWidth disabled={status === 'uploading'} onPress={handleSend}>
                  {status === 'uploading' ? 'Enviando…' : 'Enviar'}
                </Button>
              </>
            )}
          </>
        )}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 24,
    gap: 16,
  },
  actionsRow: {
    width: '100%',
    gap: 12,
  },
  subtitle: {
    fontSize: 14,
    color: colors.textMuted,
    textAlign: 'center',
  },
  preview: {
    width: 200,
    height: 200,
    borderRadius: 12,
    backgroundColor: colors.background,
  },
  doneTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.dark,
    marginTop: 48,
  },
  error: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
  },
})