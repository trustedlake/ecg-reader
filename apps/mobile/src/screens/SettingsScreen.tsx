import { useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import { DEFAULT_CALIBRATION, LAYOUTS } from '../flow/defaults'
import Screen from '../ui/Screen'
import { Row, Section } from '../ui/Section'
import appConfig from '../../app.json'

function ToggleRow({ label, hint, value, onChange, last }: { label: string; hint: string; value: boolean; onChange: (v: boolean) => void; last?: boolean }) {
  return (
    <View style={[styles.toggle, !last && styles.divider]}>
      <View style={styles.toggleText}>
        <Text style={styles.toggleLabel}>{label}</Text>
        <Text style={styles.toggleHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ true: colors.primary, false: colors.gridBorder }}
        thumbColor={colors.white}
        // Web-only prop: without it react-native-web paints the active thumb teal.
        {...({ activeThumbColor: colors.white } as object)}
        accessibilityLabel={label}
      />
    </View>
  )
}

export default function SettingsScreen({ navigation }: AppScreenProps<'Settings'>) {
  // Preferences are kept on screen only for now; nothing reads them yet.
  const [notify, setNotify] = useState(true)
  const [keepPhoto, setKeepPhoto] = useState(false)

  return (
    <Screen title="Settings" onBack={() => navigation.goBack()}>
      <Section title="Reading defaults">
        <Row label="Paper speed" value={`${DEFAULT_CALIBRATION.speed_mm_s} mm/s`} />
        <Row label="Gain" value={`${DEFAULT_CALIBRATION.gain_mm_mv} mm/mV`} />
        <Row label="Layouts" value={LAYOUTS.join(' · ')} last />
      </Section>
      <Text style={styles.note}>Speed, gain and layout can be changed for each exam when you take the photo.</Text>

      <Section title="Preferences">
        <ToggleRow label="Result notifications" hint="Alert me when an ECG reading is ready" value={notify} onChange={setNotify} />
        <ToggleRow label="Keep original photo" hint="Save a copy of each ECG photo on this device" value={keepPhoto} onChange={setKeepPhoto} last />
      </Section>

      <Section title="App">
        <Row label="Language" value="English" />
        <Row label="Version" value={appConfig.expo.version} last />
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  note: { fontSize: 13, color: colors.textMuted, marginTop: -8, marginHorizontal: 4 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gridBorder },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 16, color: colors.dark },
  toggleHint: { fontSize: 13, color: colors.textMuted },
})
