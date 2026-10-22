import { useRef, useState } from 'react'
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import type { TextInput } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors, useAuth } from 'shared'
import Button from '../ui/Button'
import { API_BASE_URL_MISSING } from '../platform/config'
import type { AuthScreenProps } from '../navigation/types'
import AuthHero from '../ui/AuthHero'
import BackButton from '../ui/BackButton'
import { ErrorBanner, ErrorNotice } from '../ui/Feedback'
import TextField from '../ui/TextField'

export default function LoginScreen({ navigation }: AuthScreenProps<'Login'>) {
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<unknown>(null)
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
      setError(err)
      setLoading(false)
    }
  }

  const goComingSoon = () => navigation.navigate('ComingSoon')

  return (
    <KeyboardAvoidingView style={styles.root} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        bounces={false}
        style={styles.fill}
      >
        <AuthHero height={260}>
          <Text style={styles.headline} accessibilityRole="header">
            Log in to read{'\n'}your paper ECGs
          </Text>
        </AuthHero>
        <View style={styles.backOverlay}>
          <BackButton
            color={colors.white}
            onPress={() => (navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Welcome'))}
          />
        </View>
        <View style={styles.sheet}>
          <Text style={styles.title}>Sign in</Text>
          <Pressable onPress={goComingSoon} accessibilityRole="link">
            <Text style={styles.muted}>
              Don't have an account? <Text style={styles.link}>Sign up</Text>
            </Text>
          </Pressable>

          {API_BASE_URL_MISSING && <ErrorBanner message="App has no server configured (EXPO_PUBLIC_API_BASE_URL)." />}
          <TextField
            label="Username"
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
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            autoComplete="current-password"
            textContentType="password"
            returnKeyType="go"
            onSubmitEditing={() => void handleSubmit()}
            testID="login-password"
          />
          {error != null && <ErrorNotice error={error} />}
          <Button fullWidth loading={loading} onPress={() => void handleSubmit()} testID="login-submit">
            Sign in
          </Button>

          <Text style={[styles.muted, styles.or]}>Or continue with</Text>
          <View style={styles.altRow}>
            <Pressable
              style={({ pressed }) => [styles.altButton, styles.apple, pressed && styles.pressed]}
              onPress={goComingSoon}
              accessibilityRole="button"
              testID="login-apple"
            >
              <Svg viewBox="0 0 24 24" width={18} height={18}>
                <Path
                  fill={colors.white}
                  d="M16.37 12.6c-.02-2.3 1.88-3.4 1.96-3.46-1.07-1.56-2.73-1.78-3.32-1.8-1.41-.14-2.76.83-3.48.83-.72 0-1.82-.81-3-.79-1.54.02-2.96.9-3.76 2.28-1.6 2.78-.41 6.9 1.15 9.16.76 1.1 1.67 2.34 2.86 2.3 1.15-.05 1.58-.74 2.97-.74 1.38 0 1.78.74 2.99.72 1.24-.02 2.02-1.12 2.77-2.23.87-1.28 1.23-2.52 1.25-2.58-.03-.01-2.4-.92-2.39-3.69zM14.1 5.85c.63-.77 1.06-1.83.94-2.9-.91.04-2.02.61-2.67 1.37-.58.67-1.1 1.76-.96 2.8 1.02.08 2.06-.52 2.69-1.27z"
                />
              </Svg>
              <Text style={[styles.altText, styles.appleText]}>Apple</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [styles.altButton, styles.google, pressed && styles.pressed]}
              onPress={goComingSoon}
              accessibilityRole="button"
              testID="login-google"
            >
              <Svg viewBox="0 0 24 24" width={18} height={18}>
                <Path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z" />
                <Path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z" />
                <Path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18A11 11 0 0 0 1 12c0 1.78.43 3.45 1.18 4.94l3.66-2.84z" />
                <Path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z" />
              </Svg>
              <Text style={styles.altText}>Google</Text>
            </Pressable>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondary },
  fill: { flex: 1 },
  backOverlay: { position: 'absolute', top: 12, left: 12 },
  scroll: { flexGrow: 1, width: '100%', maxWidth: 480, alignSelf: 'center' },
  headline: { fontSize: 28, fontWeight: '700', color: colors.white, lineHeight: 34 },
  sheet: {
    flex: 1,
    marginTop: -32,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 24,
    gap: 14,
  },
  title: { fontSize: 24, fontWeight: '700', color: colors.secondary, textAlign: 'center' },
  muted: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  link: { color: colors.secondary, fontWeight: '700' },
  or: { marginTop: 4 },
  altRow: { flexDirection: 'row', gap: 12 },
  altButton: {
    flex: 1,
    minHeight: 52,
    borderRadius: 26,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingHorizontal: 8,
  },
  apple: { backgroundColor: colors.dark },
  google: { backgroundColor: '#F1F2F1' },
  pressed: { opacity: 0.7 },
  appleText: { color: colors.white },
  altText: { fontSize: 15, fontWeight: '600', color: colors.text },
})
