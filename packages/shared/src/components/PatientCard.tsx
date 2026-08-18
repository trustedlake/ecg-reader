import { Pressable, StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'

interface PatientCardProps {
  name: string
  date: string
  status?: 'success' | 'warning' | 'error'
  onPress?: () => void
}

const statusColors = {
  success: colors.success,
  warning: colors.warning,
  error: colors.error,
}

export default function PatientCard({ name, date, status = 'success', onPress }: PatientCardProps) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.card, pressed && styles.pressed]}>
      <View style={[styles.status, { backgroundColor: statusColors[status] }]} />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.date}>{date}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  card: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    width: '100%',
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderRadius: 14,
  },
  pressed: {
    backgroundColor: colors.background,
  },
  status: {
    width: 10,
    height: 10,
    borderRadius: 5,
    flexShrink: 0,
  },
  info: {
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.dark,
    lineHeight: 22.4,
  },
  date: {
    fontSize: 12,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 16.8,
  },
})