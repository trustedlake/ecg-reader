import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface PopupCupomProps {
  open: boolean
  onClose: () => void
}

export default function PopupCupom({ open, onClose }: PopupCupomProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <Text style={styles.title}>Cupom de Desconto</Text>
        <Text style={styles.description}>
          Utilize o cupom <Text style={styles.strong}>ECG10</Text> para ganhar 10% de desconto no seu primeiro mês!
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onClose}>Ok</Button>
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
  strong: {
    fontWeight: '700',
  },
  actions: {
    width: '100%',
    marginTop: 8,
  },
})