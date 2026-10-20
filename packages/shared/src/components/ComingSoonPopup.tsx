import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface ComingSoonPopupProps {
  open: boolean
  onClose: () => void
}

export default function ComingSoonPopup({ open, onClose }: ComingSoonPopupProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>🔧</Text>
        </View>
        <Text style={styles.title}>Coming soon</Text>
        <Text style={styles.description}>
          ECG Reader is still in testing. Creating new exams is only
          available to the internal team for now, but it will soon be
          available to all users.
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onClose}>Got it</Button>
        </View>
      </View>
    </Modal>
  )
}

const styles = StyleSheet.create({
  content: {
    alignItems: 'center',
    gap: 16,
  },
  icon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 26,
    color: colors.white,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.dark,
    textAlign: 'center',
  },
  description: {
    fontSize: 14,
    lineHeight: 21,
    color: colors.textMuted,
    textAlign: 'center',
  },
  actions: {
    width: '100%',
    gap: 8,
    marginTop: 8,
  },
})