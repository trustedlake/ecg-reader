import { useState } from 'react'
import { KeyboardAvoidingView, Platform, StyleSheet, Text, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Button, Input, colors, useAuth } from 'shared'

export default function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  async function handleSubmit() {
    setError(null)
    setLoading(true)
    try {
      await login(username, password)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Não foi possível entrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.keyboard}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.content}>
          <View style={styles.iconBg}>
            <Svg viewBox="-2 0 48 28" width={70} height={50} fill="none">
              <Path
                d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0"
                stroke={colors.white}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>

          <Text style={styles.title}>Leitor ECG</Text>
          <Text style={styles.subtitle}>Leitura e análise de ECG</Text>

          <View style={styles.form}>
            <Input
              label="Usuário"
              value={username}
              onChangeText={setUsername}
              autoComplete="username"
            />
            <Input
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
            />

            {error && <Text style={styles.error}>{error}</Text>}

            <Button fullWidth disabled={loading} onPress={() => void handleSubmit()}>
              {loading ? 'Entrando...' : 'Entrar'}
            </Button>
          </View>

          <Text style={styles.version}>Ambiente de testes · Versão 1.1.14</Text>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: colors.white,
  },
  keyboard: {
    flex: 1,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 30,
    paddingVertical: 24,
  },
  iconBg: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  title: {
    fontSize: 36,
    fontWeight: '700',
    color: colors.secondary,
    letterSpacing: -1,
    lineHeight: 43,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.textMuted,
    lineHeight: 22,
    marginBottom: 40,
  },
  form: {
    width: '100%',
    gap: 12,
    marginBottom: 24,
  },
  error: {
    fontSize: 14,
    color: '#d32f2f',
    textAlign: 'center',
    marginBottom: 4,
  },
  version: {
    fontSize: 12,
    color: colors.textMuted,
  },
})