import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface CheckboxOption {
  value: string
  label: string
}

interface CheckboxGroupProps {
  options: CheckboxOption[]
  values: string[]
  onChange: (values: string[]) => void
}

export default function CheckboxGroup({ options, values, onChange }: CheckboxGroupProps) {
  const toggle = (val: string) => {
    if (values.includes(val)) {
      onChange(values.filter((v) => v !== val))
    } else {
      onChange([...values, val])
    }
  }

  return (
    <View style={styles.group}>
      {options.map((opt) => {
        const checked = values.includes(opt.value)
        return (
          <Pressable key={opt.value} style={styles.item} onPress={() => toggle(opt.value)}>
            <View style={[styles.checkbox, checked && styles.checked]}>
              {checked && <Text style={styles.checkmark}>✓</Text>}
            </View>
            <Text style={styles.label}>{opt.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  group: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  item: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: colors.textMuted,
    borderRadius: 4,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  checked: {
    backgroundColor: colors.neutral,
    borderColor: colors.neutral,
  },
  checkmark: {
    color: colors.white,
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    fontSize: 14,
    fontWeight: '400',
    color: colors.textLight,
    lineHeight: 19.6,
  },
})