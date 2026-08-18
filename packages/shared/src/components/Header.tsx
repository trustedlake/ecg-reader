import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface HeaderProps {
  title: string
  onBack?: () => void
  rightAction?: { label: string; onClick: () => void }
  showBack?: boolean
}

export default function Header({ title, onBack, rightAction, showBack = true }: HeaderProps) {
  return (
    <View style={styles.header}>
      <View style={styles.left}>
        {showBack && (
          <Pressable style={({ pressed }) => [styles.back, pressed && styles.pressed]} onPress={onBack}>
            <Text style={styles.backText}>←</Text>
          </Pressable>
        )}
      </View>
      <Text style={styles.title} numberOfLines={1}>{title}</Text>
      <View style={styles.right}>
        {rightAction && (
          <Pressable style={({ pressed }) => [styles.action, pressed && styles.pressed]} onPress={rightAction.onClick}>
            <Text style={styles.actionText}>{rightAction.label}</Text>
          </Pressable>
        )}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: 'transparent',
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    minWidth: 50,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    minWidth: 50,
  },
  back: {
    paddingVertical: 4,
  },
  backText: {
    fontSize: 22,
    fontWeight: '300',
    color: colors.dark,
    lineHeight: 33,
  },
  title: {
    flex: 1,
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: -0.5,
    lineHeight: 30,
  },
  action: {
    paddingVertical: 4,
  },
  actionText: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.primary,
  },
  pressed: {
    opacity: 0.6,
  },
})