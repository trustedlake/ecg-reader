import { forwardRef } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import type { TextInputProps } from 'react-native'
import { colors } from 'shared'

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string
  error?: string | null
}

/** Field with a visible label and inline error (read by the screen reader together with the label). */
const TextField = forwardRef<TextInput, TextFieldProps>(function TextField({ label, error, ...props }, ref) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        ref={ref}
        accessibilityLabel={error ? `${label}. ${error}` : label}
        placeholderTextColor={colors.textMuted}
        style={[styles.input, error ? styles.inputError : null]}
        {...props}
      />
      {error ? (
        <Text style={styles.error} accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  )
})

export default TextField

const styles = StyleSheet.create({
  field: { gap: 6, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: colors.dark },
  input: {
    minHeight: 50,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    backgroundColor: colors.background,
    fontSize: 16,
    color: colors.text,
  },
  inputError: { borderColor: colors.error },
  error: { fontSize: 13, color: '#c62828' },
})
