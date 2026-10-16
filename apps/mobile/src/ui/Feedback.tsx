import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { Button, colors } from 'shared'
import type { AttemptStatus } from 'shared'
import { STATUS_LABELS, STATUS_TONES } from './labels'
import type { StatusTone } from './labels'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.bannerText}>{message}</Text>
      {onRetry && (
        <Button variant="outline" onPress={onRetry}>
          Tentar de novo
        </Button>
      )}
    </View>
  )
}

export function LoadingView({ message = 'Carregando…' }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{message}</Text>
    </View>
  )
}

const TONE_COLORS: Record<StatusTone, { bg: string; fg: string }> = {
  neutral: { bg: '#eceae0', fg: colors.dark },
  progress: { bg: '#e3ecf7', fg: '#1d4f91' },
  attention: { bg: '#fff3dc', fg: '#8a5300' },
  success: { bg: '#e3f1e2', fg: '#2e6b30' },
  danger: { bg: '#fbe4e2', fg: '#a12a22' },
}

export function StatusBadge({ status }: { status: AttemptStatus }) {
  const tone = TONE_COLORS[STATUS_TONES[status]]
  return (
    <View style={[styles.badge, { backgroundColor: tone.bg }]}>
      <Text style={[styles.badgeText, { color: tone.fg }]}>{STATUS_LABELS[status]}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  banner: {
    gap: 10,
    padding: 14,
    borderRadius: 10,
    backgroundColor: '#fdecea',
    borderWidth: 1,
    borderColor: '#f5c2bd',
  },
  bannerText: { fontSize: 15, color: '#8e1c14' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 24 },
  muted: { fontSize: 15, color: colors.textMuted, textAlign: 'center' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 999 },
  badgeText: { fontSize: 13, fontWeight: '600' },
})
