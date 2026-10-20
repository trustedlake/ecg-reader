import { useEffect, useRef, useState } from 'react'
import { Animated, Pressable, StyleSheet, Text, View } from 'react-native'
import type { ReactNode } from 'react'
import { colors } from '../theme'
import { LogoutIcon } from './icons'

export interface SideMenuItem {
  key: string
  label: string
  active?: boolean
  icon?: ReactNode
  onPress: () => void
}

interface SideMenuProps {
  open: boolean
  onClose: () => void
  items: SideMenuItem[]
  onLogout: () => void
}

const EXIT_DURATION = 200

export default function SideMenu({ open, onClose, items, onLogout }: SideMenuProps) {
  const [rendered, setRendered] = useState(open)
  const [closing, setClosing] = useState(false)
  const pendingActionRef = useRef<(() => void) | null>(null)
  const translateX = useRef(new Animated.Value(open ? 0 : -220)).current

  useEffect(() => {
    if (open) {
      setRendered(true)
      setClosing(false)
      translateX.setValue(-220)
      Animated.timing(translateX, {
        toValue: 0,
        duration: EXIT_DURATION,
        useNativeDriver: true,
      }).start()
      return
    }
    if (!rendered) return

    setClosing(true)
    Animated.timing(translateX, {
      toValue: -220,
      duration: EXIT_DURATION,
      useNativeDriver: true,
    }).start()
    const timer = setTimeout(() => {
      setRendered(false)
      setClosing(false)
      pendingActionRef.current?.()
      pendingActionRef.current = null
    }, EXIT_DURATION)
    return () => clearTimeout(timer)
  }, [open, rendered, translateX])

  if (!rendered) return null

  function handleItemPress(onPress: () => void) {
    pendingActionRef.current = onPress
    onClose()
  }

  function handleLogoutPress() {
    pendingActionRef.current = onLogout
    onClose()
  }

  return (
    <View style={styles.root}>
      <Pressable style={styles.overlay} onPress={onClose} />
      <Animated.View
        style={[styles.panel, closing && styles.panelClosing, { transform: [{ translateX }] }]}
      >
        <View style={styles.nav}>
          {items.map((item) => (
            <Pressable
              key={item.key}
              style={({ pressed }) => [
                styles.item,
                item.active && styles.itemActive,
                pressed && styles.itemPressed,
              ]}
              onPress={() => handleItemPress(item.onPress)}
            >
              {item.icon}
              <Text style={styles.itemText}>{item.label}</Text>
            </Pressable>
          ))}
        </View>
        <View style={styles.divider} />
        <Pressable
          style={({ pressed }) => [styles.logout, pressed && styles.itemPressed]}
          onPress={handleLogoutPress}
        >
          <LogoutIcon color={colors.secondary} size={20} />
          <Text style={styles.logoutText}>Sign out</Text>
        </Pressable>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 200,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  panel: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    width: 220,
    maxWidth: '80%',
    backgroundColor: colors.white,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 16,
    shadowOffset: { width: 4, height: 0 },
    elevation: 5,
    paddingTop: 60,
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  panelClosing: {
    pointerEvents: 'none',
  },
  nav: {
    flex: 1,
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  itemActive: {
    backgroundColor: colors.background,
  },
  itemPressed: {
    backgroundColor: colors.background,
  },
  itemText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: colors.gridBorder,
    marginVertical: 8,
  },
  logout: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: 8,
  },
  logoutText: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.secondary,
  },
})