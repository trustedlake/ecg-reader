import { useEffect, useMemo, useRef, useState } from 'react'
import { ActivityIndicator, Animated, Image, PanResponder, Platform, Pressable, StyleSheet, Text, View } from 'react-native'
import type { GestureResponderEvent, LayoutChangeEvent } from 'react-native'
import { colors } from 'shared'

export type RegionPx = [number, number, number, number]

interface ZoomableImageProps {
  uri: string
  accessibilityLabel: string
  /** Região a destacar, em pixels da imagem original ([x0, y0, x1, y1]). */
  highlight?: RegionPx | null
  highlightLabel?: string
  /** Altura máxima da área da imagem. */
  maxHeight?: number
  testID?: string
}

const MAX_SCALE = 4
const STEPS = [1, 1.5, 2, 3, 4]

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
 * Imagem com zoom de até 4× e arraste, igual no iOS, Android e web (PanResponder, sem libs nativas):
 * pinça com dois dedos, arraste com um dedo ou o mouse quando ampliada, e botões −/+/Ajustar.
 */
export default function ZoomableImage({
  uri,
  accessibilityLabel,
  highlight,
  highlightLabel = 'Região do problema',
  maxHeight = 560,
  testID,
}: ZoomableImageProps) {
  const [natural, setNatural] = useState<{ width: number; height: number } | null>(null)
  const [failed, setFailed] = useState(false)
  const [frameWidth, setFrameWidth] = useState(0)
  const [level, setLevel] = useState(1)

  useEffect(() => {
    let cancelled = false
    setNatural(null)
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

  // Tamanho da moldura e da imagem encaixada nela (contain).
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

  function zoomTo(scale: number) {
    const current = view.current
    const factor = scale / current.scale
    setLevel(apply({ scale, x: current.x * factor, y: current.y * factor }).scale)
  }

  const zoomIn = () => zoomTo(STEPS.find((step) => step > view.current.scale + 0.01) ?? MAX_SCALE)
  const zoomOut = () => zoomTo([...STEPS].reverse().find((step) => step < view.current.scale - 0.01) ?? 1)

  // Ajusta de novo quando a moldura muda de tamanho (girar o celular, redimensionar a janela).
  useEffect(() => {
    apply(view.current)
  }, [frameWidth, frameHeight]) // eslint-disable-line react-hooks/exhaustive-deps

  const gesture = useRef({ start: view.current, dx: 0, dy: 0, pinchStart: null as number | null, touches: 0 })

  const responder = useMemo(
    () =>
      PanResponder.create({
        // Com a imagem no tamanho normal, um dedo só rola a tela; dois dedos sempre ampliam.
        onStartShouldSetPanResponder: (event) => touchesOf(event).length >= 2 || view.current.scale > 1,
        onMoveShouldSetPanResponder: (event, state) =>
          touchesOf(event).length >= 2 || (view.current.scale > 1 && Math.abs(state.dx) + Math.abs(state.dy) > 2),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (event) => {
          gesture.current = { start: view.current, dx: 0, dy: 0, pinchStart: distance(event), touches: touchesOf(event).length }
        },
        onPanResponderMove: (event, state) => {
          const count = Math.max(1, touchesOf(event).length)
          // Mudou o número de dedos: recomeça o gesto a partir da posição atual, sem pulo.
          if (count !== gesture.current.touches) {
            gesture.current = { start: view.current, dx: state.dx, dy: state.dy, pinchStart: distance(event), touches: count }
          }
          const { start, dx, dy, pinchStart } = gesture.current
          const current = distance(event)
          const scale = count >= 2 && pinchStart && current ? (start.scale * current) / pinchStart : start.scale
          const factor = scale / start.scale
          apply({ scale, x: start.x * factor + state.dx - dx, y: start.y * factor + state.dy - dy })
        },
        onPanResponderRelease: () => setLevel(view.current.scale),
        onPanResponderTerminate: () => setLevel(view.current.scale),
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
        <Text style={styles.failedText}>Não foi possível carregar a imagem. Atualize a tela para tentar de novo.</Text>
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
          </Animated.View>
        )}
      </View>

      <View style={styles.controls}>
        <ZoomButton label="−" accessibilityLabel="Diminuir zoom" onPress={zoomOut} disabled={level <= 1} testID="zoom-out" />
        <Text style={styles.level} accessibilityLiveRegion="polite" testID="zoom-level">
          {`${String(Math.round(level * 10) / 10).replace('.', ',')}×`}
        </Text>
        <ZoomButton label="+" accessibilityLabel="Aumentar zoom" onPress={zoomIn} disabled={level >= MAX_SCALE} testID="zoom-in" />
        <ZoomButton label="Ajustar" accessibilityLabel="Ajustar à tela" onPress={() => zoomTo(1)} disabled={level <= 1} wide />
      </View>
      <Text style={styles.hint}>
        {Platform.OS === 'web'
          ? 'Use + e − para ampliar e arraste a imagem para ver os detalhes.'
          : 'Afaste dois dedos para ampliar e arraste para ver os detalhes.'}
      </Text>
    </View>
  )
}

function ZoomButton({
  label,
  accessibilityLabel,
  onPress,
  disabled,
  wide,
  testID,
}: {
  label: string
  accessibilityLabel: string
  onPress: () => void
  disabled: boolean
  wide?: boolean
  testID?: string
}) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled }}
      testID={testID}
      style={({ pressed }) => [styles.zoomButton, wide && styles.zoomWide, disabled && styles.disabled, pressed && styles.pressed]}
    >
      <Text style={[styles.zoomText, wide && styles.zoomWideText]}>{label}</Text>
    </Pressable>
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
  controls: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 10 },
  zoomButton: {
    minWidth: 44,
    height: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  zoomWide: { paddingHorizontal: 16 },
  zoomText: { fontSize: 22, fontWeight: '700', color: colors.primary },
  zoomWideText: { fontSize: 15 },
  level: { minWidth: 44, textAlign: 'center', fontSize: 15, fontWeight: '700', color: colors.dark },
  hint: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.7 },
  failed: { padding: 16, borderRadius: 10, backgroundColor: colors.background },
  failedText: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
})
