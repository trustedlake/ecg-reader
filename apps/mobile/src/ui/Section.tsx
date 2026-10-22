import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from './Text'
import type { ReactNode } from 'react'
import { colors } from 'shared'
import Icon from './Icon'
import type { IconName } from './Icon'

/** Titled group of rows inside a rounded card (Profile, Settings, Help, About). */
export function Section({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      {title && <Text style={styles.sectionTitle}>{title}</Text>}
      <View style={styles.card}>{children}</View>
    </View>
  )
}

interface RowProps {
  label: string
  value?: string
  icon?: IconName
  onPress?: () => void
  danger?: boolean
  last?: boolean
  testID?: string
}

/** One line of a Section: icon, label, optional value, and a chevron when it can be tapped. */
export function Row({ label, value, icon, onPress, danger, last, testID }: RowProps) {
  const content = (
    <>
      {icon && (
        <View style={[styles.iconBg, danger && styles.iconBgDanger]}>
          <Icon name={icon} size={20} color={danger ? colors.error : colors.secondary} />
        </View>
      )}
      <Text style={[styles.label, danger && styles.labelDanger]}>{label}</Text>
      {value !== undefined && (
        <Text style={styles.value} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && !danger && <Text style={styles.chevron}>›</Text>}
    </>
  )
  const style = [styles.row, !last && styles.divider]
  if (!onPress) return <View style={style}>{content}</View>
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={label}
      testID={testID}
      style={({ pressed }) => [...style, pressed && styles.pressed]}
    >
      {content}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  section: { gap: 8 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
    marginLeft: 4,
  },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gridBorder,
    backgroundColor: colors.white,
    overflow: 'hidden',
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, paddingHorizontal: 16, minHeight: 56 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gridBorder },
  iconBg: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#e8eee6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconBgDanger: { backgroundColor: '#fdecea' },
  label: { flex: 1, fontSize: 16, color: colors.dark },
  labelDanger: { color: colors.error, fontWeight: '600' },
  value: { fontSize: 15, color: colors.textMuted, maxWidth: '50%' },
  chevron: { fontSize: 24, color: colors.textMuted, marginLeft: 4 },
  pressed: { opacity: 0.6 },
})
