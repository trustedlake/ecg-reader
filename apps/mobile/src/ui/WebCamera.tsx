import { createElement, useEffect, useRef, useState } from 'react'
import { Modal, Pressable, StyleSheet, View } from 'react-native'
import { Text } from './Text'

// Web only: live webcam preview with a shutter button (expo-image-picker opens a file dialog on desktop browsers).
export type WebPhoto = { uri: string; file: Blob; width: number; height: number }

type Props = { visible: boolean; onClose: () => void; onCapture: (photo: WebPhoto) => void }

/* eslint-disable @typescript-eslint/no-explicit-any */
export default function WebCamera({ visible, onClose, onCapture }: Props) {
  const videoRef = useRef<any>(null)
  const streamRef = useRef<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    if (!visible) return
    let cancelled = false
    setError(null)
    setReady(false)
    const media = (globalThis as any).navigator?.mediaDevices
    if (!media?.getUserMedia) {
      setError('This browser cannot access a camera.')
      return
    }
    media
      .getUserMedia({ video: { facingMode: 'environment', width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then((stream: any) => {
        if (cancelled) {
          stream.getTracks().forEach((t: any) => t.stop())
          return
        }
        streamRef.current = stream
        const video = videoRef.current
        if (video) {
          video.srcObject = stream
          void video.play()
        }
      })
      .catch(() => setError('No camera found, or permission was denied. Allow camera access or use the gallery.'))
    return () => {
      cancelled = true
      streamRef.current?.getTracks().forEach((t: any) => t.stop())
      streamRef.current = null
    }
  }, [visible])

  function capture() {
    const video = videoRef.current
    if (!video || !video.videoWidth) return
    const canvas = (globalThis as any).document.createElement('canvas')
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    canvas.getContext('2d').drawImage(video, 0, 0, canvas.width, canvas.height)
    canvas.toBlob(
      (blob: Blob | null) => {
        if (!blob) return
        onCapture({ uri: URL.createObjectURL(blob), file: blob, width: canvas.width, height: canvas.height })
      },
      'image/jpeg',
      0.92,
    )
  }

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        {createElement('video', {
          ref: videoRef,
          autoPlay: true,
          playsInline: true,
          muted: true,
          onLoadedMetadata: () => setReady(true),
          style: { position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', background: '#000' },
        })}
        {error && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}
        <View style={styles.bar}>
          <Pressable onPress={onClose} style={styles.side} testID="camera-cancel">
            <Text style={styles.cancel}>Cancel</Text>
          </Pressable>
          <Pressable
            onPress={capture}
            disabled={!ready}
            style={[styles.shutter, !ready && styles.disabled]}
            accessibilityLabel="Take photo"
            testID="camera-shutter"
          >
            <View style={styles.shutterInner} />
          </Pressable>
          <View style={styles.side} />
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: '#000' },
  errorBox: { position: 'absolute', top: '40%', left: 24, right: 24, padding: 16, borderRadius: 12, backgroundColor: 'rgba(0,0,0,0.7)' },
  errorText: { color: '#fff', fontSize: 15, textAlign: 'center' },
  bar: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 28,
    paddingHorizontal: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0,0,0,0.45)',
  },
  side: { width: 72 },
  cancel: { color: '#fff', fontSize: 16, fontWeight: '600' },
  shutter: {
    width: 72,
    height: 72,
    borderRadius: 36,
    borderWidth: 4,
    borderColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shutterInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  disabled: { opacity: 0.4 },
})
