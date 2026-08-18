import { Pressable, StyleSheet, Text } from 'react-native'
import type { ReactNode } from 'react'
import type { StyleProp, ViewStyle } from 'react-native'
import { colors } from '../theme'

interface ButtonProps {
  variant?: 'primary' | 'outline' | 'text'
  fullWidth?: boolean
  disabled?: boolean
  onPress?: () => void
  style?: StyleProp<ViewStyle>
  children?: ReactNode
}

export default function Button({
  variant = 'primary',
  fullWidth = false,
  disabled = false,
  onPress,
  style,
  children,
}: ButtonProps) {
  return (
    <Pressable
      disabled={disabled}
      onPress={onPress}
      style={({ pressed }) => [
        styles.button,
        styles[variant],
        fullWidth && styles.fullWidth,
        pressed && !disabled && styles.pressed,
        style,
      ]}
    >
      <Text style={[styles.label, textStyles[variant]]}>{children}</Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  button: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 52,
    paddingHorizontal: 24,
    borderRadius: 10,
  },
  pressed: {
    opacity: 0.85,
  },
  fullWidth: {
    width: '100%',
  },
  primary: {
    backgroundColor: colors.secondary,
  },
  outline: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  text: {
    backgroundColor: 'transparent',
    height: 'auto',
    paddingHorizontal: 0,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
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
  outline: styles.outlineText,
  text: styles.textVariantText,
}