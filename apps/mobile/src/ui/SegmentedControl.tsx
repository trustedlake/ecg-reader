import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from './Text'
import { colors } from 'shared'

interface Option<T extends string | number> {
  value: T
  label: string
}

interface SegmentedControlProps<T extends string | number> {
  label: string
  options: Option<T>[]
  value: T | null
  onChange: (value: T) => void
  error?: string | null
  wrap?: boolean
}

export default function SegmentedControl<T extends string | number>({
  label,
  options,
  value,
  onChange,
  error,
  wrap = false,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <View style={[styles.row, wrap && styles.wrap]} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value
          return (
            <Pressable
              key={String(option.value)}
              onPress={() => onChange(option.value)}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`${label}: ${option.label}`}
              style={({ pressed }) => [
                styles.segment,
                wrap && styles.segmentWrap,
                selected && styles.selected,
                error && !selected ? styles.segmentError : null,
                pressed && styles.pressed,
              ]}
            >
              <Text style={[styles.text, selected && styles.selectedText]}>{option.label}</Text>
            </Pressable>
          )
        })}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  )
}

const styles = StyleSheet.create({
  field: { gap: 6, width: '100%' },
  label: { fontSize: 14, fontWeight: '600', color: colors.dark },
  row: { flexDirection: 'row', gap: 8 },
  wrap: { flexWrap: 'wrap' },
  segment: {
    flex: 1,
    minHeight: 44,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segmentWrap: { flexGrow: 0, flexBasis: 'auto' },
  segmentError: { borderColor: colors.error },
  selected: { backgroundColor: colors.secondary, borderColor: colors.secondary },
  pressed: { opacity: 0.7 },
  text: { fontSize: 15, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  selectedText: { color: colors.white },
  error: { fontSize: 13, color: '#c62828' },
})
