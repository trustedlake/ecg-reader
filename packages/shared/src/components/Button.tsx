import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors } from '../theme'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'text' | 'danger'
  fullWidth?: boolean
  disabled?: boolean
  onPress?: () => void
  loading?: boolean
  accessibilityLabel?: string
  testID?: string
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  loading = false,
  accessibilityLabel,
  testID,
  onPress,
  style,
  children,
}: ButtonProps) {
  const inactive = disabled || loading
  return (
    <Pressable
      disabled={inactive}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      accessibilityState={{ disabled: inactive, busy: loading }}
      testID={testID}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !inactive && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={variant === 'primary' || variant === 'danger' ? colors.white : colors.primary} />
      ) : (
        <Text style={[styles.label, textStyles[variant]]}>{children}</Text>
      )}
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    paddingHorizontal: 24,
    paddingVertical: 8,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.45,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  danger: {
    backgroundColor: '#a12a22',
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    backgroundColor: 'transparent',
    height: 'auto',
    minHeight: 44,
    paddingHorizontal: 8,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  primaryText: {
    color: colors.white,
  },
  outlineText: {
    color: colors.dark,
  },
  textVariantText: {
    color: colors.primary,
  },
})

const textStyles = {
  primary: styles.primaryText,
  danger: styles.primaryText,
  outline: styles.outlineText,
  text: styles.textVariantText,
}