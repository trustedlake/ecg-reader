import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface ImageReadPopup2Props {
  open: boolean
  onClose: () => void
}

export default function ImageReadPopup2({ open, onClose }: ImageReadPopup2Props) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>!</Text>
        </View>
        <Text style={styles.title}>Attention</Text>
        <Text style={styles.description}>
          Some parts of the image were not recognized correctly.
          Do you want to adjust the image?
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onClose}>Adjust Image</Button>
          <Button variant="text" onPress={onClose}>Continue anyway</Button>
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
    backgroundColor: colors.warning,
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