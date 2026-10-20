import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface ImageReadPopupProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export default function ImageReadPopup({ open, onClose, onConfirm }: ImageReadPopupProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.title}>Image Read</Text>
        <Text style={styles.description}>
          The ECG image was processed successfully.
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onConfirm ?? onClose}>Continue</Button>
          <Button variant="text" onPress={onClose}>Cancel</Button>
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
    backgroundColor: colors.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 28,
    fontWeight: '700',
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