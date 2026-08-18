import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface ParamCardProps {
  label: string
  value: string
  color?: string
}

export default function ParamCard({ label, value, color }: ParamCardProps) {
  return (
    <View style={styles.card}>
      <Text style={styles.label}>{label}</Text>
      <Text style={[styles.value, color ? { color } : undefined]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2,
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: colors.white,
    borderRadius: 10,
    minHeight: 64,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
    lineHeight: 15.4,
    textAlign: 'center',
  },
  value: {
    fontFamily: 'monospace',
    fontSize: 22,
    fontWeight: '600',
    color: colors.dark,
    lineHeight: 28.6,
    textAlign: 'center',
  },
})