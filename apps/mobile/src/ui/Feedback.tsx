import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { API_MESSAGES, Button, colors, isOffHours } from 'shared'
import type { AttemptStatus, ContractWarning } from 'shared'
import { STATUS_LABELS, STATUS_TONES, errorMessage } from './labels'
import type { StatusTone } from './labels'

export function ErrorBanner({ message, onRetry }: { message: string; onRetry?: () => void }) {
  return (
    <View style={styles.banner} accessibilityRole="alert">
      <Text style={styles.bannerText}>{message}</Text>
      {onRetry && (
        <Button variant="outline" onPress={onRetry}>
          Try again
        </Button>
      )}
    </View>
  )
}

/** Off hours (D8): the backend is shut down; retrying now won't help, so there is no button. */
export function OffHoursNotice() {
  return (
    <View style={styles.offHours} accessibilityRole="alert" testID="off-hours">
      <Text style={styles.offHoursTitle}>🕗 Outside service hours</Text>
      <Text style={styles.offHoursText}>{API_MESSAGES.offHours}</Text>
    </View>
  )
}

/** Error from any source: an hours notice when the service is shut down, otherwise the banner with "Try again". */
export function ErrorNotice({ error, onRetry }: { error: unknown; onRetry?: () => void }) {
  if (isOffHours(error)) return <OffHoursNotice />
  return <ErrorBanner message={errorMessage(error)} onRetry={onRetry} />
}

export function LoadingView({ message = 'Loading…' }: { message?: string }) {
  return (
    <View style={styles.center} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{message}</Text>
    </View>
  )
}

export const TONE_COLORS: Record<StatusTone, { bg: string; fg: string }> = {
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

/** Colored label; always with text (and icon, if any), so color is not the only indicator. */
export function Tag({ label, icon, tone }: { label: string; icon?: string; tone: StatusTone }) {
  const colorsFor = TONE_COLORS[tone]
  return (
    <View style={[styles.badge, { backgroundColor: colorsFor.bg }]}>
      <Text style={[styles.badgeText, { color: colorsFor.fg }]}>{icon ? `${icon} ${label}` : label}</Text>
    </View>
  )
}

/** Lambda warnings highlighted (e.g. "V2: Trace partially extracted…"). */
export function WarningList({ title, warnings }: { title: string; warnings: ContractWarning[] }) {
  if (!warnings.length) return null
  return (
    <View style={styles.warnings} accessibilityRole="summary" testID="warnings">
      <Text style={styles.warningsTitle}>⚠ {title}</Text>
      {warnings.map((warning, index) => (
        <Text key={`${warning.code}-${warning.lead ?? ''}-${index}`} style={styles.warningItem}>
          • {warning.lead ? <Text style={styles.warningLead}>{warning.lead}: </Text> : null}
          {warning.message}
        </Text>
      ))}
    </View>
  )
}

/** Neutral box for an explanation or tip. */
export function InfoBox({ title, children }: { title?: string; children: string }) {
  return (
    <View style={styles.info}>
      {title && <Text style={styles.infoTitle}>{title}</Text>}
      <Text style={styles.infoText}>{children}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  offHours: { gap: 6, padding: 14, borderRadius: 10, backgroundColor: '#e3ecf7', borderWidth: 1, borderColor: '#c3d4ea' },
  offHoursTitle: { fontSize: 15, fontWeight: '700', color: '#1d4f91' },
  offHoursText: { fontSize: 15, lineHeight: 21, color: '#1d3557' },
  warnings: { gap: 6, padding: 14, borderRadius: 10, backgroundColor: '#fff3dc', borderWidth: 1, borderColor: '#f2d39a' },
  warningsTitle: { fontSize: 15, fontWeight: '700', color: '#6b4100' },
  warningItem: { fontSize: 14, lineHeight: 20, color: '#5a3a06' },
  warningLead: { fontWeight: '700' },
  info: { gap: 4, padding: 14, borderRadius: 10, backgroundColor: '#eef3ec', borderWidth: 1, borderColor: '#d3dfcf' },
  infoTitle: { fontSize: 15, fontWeight: '700', color: colors.dark },
  infoText: { fontSize: 14, lineHeight: 20, color: colors.dark },
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
