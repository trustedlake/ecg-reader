import { useState } from 'react'
import { Image, Platform, StyleSheet, Text, View } from 'react-native'
import * as ImagePicker from 'expo-image-picker'
import { Button, colors } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import type { ImageContentType, PickedImage } from '../flow/AttemptDraft'
import { GAINS_MM_MV, MIN_LONG_SIDE_PX, MIN_SHORT_SIDE_PX, SPEEDS_MM_S } from '../flow/defaults'
import type { AppScreenProps } from '../navigation/types'
import { ErrorBanner } from '../ui/Feedback'
import MissingDraft from '../ui/MissingDraft'
import { SEX_LABELS } from '../ui/labels'
import Screen from '../ui/Screen'
import SegmentedControl from '../ui/SegmentedControl'
import TestScenarioPicker from '../ui/TestScenarioPicker'

const EXTENSION_TYPES: Record<string, ImageContentType> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  webp: 'image/webp',
}
const SUPPORTED = new Set<string>(Object.values(EXTENSION_TYPES))

function contentTypeOf(asset: ImagePicker.ImagePickerAsset): ImageContentType | null {
  const mime = asset.mimeType?.toLowerCase()
  if (mime && SUPPORTED.has(mime)) return mime as ImageContentType
  if (mime) return null
  const extension = (asset.fileName ?? asset.uri).split('?')[0]!.split('.').pop()?.toLowerCase() ?? ''
  return EXTENSION_TYPES[extension] ?? null
}

function toPickedImage(asset: ImagePicker.ImagePickerAsset): PickedImage | string {
  const contentType = contentTypeOf(asset)
  if (!contentType) return 'Unsupported format. Use a JPG, PNG or WebP photo.'
  const { width, height } = asset
  if (width > 0 && height > 0 && (Math.max(width, height) < MIN_LONG_SIDE_PX || Math.min(width, height) < MIN_SHORT_SIDE_PX)) {
    return `Low resolution (${width}×${height}). The photo must be at least ${MIN_LONG_SIDE_PX}×${MIN_SHORT_SIDE_PX} px.`
  }
  const extension = contentType.split('/')[1] === 'jpeg' ? 'jpg' : contentType.split('/')[1]
  return {
    uri: asset.uri,
    file: asset.file ?? undefined,
    filename: asset.fileName || `ecg-${Date.now()}.${extension}`,
    contentType,
    width,
    height,
  }
}

export default function CaptureScreen({ navigation, route }: AppScreenProps<'Capture'>) {
  const { examId } = route.params
  const { config } = useApi()
  const { draft, update } = useAttemptDraft()
  const [error, setError] = useState<string | null>(null)

  if (!draft || draft.examId !== examId) return <MissingDraft examId={examId} navigation={navigation} />

  async function pick(source: 'camera' | 'library') {
    setError(null)
    // On web, the picker must open directly on tap (no await before it) and there is no permission to request.
    if (Platform.OS !== 'web') {
      const permission =
        source === 'camera'
          ? await ImagePicker.requestCameraPermissionsAsync()
          : await ImagePicker.requestMediaLibraryPermissionsAsync()
      if (!permission.granted) {
        setError(
          source === 'camera'
            ? 'No permission to use the camera. Allow it in your device settings or choose from the gallery.'
            : 'No permission to access photos. Allow it in your device settings or use the camera.',
        )
        return
      }
    }
    const options: ImagePicker.ImagePickerOptions = { mediaTypes: ['images'], quality: 0.9 }
    try {
      const result =
        source === 'camera'
          ? await ImagePicker.launchCameraAsync(options)
          : await ImagePicker.launchImageLibraryAsync(options)
      if (result.canceled || !result.assets?.[0]) return
      const picked = toPickedImage(result.assets[0])
      if (typeof picked === 'string') setError(picked)
      else update({ image: picked })
    } catch {
      setError('Could not open the camera or the gallery. Try again.')
    }
  }

  const speeds = config?.calibration.speed_mm_s ?? SPEEDS_MM_S
  const gains = config?.calibration.gain_mm_mv ?? GAINS_MM_MV
  const { image, calibration, patient } = draft
  const aspectRatio = image && image.width > 0 && image.height > 0 ? image.width / image.height : 4 / 3

  return (
    <Screen
      title="ECG photo"
      onBack={() => navigation.goBack()}
      footer={
        <Button fullWidth disabled={!image} onPress={() => navigation.navigate('Layout', { examId })} testID="capture-continue">
          Choose the layout
        </Button>
      }
    >
      <Text style={styles.patient}>
        {patient.name} · {patient.age} years old{patient.sex ? ` · ${SEX_LABELS[patient.sex]}` : ''}
      </Text>

      {image ? (
        <Image
          source={{ uri: image.uri }}
          style={[styles.preview, { aspectRatio }]}
          resizeMode="contain"
          accessibilityLabel="ECG photo preview"
        />
      ) : (
        <View style={styles.placeholder}>
          <Text style={styles.placeholderTitle}>Photograph the paper ECG</Text>
          <Text style={styles.tips}>
            Whole sheet in frame, well lit, no glare or shadows, and the camera parallel to the sheet.
          </Text>
        </View>
      )}

      <View style={styles.row}>
        <Button variant={image ? 'outline' : 'primary'} style={styles.half} onPress={() => void pick('camera')}>
          {image ? 'Retake' : 'Take photo'}
        </Button>
        <Button variant="outline" style={styles.half} onPress={() => void pick('library')} testID="pick-library">
          Gallery
        </Button>
      </View>
      {error && <ErrorBanner message={error} />}

      <SegmentedControl<number>
        label="Paper speed"
        options={speeds.map((v) => ({ value: v, label: `${String(v)} mm/s` }))}
        value={calibration.speed_mm_s}
        onChange={(speed_mm_s) => update({ calibration: { ...calibration, speed_mm_s } })}
      />
      <SegmentedControl<number>
        label="Gain"
        options={gains.map((v) => ({ value: v, label: `${v} mm/mV` }))}
        value={calibration.gain_mm_mv}
        onChange={(gain_mm_mv) => update({ calibration: { ...calibration, gain_mm_mv } })}
      />
      <Text style={styles.hint}>Most machines default to 25 mm/s and 10 mm/mV.</Text>

      {config?.test_scenarios_enabled && (
        <TestScenarioPicker value={draft.testScenario} onChange={(testScenario) => update({ testScenario })} />
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  patient: { fontSize: 15, color: colors.textMuted },
  preview: { width: '100%', borderRadius: 10, backgroundColor: colors.background },
  placeholder: {
    gap: 8,
    padding: 24,
    borderRadius: 12,
    borderWidth: 1,
    borderStyle: 'dashed',
    borderColor: colors.border,
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  placeholderTitle: { fontSize: 17, fontWeight: '700', color: colors.dark },
  tips: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  row: { flexDirection: 'row', gap: 10 },
  half: { flex: 1 },
  hint: { fontSize: 13, color: colors.textMuted, marginTop: -8 },
})
