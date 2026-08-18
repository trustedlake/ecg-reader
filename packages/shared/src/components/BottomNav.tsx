import { Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors } from '../theme'

export interface BottomNavItem {
  key: string
  label: string
  icon?: ReactNode
  active: boolean
  onPress: () => void
}

interface BottomNavProps {
  items: BottomNavItem[]
}

export default function BottomNav({ items }: BottomNavProps) {
  return (
    <View style={styles.nav}>
      {items.map((item) => (
        <Pressable
          key={item.key}
          style={({ pressed }) => [
            styles.item,
            pressed && styles.pressed,
          ]}
          onPress={item.onPress}
        >
          {typeof item.icon === 'string' ? (
            <Text style={[styles.icon, item.active && styles.active]}>{item.icon}</Text>
          ) : (
            item.icon
          )}
          <Text style={[styles.label, item.active && styles.active]}>{item.label}</Text>
        </Pressable>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  nav: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    height: 64,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    maxWidth: 375,
    marginHorizontal: 'auto',
  },
  item: {
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingVertical: 4,
    paddingHorizontal: 16,
  },
  active: {
    color: colors.primary,
  },
  pressed: {
    opacity: 0.7,
  },
  icon: {
    fontSize: 20,
    lineHeight: 20,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
  },
})