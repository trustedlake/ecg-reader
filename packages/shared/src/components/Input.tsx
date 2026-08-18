import { StyleSheet, TextInput } from 'react-native'
import type { StyleProp, TextStyle, ViewStyle } from 'react-native'
import { colors } from '../theme'

interface InputProps {
  label?: string
  value?: string
  onChangeText?: (text: string) => void
  placeholder?: string
  secureTextEntry?: boolean
  keyboardType?: 'default' | 'numeric' | 'email-address' | 'phone-pad'
  autoComplete?: 'off' | 'username' | 'current-password' | 'new-password' | 'email'
  editable?: boolean
  style?: StyleProp<ViewStyle | TextStyle>
  testID?: string
}

export default function Input({ label, style, ...props }: InputProps) {
  return (
    <TextInput
      style={[styles.input, style]}
      placeholder={label}
      placeholderTextColor={colors.textMuted}
      {...props}
    />
  )
}

const styles = StyleSheet.create({
  input: {
    width: '100%',
    height: 52,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 12,
    backgroundColor: colors.background,
    fontSize: 15,
    color: colors.text,
  },
})