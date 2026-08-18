import { StyleSheet, Text, View } from 'react-native'
import { colors } from '../theme'
import Button from './Button'
import Modal from './Modal'

interface PopupSentimosMuitoProps {
  open: boolean
  onClose: () => void
  onSendFeedback?: () => void
}

export default function PopupSentimosMuito({ open, onClose, onSendFeedback }: PopupSentimosMuitoProps) {
  return (
    <Modal open={open} onClose={onClose}>
      <View style={styles.content}>
        <View style={styles.icon}>
          <Text style={styles.iconText}>:(</Text>
        </View>
        <Text style={styles.title}>Sentimos Muito</Text>
        <Text style={styles.description}>
          Não foi possível processar a imagem do ECG. Por favor, tente novamente
          ou entre em contato com o suporte.
        </Text>
        <View style={styles.actions}>
          <Button fullWidth onPress={onClose}>Tentar Novamente</Button>
          {onSendFeedback && (
            <Button variant="text" onPress={onSendFeedback}>Enviar Feedback</Button>
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