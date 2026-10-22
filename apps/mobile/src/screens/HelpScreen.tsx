import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import { MIN_LONG_SIDE_PX, MIN_SHORT_SIDE_PX } from '../flow/defaults'
import Screen from '../ui/Screen'
import { Section } from '../ui/Section'

const STEPS = [
  { title: 'Create an exam', text: 'Tap "New exam" and enter the patient details.' },
  { title: 'Photograph the ECG', text: 'Take a photo of the paper ECG or pick one from the gallery.' },
  { title: 'Confirm the layout', text: 'Check the lead layout, paper speed and gain printed on the sheet.' },
  { title: 'Wait for the reading', text: 'The app finds each lead and turns the trace into a digital signal.' },
  { title: 'Review the result', text: 'Check the extracted signal and its interpretation before using it.' },
]

const TIPS = [
  'Fit the whole sheet in the frame, with all four corners visible.',
  'Use even light. Avoid glare, flash reflections and shadows.',
  'Hold the camera parallel to the sheet, not at an angle.',
  'Flatten folds and creases before taking the photo.',
  `Use a sharp photo of at least ${MIN_LONG_SIDE_PX} × ${MIN_SHORT_SIDE_PX} pixels.`,
]

const FAQ = [
  {
    q: 'Which ECGs can it read?',
    a: 'Standard 12-lead paper ECGs printed in the 3x4+1 or 12x1 layouts, at 12.5, 25 or 50 mm/s and 5, 10 or 20 mm/mV.',
  },
  {
    q: 'Why was my photo refused?',
    a: 'The photo was too blurry, too small, cropped, or had glare over the trace. Take a new photo following the tips above.',
  },
  {
    q: 'Is the result a diagnosis?',
    a: 'No. ECG Reader is a research tool. A qualified clinician must always review the original ECG.',
  },
  {
    q: 'Where are my previous exams?',
    a: 'Open "My exams" from the Home screen. Each exam keeps all of its photos and results.',
  },
]

function FaqItem({ q, a, last }: { q: string; a: string; last?: boolean }) {
  const [open, setOpen] = useState(false)
  return (
    <Pressable
      onPress={() => setOpen((v) => !v)}
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      style={[styles.faq, !last && styles.divider]}
    >
      <View style={styles.faqHead}>
        <Text style={styles.faqQ}>{q}</Text>
        <Text style={styles.faqToggle}>{open ? '−' : '+'}</Text>
      </View>
      {open && <Text style={styles.faqA}>{a}</Text>}
    </Pressable>
  )
}

export default function HelpScreen({ navigation }: AppScreenProps<'Help'>) {
  return (
    <Screen title="Help" onBack={() => navigation.goBack()}>
      <Section title="How it works">
        {STEPS.map((step, i) => (
          <View key={step.title} style={[styles.step, i < STEPS.length - 1 && styles.divider]}>
            <View style={styles.stepNumber}>
              <Text style={styles.stepNumberText}>{i + 1}</Text>
            </View>
            <View style={styles.stepText}>
              <Text style={styles.stepTitle}>{step.title}</Text>
              <Text style={styles.stepBody}>{step.text}</Text>
            </View>
          </View>
        ))}
      </Section>

      <Section title="Taking a good photo">
        <View style={styles.tips}>
          {TIPS.map((tip) => (
            <View key={tip} style={styles.tip}>
              <Text style={styles.bullet}>✓</Text>
              <Text style={styles.tipText}>{tip}</Text>
            </View>
          ))}
        </View>
      </Section>

      <Section title="Questions">
        {FAQ.map((item, i) => (
          <FaqItem key={item.q} q={item.q} a={item.a} last={i === FAQ.length - 1} />
        ))}
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gridBorder },
  step: { flexDirection: 'row', gap: 14, padding: 16, alignItems: 'flex-start' },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: { color: colors.white, fontWeight: '800', fontSize: 14 },
  stepText: { flex: 1, gap: 2 },
  stepTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  stepBody: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
  tips: { padding: 16, gap: 10 },
  tip: { flexDirection: 'row', gap: 10 },
  bullet: { fontSize: 15, fontWeight: '800', color: colors.primary },
  tipText: { flex: 1, fontSize: 15, color: colors.dark, lineHeight: 21 },
  faq: { padding: 16, gap: 8 },
  faqHead: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  faqQ: { flex: 1, fontSize: 16, fontWeight: '600', color: colors.dark },
  faqToggle: { fontSize: 22, color: colors.secondary, width: 20, textAlign: 'center' },
  faqA: { fontSize: 14, color: colors.textMuted, lineHeight: 20 },
})
