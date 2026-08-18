import { StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors } from '../theme'

interface CardProps {
  variant?: 'default' | 'outlined'
  padding?: number | string
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export default function Card({ variant = 'default', padding, style, children }: CardProps) {
  const paddingValue = typeof padding === 'number' ? padding : padding ? parseFloat(padding) : undefined
  return (
    <View
      style={[
        styles.card,
        styles[variant],
        paddingValue !== undefined && { padding: paddingValue },
        style,
      ]}
    >
      {children}
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.cardBg,
    borderRadius: 12,
  },
  default: {
    borderWidth: 1,
    borderColor: colors.border,
  },
  outlined: {
    borderWidth: 1,
    borderColor: colors.border,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 3,
    elevation: 1,
  },
})