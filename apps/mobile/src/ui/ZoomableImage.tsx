import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Image, Modal, PanResponder, Platform, Pressable, StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text } from './Text'
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { colors } from 'shared'

export type RegionPx = [number, number, number, number]

/** Numbered mark drawn over the image; the box is in pixels of the original image. */
export interface ImageMarker {
  box: RegionPx
  label: string
  color: string
}

interface ZoomableImageProps {
  uri: string
  accessibilityLabel: string
  /** Region to highlight, in pixels of the original image ([x0, y0, x1, y1]). */
  highlight?: RegionPx | null
  highlightLabel?: string
  /** Numbered marks over the image (for example one per finding). */
  markers?: ImageMarker[]
  /** Maximum height of the image area. */
  maxHeight?: number
  /** Several images of the same ECG: a horizontal swipe moves between them, inline and full screen. */
  pageCount?: number
  page?: number
  onPageChange?: (page: number) => void
  testID?: string
}

const SWIPE_DISTANCE = 40

const MAX_SCALE = 4

/** Tells the phone-frame demo page (when the app runs inside its iframe) to turn the phone sideways. */
export function setFrameOrientation(value: 'landscape' | 'portrait') {
  if (Platform.OS === 'web' && typeof window !== 'undefined' && window.parent !== window) {
    window.parent.postMessage({ type: 'ecg-reader:orientation', value }, '*')
  }
}

interface View2D {
  scale: number
  x: number
  y: number
}

function touchesOf(event: GestureResponderEvent) {
  return event.nativeEvent.touches ?? []
}

function distance(event: GestureResponderEvent): number | null {
  const [a, b] = touchesOf(event)
  if (!a || !b) return null
  return Math.hypot(a.pageX - b.pageX, a.pageY - b.pageY)
}

/**
 * Image with up to 4× zoom and panning, the same on iOS, Android and web (PanResponder, no native libs):
 * two-finger pinch and one-finger drag when zoomed in. A tap opens the image full screen, sideways.
 */
export default function ZoomableImage({
  uri,
  accessibilityLabel,
  highlight,
  highlightLabel = 'Problem region',
  markers,
  maxHeight = 560,
  pageCount = 1,
  page = 0,
  onPageChange,
  testID,
}: ZoomableImageProps) {
  const paging = useRef({ pageCount, page, onPageChange })
  paging.current = { pageCount, page, onPageChange }
  const swipe = (direction: 1 | -1) => {
    const { pageCount: count, page: current, onPageChange: change } = paging.current
    const next = current + direction
    if (change && next >= 0 && next < count) change(next)
  }
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const [frameWidth, setFrameWidth] = useState(0)
  const [fullScreen, setFullScreen] = useState(false)

  const lastSwipe = useRef(0)
  const openFullScreen = () => {
    // The mouse release that ends a swipe also fires a press on web.
    if (Date.now() - lastSwipe.current < 500) return
    setFullScreen(true)
  }
  const closeFullScreen = () => setFullScreen(false)
  // The phone stays sideways for as long as full screen is open (also across a reload of the code).
  useEffect(() => {
    setFrameOrientation(fullScreen ? 'landscape' : 'portrait')
    return () => setFrameOrientation('portrait')
  }, [fullScreen])

  useEffect(() => {
    let cancelled = false
    // Keeps the previous size while the next image loads, so changing image never closes full screen or flickers.
    setFailed(false)
    Image.getSize(
      uri,
      (width, height) => !cancelled && setNatural({ width, height }),
      () => !cancelled && setFailed(true),
    )
    return () => {
      cancelled = true
    }
  }, [uri])

  // Size of the frame and of the image fitted inside it (contain).
  const ratio = natural ? natural.height / natural.width : 0.62
  const frameHeight = frameWidth ? Math.min(frameWidth * ratio, maxHeight) : 0
  const fitWidth = frameHeight / ratio > frameWidth ? frameWidth : frameHeight / ratio
  const fitHeight = fitWidth * ratio

  const scaleAnim = useRef(new Animated.Value(1)).current
  const offsetAnim = useRef(new Animated.ValueXY({ x: 0, y: 0 })).current
  const view = useRef<View2D>({ scale: 1, x: 0, y: 0 })
  const sizes = useRef({ frameWidth: 0, frameHeight: 0, fitWidth: 0, fitHeight: 0 })
  sizes.current = { frameWidth, frameHeight, fitWidth, fitHeight }

  function apply(next: View2D) {
    const { frameWidth: fw, frameHeight: fh, fitWidth: iw, fitHeight: ih } = sizes.current
    const scale = Math.min(MAX_SCALE, Math.max(1, next.scale))
    const maxX = Math.max(0, (iw * scale - fw) / 2)
    const maxY = Math.max(0, (ih * scale - fh) / 2)
    const clamped = {
      scale,
      x: Math.min(maxX, Math.max(-maxX, next.x)),
      y: Math.min(maxY, Math.max(-maxY, next.y)),
    }
    view.current = clamped
    scaleAnim.setValue(clamped.scale)
    offsetAnim.setValue({ x: clamped.x, y: clamped.y })
    return clamped
  }

  // Fits again when the frame changes size (rotating the phone, resizing the window).
  useEffect(() => {
    apply(view.current)
  }, [frameWidth, frameHeight]) // eslint-disable-line react-hooks/exhaustive-deps

  const gesture = useRef({ start: view.current, dx: 0, dy: 0, pinchStart: null as number | null, touches: 0, swiping: false })

  const responder = useMemo(
    () =>
      PanResponder.create({
        // With the image at normal size, one finger only scrolls the screen; two fingers always zoom.
        onStartShouldSetPanResponder: (event) => touchesOf(event).length >= 2 || view.current.scale > 1,
        onMoveShouldSetPanResponder: (event, state) =>
          touchesOf(event).length >= 2 ||
          (view.current.scale > 1 && Math.abs(state.dx) + Math.abs(state.dy) > 2) ||
          // At normal size, a horizontal swipe changes image when there are several.
          (paging.current.pageCount > 1 && Math.abs(state.dx) > 12 && Math.abs(state.dx) > Math.abs(state.dy) * 1.5),
        onPanResponderTerminationRequest: () => false,
        onPanResponderRelease: (_event, state) => {
          if (gesture.current.swiping && Math.abs(state.dx) > 12) lastSwipe.current = Date.now()
          if (gesture.current.swiping && Math.abs(state.dx) > SWIPE_DISTANCE) swipe(state.dx < 0 ? 1 : -1)
        },
        onPanResponderGrant: (event) => {
          const touches = touchesOf(event).length
          gesture.current = {
            start: view.current,
            dx: 0,
            dy: 0,
            pinchStart: distance(event),
            touches,
            swiping: view.current.scale <= 1 && touches < 2 && paging.current.pageCount > 1,
          }
        },
        onPanResponderMove: (event, state) => {
          const count = Math.max(1, touchesOf(event).length)
          if (gesture.current.swiping && count < 2) return
          gesture.current.swiping = false
          // The number of fingers changed: restart the gesture from the current position, without a jump.
          if (count !== gesture.current.touches) {
            gesture.current = { start: view.current, dx: state.dx, dy: state.dy, pinchStart: distance(event), touches: count, swiping: false }
          }
          const { start, dx, dy, pinchStart } = gesture.current
          const current = distance(event)
          const scale = count >= 2 && pinchStart && current ? (start.scale * current) / pinchStart : start.scale
          const factor = scale / start.scale
          apply({ scale, x: start.x * factor + state.dx - dx, y: start.y * factor + state.dy - dy })
        },
      }),
    [], // eslint-disable-line react-hooks/exhaustive-deps
  )

  const box =
    highlight && natural
      ? {
          left: (highlight[0] / natural.width) * fitWidth,
          top: (highlight[1] / natural.height) * fitHeight,
          width: ((highlight[2] - highlight[0]) / natural.width) * fitWidth,
          height: ((highlight[3] - highlight[1]) / natural.height) * fitHeight,
        }
      : null

  if (failed) {
    return (
      <View style={styles.failed}>
        <Text style={styles.failedText}>Could not load the image. Refresh the screen to try again.</Text>
      </View>
    )
  }

  return (
    <View style={styles.wrap} testID={testID}>
      <View
        style={[styles.frame, { height: frameHeight || 220 }]}
        onLayout={(event: LayoutChangeEvent) => setFrameWidth(event.nativeEvent.layout.width)}
        {...responder.panHandlers}
      >
        {!natural || !frameWidth ? (
          <ActivityIndicator color={colors.primary} />
        ) : (
          <Pressable onPress={openFullScreen} accessibilityRole="imagebutton" accessibilityHint="Opens the image full screen" testID="zoom-open">
          <Animated.View
            style={{
              width: fitWidth,
              height: fitHeight,
              transform: [{ translateX: offsetAnim.x }, { translateY: offsetAnim.y }, { scale: scaleAnim }],
            }}
          >
            <Image
              source={{ uri }}
              style={styles.image}
              resizeMode="contain"
              accessibilityLabel={accessibilityLabel}
              {...(Platform.OS === 'web' ? { draggable: false } : {})}
            />
            {box && (
              <View
                pointerEvents="none"
                style={[styles.highlight, box]}
                accessibilityLabel={highlightLabel}
                testID="zoom-highlight"
              >
                <Text style={styles.highlightLabel}>{highlightLabel}</Text>
              </View>
            )}
            {natural && markers?.map((marker) => (
              <View
                key={marker.label}
                pointerEvents="none"
                style={[
                  styles.markerBox,
                  {
                    borderColor: marker.color,
                    left: (marker.box[0] / natural.width) * fitWidth,
                    top: (marker.box[1] / natural.height) * fitHeight,
                    width: ((marker.box[2] - marker.box[0]) / natural.width) * fitWidth,
                    height: ((marker.box[3] - marker.box[1]) / natural.height) * fitHeight,
                  },
                ]}
              >
                <View style={[styles.markerBadge, { backgroundColor: marker.color }]}>
                  <Text style={styles.markerText}>{marker.label}</Text>
                </View>
              </View>
            ))}
          </Animated.View>
          </Pressable>
        )}
      </View>

      {pageCount > 1 && <PageDots count={pageCount} page={page} />}
      <Text style={styles.hint}>Tap the image to view it full screen.</Text>
      {fullScreen && natural && (
        <FullScreenImage uri={uri} natural={natural} accessibilityLabel={accessibilityLabel} highlight={highlight} highlightLabel={highlightLabel} onClose={closeFullScreen} pageCount={pageCount} page={page} onSwipe={swipe} />
      )}
    </View>
  )
}

/** Full-screen view in landscape: turned 90° when the screen itself is still portrait. */
function FullScreenImage({
  uri,
  natural,
  accessibilityLabel,
  highlight,
  highlightLabel,
  onClose,
  pageCount,
  page,
  onSwipe,
}: {
  uri: string
  natural: { width: number; height: number }
  accessibilityLabel: string
  highlight?: RegionPx | null
  highlightLabel: string
  onClose: () => void
  pageCount: number
  page: number
  onSwipe: (direction: 1 | -1) => void
}) {
  const [size, setSize] = useState(natural)
  useEffect(() => {
    let cancelled = false
    Image.getSize(uri, (width, height) => !cancelled && setSize({ width, height }), () => undefined)
    return () => {
      cancelled = true
    }
  }, [uri])
  const screen = useWindowDimensions()
  const rotate = screen.height > screen.width
  const areaWidth = rotate ? screen.height : screen.width
  const areaHeight = rotate ? screen.width : screen.height
  const scale = Math.min(areaWidth / size.width, areaHeight / size.height)
  const width = size.width * scale
  const height = size.height * scale
  const latest = useRef({ rotate, onSwipe, onClose })
  latest.current = { rotate, onSwipe, onClose }
  // A tap closes; a swipe along the long side of the image changes image.
  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderRelease: (_event, state) => {
          const { rotate: turned, onSwipe: change, onClose: close } = latest.current
          const along = turned ? state.dy : state.dx
          if (Math.abs(state.dx) < 8 && Math.abs(state.dy) < 8) close()
          else if (Math.abs(along) > SWIPE_DISTANCE) change(along < 0 ? 1 : -1)
        },
      }),
    [],
  )
  const box = highlight
    ? {
        left: highlight[0] * scale,
        top: highlight[1] * scale,
        width: (highlight[2] - highlight[0]) * scale,
        height: (highlight[3] - highlight[1]) * scale,
      }
    : null
  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose} supportedOrientations={['portrait', 'landscape']}>
      <View style={styles.fullScreen} {...responder.panHandlers} accessibilityLabel="Close full screen" testID="zoom-close">
        <View style={{ width, height, transform: rotate ? [{ rotate: '90deg' }] : [] }}>
          <Image source={{ uri }} style={styles.image} resizeMode="contain" accessibilityLabel={accessibilityLabel} />
          {box && (
            <View pointerEvents="none" style={[styles.highlight, box]} accessibilityLabel={highlightLabel}>
              <Text style={styles.highlightLabel}>{highlightLabel}</Text>
            </View>
          )}
        </View>
        <Text style={styles.close}>✕</Text>
        {pageCount > 1 && (
          <>
            <Pressable
              onPress={() => onSwipe(-1)}
              disabled={page === 0}
              style={[styles.arrow, rotate ? styles.arrowTop : styles.arrowLeft, page === 0 && styles.arrowDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Previous image"
              testID="full-prev"
            >
              <Text style={[styles.arrowText, rotate && styles.arrowTurned]}>‹</Text>
            </Pressable>
            <Pressable
              onPress={() => onSwipe(1)}
              disabled={page === pageCount - 1}
              style={[styles.arrow, rotate ? styles.arrowBottom : styles.arrowRight, page === pageCount - 1 && styles.arrowDisabled]}
              accessibilityRole="button"
              accessibilityLabel="Next image"
              testID="full-next"
            >
              <Text style={[styles.arrowText, rotate && styles.arrowTurned]}>›</Text>
            </Pressable>
          </>
        )}
        {pageCount > 1 && (
          <View style={rotate ? styles.fullDotsTurned : styles.fullDots} pointerEvents="none">
            <PageDots count={pageCount} page={page} light vertical={rotate} />
          </View>
        )}
      </View>
    </Modal>
  )
}

function PageDots({ count, page, light, vertical }: { count: number; page: number; light?: boolean; vertical?: boolean }) {
  return (
    <View style={[styles.dots, vertical && styles.dotsVertical]} accessibilityLabel={`Image ${page + 1} of ${count}`} testID="page-dots">
      {Array.from({ length: count }, (_, index) => (
        <View
          key={index}
          style={[styles.dot, light && styles.dotLight, index === page && (light ? styles.dotActiveLight : styles.dotActive)]}
        />
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  wrap: { gap: 8 },
  frame: {
    width: '100%',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
    backgroundColor: '#1d2a21',
    ...(Platform.OS === 'web' ? ({ cursor: 'grab', userSelect: 'none', touchAction: 'none' } as object) : {}),
  },
  image: { width: '100%', height: '100%' },
  highlight: { position: 'absolute', borderWidth: 3, borderColor: '#e53935', backgroundColor: 'rgba(229,57,53,0.12)' },
  markerBox: { position: 'absolute', borderWidth: 2 },
  markerBadge: { position: 'absolute', top: -11, left: -11, width: 22, height: 22, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  markerText: { fontSize: 12, fontWeight: '800', color: colors.white },
  highlightLabel: {
    position: 'absolute',
    top: 0,
    left: 0,
    paddingHorizontal: 4,
    fontSize: 11,
    fontWeight: '700',
    color: colors.white,
    backgroundColor: '#e53935',
  },
  hint: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  fullScreen: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' },
  dots: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6 },
  dotsVertical: { flexDirection: 'column' },
  dot: { width: 7, height: 7, borderRadius: 5, backgroundColor: colors.gridBorder },
  dotActive: { width: 10, height: 10, backgroundColor: colors.primary },
  dotLight: { backgroundColor: 'rgba(255,255,255,0.35)' },
  dotActiveLight: { width: 10, height: 10, backgroundColor: colors.white },
  fullDots: { position: 'absolute', bottom: 16, alignSelf: 'center', padding: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)' },
  fullDotsTurned: { position: 'absolute', left: 16, padding: 8, borderRadius: 999, backgroundColor: 'rgba(0,0,0,0.55)' },
  close: { position: 'absolute', top: 16, right: 20, fontSize: 24, color: colors.white },
  arrow: {
    position: 'absolute',
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  // Clear of the phone's camera island on the left in landscape.
  arrowLeft: { left: 60, top: '50%', marginTop: -28 },
  arrowRight: { right: 60, top: '50%', marginTop: -28 },
  arrowTop: { top: 12, left: '50%', marginLeft: -28 },
  arrowBottom: { bottom: 12, left: '50%', marginLeft: -28 },
  arrowDisabled: { opacity: 0.3 },
  arrowText: { fontSize: 44, lineHeight: 48, color: colors.white, fontWeight: '700' },
  arrowTurned: { transform: [{ rotate: '90deg' }] },
  failed: { padding: 16, borderRadius: 10, backgroundColor: colors.background },
  failedText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
})
