import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Image, PanResponder, Pressable, Platform, StyleSheet, View, useWindowDimensions } from 'react-native'
import type { PanResponderInstance } from 'react-native'
import { useFocusEffect } from '@react-navigation/native'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import * as ScreenOrientation from 'expo-screen-orientation'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from 'shared'
import type { Layout } from 'shared'
import { useAttemptDraft } from '../flow/AttemptDraft'
import type { PickedImage } from '../flow/AttemptDraft'
import { cropGuide } from '../flow/cropGuide'
import type { AppScreenProps } from '../navigation/types'
import { ErrorBanner } from '../ui/Feedback'
import MissingDraft from '../ui/MissingDraft'
import { Text } from '../ui/Text'
import { setFrameOrientation } from '../ui/ZoomableImage'

interface Box {
  left: number
  top: number
  right: number
  bottom: number
}

type Corner = 'tl' | 'tr' | 'bl' | 'br'

const HANDLE = 44
const MIN_BOX = 24
const PANEL_PX = 150
const NOTCH_PX = 40
const PAD = 8
const PAD_Y = 16
const LINE = 'rgba(110, 231, 168, 0.95)'
const LINE_SOFT = 'rgba(110, 231, 168, 0.35)'
const GREEN = '#6EE7A8'

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

export default function CropScreen({ navigation, route }: AppScreenProps<'Crop'>) {
  const { examId } = route.params
  const { draft } = useAttemptDraft()
  const source = draft?.cropSource ?? draft?.image ?? null
  if (!draft || draft.examId !== examId || !source || !draft.layout) {
    return <MissingDraft examId={examId} navigation={navigation} />
  }
  return <CropEditor examId={examId} source={source} layout={draft.layout} navigation={navigation} />
}

function CropEditor({
  examId,
  source,
  layout,
  navigation,
}: {
  examId: string
  source: PickedImage
  layout: Layout
  navigation: AppScreenProps<'Crop'>['navigation']
}) {
  const { draft, update } = useAttemptDraft()
  const { width: windowWidth, height: windowHeight } = useWindowDimensions()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // The photo fits inside the available area; the crop box lives in these display pixels.
  const scale = Math.min(
    (windowWidth - 2 * PANEL_PX - 2 * PAD) / source.width,
    (windowHeight - 2 * PAD_Y) / source.height,
  )
  const width = source.width * scale
  const height = source.height * scale

  const [box, setBox] = useState<Box>(() => ({
    // Start slightly inset so the whole box can be dragged around, not only resized.
    left: width * 0.08,
    top: height * 0.08,
    right: width * 0.92,
    bottom: height * 0.92,
  }))
  const boxRef = useRef(box)
  boxRef.current = box
  const startRef = useRef<Box>(box)
  const sizeRef = useRef({ width, height })
  sizeRef.current = { width, height }

  // Crop in landscape, back to portrait when leaving. Web cannot lock: ignore the failure.
  useFocusEffect(
    useCallback(() => {
      void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.LANDSCAPE).catch(() => {})
      setFrameOrientation('landscape')
      return () => {
        setFrameOrientation('portrait')
        void ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {})
      }
    }, []),
  )

  // Rotation changes the display scale: rescale the box so it keeps covering the same part of the photo.
  const prevSize = useRef({ width, height })
  useEffect(() => {
    const { width: pw, height: ph } = prevSize.current
    if (pw === width && ph === height) return
    const fx = width / pw
    const fy = height / ph
    prevSize.current = { width, height }
    setBox((b) => ({ left: b.left * fx, right: b.right * fx, top: b.top * fy, bottom: b.bottom * fy }))
  }, [width, height])

  const responders = useMemo(() => {
    const make = (corner: Corner | 'move'): PanResponderInstance =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: () => {
          startRef.current = boxRef.current
        },
        onPanResponderMove: (_event, { dx, dy }) => {
          const start = startRef.current
          const { width: w, height: h } = sizeRef.current
          if (corner === 'move') {
            const mx = clamp(dx, -start.left, w - start.right)
            const my = clamp(dy, -start.top, h - start.bottom)
            setBox({ left: start.left + mx, top: start.top + my, right: start.right + mx, bottom: start.bottom + my })
            return
          }
          const next = { ...start }
          if (corner === 'tl' || corner === 'bl') next.left = clamp(start.left + dx, 0, start.right - MIN_BOX)
          if (corner === 'tr' || corner === 'br') next.right = clamp(start.right + dx, start.left + MIN_BOX, w)
          if (corner === 'tl' || corner === 'tr') next.top = clamp(start.top + dy, 0, start.bottom - MIN_BOX)
          if (corner === 'bl' || corner === 'br') next.bottom = clamp(start.bottom + dy, start.top + MIN_BOX, h)
          setBox(next)
        },
      })
    return {
      move: make('move'),
      tl: make('tl'),
      tr: make('tr'),
      bl: make('bl'),
      br: make('br'),
    }
  }, [])

  const guide = useMemo(() => cropGuide(layout), [layout])
  const boxWidth = box.right - box.left
  const boxHeight = box.bottom - box.top

  async function confirm() {
    setError(null)
    setBusy(true)
    try {
      const originX = Math.round(box.left / scale)
      const originY = Math.round(box.top / scale)
      const cropWidth = Math.min(Math.round(boxWidth / scale), source.width - originX)
      const cropHeight = Math.min(Math.round(boxHeight / scale), source.height - originY)
      const rendered = await ImageManipulator.manipulate(source.uri)
        .crop({ originX, originY, width: cropWidth, height: cropHeight })
        .renderAsync()
      const saved = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.92 })
      const file = Platform.OS === 'web' ? await (await fetch(saved.uri)).blob() : undefined
      const base = source.filename.replace(/\.[^.]+$/, '')
      const cropped: PickedImage = {
        uri: saved.uri,
        file,
        filename: `${base}-crop.jpg`,
        contentType: 'image/jpeg',
        width: saved.width,
        height: saved.height,
      }
      update({ cropSource: draft?.cropSource ?? source, image: cropped })
      navigation.navigate('Processing', { examId })
    } catch {
      setError('Could not crop the photo. Try again.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.body}>
        <View style={[styles.panel, styles.panelLeft]}>
          <Pressable onPress={() => navigation.goBack()} accessibilityRole="button" testID="crop-back" style={styles.backButton}>
            <Text style={styles.backText}>‹  Back</Text>
          </Pressable>
          <View style={styles.titleBlock}>
            <Text style={styles.kicker}>STEP 3 · CROP</Text>
            <Text style={styles.title}>Crop the image</Text>
            <Text style={styles.hint}>Drag the two corners to frame the ECG sheet, or drag inside the box to move it.</Text>
          </View>
        </View>
        <View style={[styles.stage, { width, height }]} testID="crop-stage">
          <Image source={{ uri: source.uri }} style={{ width, height }} accessibilityLabel="ECG photo to crop" />
          {/* Darken everything outside the box. */}
          <View style={[styles.shade, { left: 0, top: 0, right: 0, height: box.top }]} />
          <View style={[styles.shade, { left: 0, top: box.bottom, right: 0, bottom: 0 }]} />
          <View style={[styles.shade, { left: 0, top: box.top, width: box.left, height: boxHeight }]} />
          <View style={[styles.shade, { left: box.right, top: box.top, right: 0, height: boxHeight }]} />
          <View
            style={[styles.box, { left: box.left, top: box.top, width: boxWidth, height: boxHeight }]}
            {...responders.move.panHandlers}
            testID="crop-box"
          >
            {guide.baselines.map((fraction, i) => (
              <View key={`b${i}`} pointerEvents="none" style={[styles.baseline, { top: fraction * boxHeight }]} />
            ))}
            {guide.rowCuts.map((fraction, i) => (
              <View key={`r${i}`} pointerEvents="none" style={[styles.rowCut, { top: fraction * boxHeight }]} />
            ))}
            {guide.columnCuts.map((fraction, i) => (
              <View
                key={`c${i}`}
                pointerEvents="none"
                style={[
                  styles.columnCut,
                  { left: fraction * boxWidth, top: 0, height: (guide.rowCuts[guide.gridRows - 1] ?? 1) * boxHeight },
                ]}
              />
            ))}
          </View>
          {(['tl', 'br'] as const).map((corner) => (
            <View
              key={corner}
              {...responders[corner].panHandlers}
              testID={`crop-handle-${corner}`}
              accessibilityLabel={`Crop corner ${corner}`}
              style={[
                styles.handle,
                {
                  left: (corner === 'tl' ? box.left : box.right) - HANDLE / 2,
                  top: (corner === 'tl' ? box.top : box.bottom) - HANDLE / 2,
                },
              ]}
            >
              <View style={styles.dot} />
            </View>
          ))}
        </View>
        <View style={styles.panel}>
          {error && <ErrorBanner message={error} />}
          <Pressable
            onPress={() => void confirm()}
            disabled={busy}
            accessibilityRole="button"
            testID="crop-confirm"
            style={[styles.accept, busy && styles.acceptBusy]}
          >
            <Text style={styles.acceptText}>{busy ? 'Cropping…' : 'Accept  ✓'}</Text>
          </Pressable>
        </View>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.dark },
  body: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: PAD },
  panel: { width: PANEL_PX, alignSelf: 'stretch', justifyContent: 'center', alignItems: 'stretch', gap: 18, paddingHorizontal: 6 },
  backButton: {
    alignSelf: 'flex-start',
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(110, 231, 168, 0.5)',
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  backText: { fontSize: 14, fontWeight: '600', color: GREEN },
  panelLeft: { paddingLeft: NOTCH_PX },
  titleBlock: { gap: 4 },
  kicker: { fontSize: 10, fontWeight: '700', letterSpacing: 1.5, color: GREEN },
  title: { fontSize: 18, fontWeight: '700', color: colors.white },
  hint: { fontSize: 12, color: 'rgba(255, 255, 255, 0.6)' },
  accept: { backgroundColor: GREEN, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  acceptBusy: { opacity: 0.6 },
  acceptText: { fontSize: 16, fontWeight: '800', color: colors.dark },
  stage: { backgroundColor: colors.darkMuted },
  shade: { position: 'absolute', backgroundColor: 'rgba(0, 0, 0, 0.55)' },
  box: { position: 'absolute', borderWidth: 2, borderColor: LINE },
  baseline: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: LINE_SOFT },
  rowCut: { position: 'absolute', left: 0, right: 0, height: 2, marginTop: -1, backgroundColor: LINE },
  columnCut: { position: 'absolute', width: 2, marginLeft: -1, backgroundColor: LINE },
  handle: { position: 'absolute', width: HANDLE, height: HANDLE, alignItems: 'center', justifyContent: 'center' },
  dot: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: LINE,
    borderWidth: 3,
    borderColor: colors.white,
  },
})
