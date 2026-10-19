import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors } from 'shared'

interface AppHeaderProps {
  title: string
  onBack?: () => void
  right?: ReactNode
}

export default function AppHeader({ title, onBack, right }: AppHeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.side}>
        {onBack && (
          <Pressable
            onPress={onBack}
            accessibilityRole="button"
            accessibilityLabel="Voltar"
            hitSlop={8}
            style={({ pressed }) => [styles.back, pressed && styles.pressed]}
          >
            <Text style={styles.backText}>‹</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1} accessibilityRole="header">
        {title}
      </Text>
      <View style={[styles.side, styles.right]}>{right}</View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    minHeight: 56,
    paddingHorizontal: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  side: { minWidth: 52, flexDirection: 'row', alignItems: 'center' },
  right: { justifyContent: 'flex-end' },
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  backText: { fontSize: 34, lineHeight: 38, color: colors.dark, marginTop: -4 },
  title: { flex: 1, textAlign: 'center', fontSize: 18, fontWeight: '700', color: colors.dark },
  pressed: { opacity: 0.6 },
})
