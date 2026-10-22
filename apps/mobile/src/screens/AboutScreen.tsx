import { StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import Svg, { Path } from 'react-native-svg'
import { colors } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import Screen from '../ui/Screen'
import { Section } from '../ui/Section'
import appConfig from '../../app.json'

const FEATURES = [
  { title: 'Photo to signal', text: 'Reads each of the 12 leads from a phone photo of a paper ECG.' },
  { title: 'Any paper, any colour', text: 'Separates the trace from the grid on red, green, blue and black-and-white paper.' },
  { title: 'Honest about gaps', text: 'Marks unreadable parts of the trace instead of inventing a signal.' },
]

export default function AboutScreen({ navigation }: AppScreenProps<'About'>) {
  return (
    <Screen title="About" onBack={() => navigation.goBack()}>
      <View style={styles.hero}>
        <View style={styles.logo}>
          <Svg viewBox="-2 0 48 28" width={52} height={32} fill="none">
            <Path
              d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0"
              stroke={colors.white}
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.name}>ECG Reader</Text>
        <Text style={styles.version}>Version {appConfig.expo.version}</Text>
        <Text style={styles.tagline}>
          Turns photos of paper electrocardiograms into digital signals, so old and printed ECGs can be stored, shared and
          analysed.
        </Text>
      </View>

      <Section title="What it does">
        {FEATURES.map((f, i) => (
          <View key={f.title} style={[styles.feature, i < FEATURES.length - 1 && styles.divider]}>
            <Text style={styles.featureTitle}>{f.title}</Text>
            <Text style={styles.featureText}>{f.text}</Text>
          </View>
        ))}
      </Section>

      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerTitle}>Still not a medical device</Text>
        <Text style={styles.disclaimerText}>
          ECG Reader is a research prototype. Its results must not be used for diagnosis or treatment without review by a
          qualified clinician.
        </Text>
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  logo: {
    width: 88,
    height: 88,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  name: { fontSize: 24, fontWeight: '800', color: colors.dark },
  version: { fontSize: 14, color: colors.textMuted },
  tagline: { fontSize: 15, color: colors.dark, textAlign: 'center', lineHeight: 22, marginTop: 6, paddingHorizontal: 8 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gridBorder },
  feature: { padding: 16, gap: 4 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  featureText: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  disclaimer: { backgroundColor: '#fff4e5', borderRadius: 16, padding: 16, gap: 4 },
  disclaimerTitle: { fontSize: 15, fontWeight: '800', color: '#8a5300' },
  disclaimerText: { fontSize: 14, color: '#8a5300', lineHeight: 20 },
})
