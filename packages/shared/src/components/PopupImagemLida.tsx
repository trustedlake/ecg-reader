import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface PopupImagemLidaProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export default function PopupImagemLida({ open, onClose, onConfirm }: PopupImagemLidaProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>✓</Text>
        </View>
        <Text style={styles.title}>Imagem Lida</Text>
        <Text style={styles.description}>
          A imagem do ECG foi processada com sucesso.
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onConfirm ?? onClose}>Continuar</Button>
          <Button variant="text" onPress={onClose}>Cancelar</Button>
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