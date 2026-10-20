import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface SorryPopupProps {
  open: boolean
  onClose: () => void
  onSendFeedback?: () => void
}

export default function SorryPopup({ open, onClose, onSendFeedback }: SorryPopupProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>:(</Text>
        </View>
        <Text style={styles.title}>We're Sorry</Text>
        <Text style={styles.description}>
          The ECG image could not be processed. Please try again
          or contact support.
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onClose}>Try Again</Button>
          {onSendFeedback && (
            <Button variant="text" onPress={onSendFeedback}>Send Feedback</Button>
          )}
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
    backgroundColor: colors.error,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 22,
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