import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface ChipOption {
  value: string
  label: string
}

interface ChipSelectProps {
  options: ChipOption[]
  value: string
  onChange: (value: string) => void
}

export default function ChipSelect({ options, value, onChange }: ChipSelectProps) {
  return (
    <View style={styles.chips}>
      {options.map((opt) => {
        const selected = value === opt.value
        return (
          <Pressable
            key={opt.value}
            style={[styles.chip, selected && styles.selected]}
            onPress={() => onChange(opt.value)}
          >
            <Text style={[styles.chipText, selected && styles.selectedText]}>{opt.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  chips: {
    display: 'flex',
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  chip: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 34,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.textMuted,
    backgroundColor: colors.white,
    minWidth: 95,
  },
  selected: {
    backgroundColor: colors.neutral,
    borderColor: colors.neutral,
  },
  chipText: {
    fontFamily: 'monospace',
    fontSize: 13,
    fontWeight: '600',
    color: colors.dark,
  },
  selectedText: {
    color: colors.white,
  },
})