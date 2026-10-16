import { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import type { TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { Button, colors, useAuth } from 'shared'
import { API_BASE_URL_MISSING } from '../platform/config'
import { ErrorBanner } from '../ui/Feedback'
import { errorMessage } from '../ui/labels'
import TextField from '../ui/TextField'

export default function LoginScreen() {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const passwordRef = useRef<TextInput>(null)

  const canSubmit = username.trim() !== '' && password !== '' && !loading

  async function handleSubmit() {
    if (!canSubmit) return
    setError(null)
    setLoading(true)
    try {
      await login(username.trim(), password)
    } catch (err) {
      setError(errorMessage(err))
      setLoading(false)
    }
  }

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
          <View style={styles.iconBg} importantForAccessibility="no-hide-descendants">
            <Svg viewBox="-2 0 48 28" width={64} height={46} fill="none">
              <Path
                d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0"
                stroke={colors.white}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.title} accessibilityRole="header">
            Leitor ECG
          </Text>
          <Text style={styles.subtitle}>Leitura e interpretação de ECG em papel</Text>

          <View style={styles.form}>
            {API_BASE_URL_MISSING && (
              <ErrorBanner message="App sem servidor configurado (EXPO_PUBLIC_API_BASE_URL)." />
            )}
            <TextField
              label="Usuário"
              value={username}
              onChangeText={setUsername}
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="username"
              textContentType="username"
              returnKeyType="next"
              onSubmitEditing={() => passwordRef.current?.focus()}
              testID="login-username"
            />
            <TextField
              ref={passwordRef}
              label="Senha"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              autoComplete="current-password"
              textContentType="password"
              returnKeyType="go"
              onSubmitEditing={() => void handleSubmit()}
              testID="login-password"
            />
            {error && <ErrorBanner message={error} />}
            <Button fullWidth disabled={!canSubmit} loading={loading} onPress={() => void handleSubmit()} testID="login-submit">
              Entrar
            </Button>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    width: '100%',
    maxWidth: 420,
    alignSelf: 'center',
  },
  iconBg: {
    width: 104,
    height: 104,
    borderRadius: 52,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  title: { fontSize: 32, fontWeight: '700', color: colors.secondary, letterSpacing: -1 },
  subtitle: { fontSize: 16, color: colors.textMuted, marginTop: 4, marginBottom: 32, textAlign: 'center' },
  form: { width: '100%', gap: 14 },
})
