import { StyleSheet, View, useWindowDimensions } from 'react-native'
import { Text } from '../ui/Text'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { colors } from 'shared'
import Button from '../ui/Button'
import AuthHero from '../ui/AuthHero'
import type { AuthScreenProps } from '../navigation/types'

export default function WelcomeScreen({ navigation }: AuthScreenProps<'Welcome'>) {
  const { height } = useWindowDimensions()
  return (
    <View style={styles.root}>
      <AuthHero height={Math.round(height * 0.55)}>
        <SafeAreaView edges={['top']} style={styles.logoRow}>
          <View style={styles.iconBg}>
            <Svg viewBox="-2 0 48 28" width={36} height={22} fill="none">
              <Path
                d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0"
                stroke={colors.white}
                strokeWidth={3}
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </Svg>
          </View>
          <Text style={styles.brand}>ECG Reader</Text>
        </SafeAreaView>
      </AuthHero>
      <SafeAreaView edges={['bottom']} style={styles.card}>
        <Text style={styles.title} accessibilityRole="header">
          Paper or Digital ECGs, read in seconds
        </Text>
        <Text style={styles.subtitle}>Photograph a paper ECG and get the digitised signal and its interpretation.</Text>
        <Button fullWidth onPress={() => navigation.navigate('Login')} testID="welcome-start">
          Get started
        </Button>
      </SafeAreaView>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.secondary },
  logoRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  iconBg: {
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 2,
    borderColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: { fontSize: 28, fontWeight: '700', color: colors.white, letterSpacing: -0.5 },
  card: {
    flex: 1,
    marginTop: -32,
    backgroundColor: colors.white,
    borderTopLeftRadius: 32,
    borderTopRightRadius: 32,
    padding: 28,
    gap: 14,
    justifyContent: 'center',
  },
  title: { fontSize: 26, fontWeight: '700', color: colors.secondary, textAlign: 'center' },
  subtitle: { fontSize: 15, color: colors.textMuted, textAlign: 'center', marginBottom: 12 },
})
