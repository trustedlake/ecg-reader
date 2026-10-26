import { useState } from 'react'
import { StyleSheet, Switch, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors } from 'shared'
import type { Layout } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import { DEFAULT_CALIBRATION, GAINS_MM_MV, LAYOUTS, SPEEDS_MM_S } from '../flow/defaults'
import { useReadingDefaults } from '../flow/readingDefaults'
import { LAYOUT_LABELS } from '../ui/labels'
import SegmentedControl from '../ui/SegmentedControl'
import { useApi } from '../api/ApiProvider'
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

  const { config } = useApi()
  const [saved, change] = useReadingDefaults()
  const calibration = saved.calibration ?? config?.calibration.default ?? DEFAULT_CALIBRATION
  const speeds = config?.calibration.speed_mm_s ?? SPEEDS_MM_S
  const gains = config?.calibration.gain_mm_mv ?? GAINS_MM_MV
  const layouts = config?.layouts ?? LAYOUTS

  return (
    <Screen title="Settings" onBack={() => navigation.goBack()}>
      <Section title="Reading defaults">
        <View style={styles.editor}>
          <SegmentedControl<number>
            label="Paper speed"
            options={speeds.map((v) => ({ value: v, label: `${String(v)} mm/s` }))}
            value={calibration.speed_mm_s}
            onChange={(speed_mm_s) => change({ calibration: { ...calibration, speed_mm_s } })}
          />
          <SegmentedControl<number>
            label="Gain"
            options={gains.map((v) => ({ value: v, label: `${v} mm/mV` }))}
            value={calibration.gain_mm_mv}
            onChange={(gain_mm_mv) => change({ calibration: { ...calibration, gain_mm_mv } })}
          />
          <SegmentedControl<string>
            label="Layout"
            wrap
            options={[{ value: 'ask', label: 'Ask each time' }, ...layouts.map((l) => ({ value: l, label: LAYOUT_LABELS[l] }))]}
            value={saved.layout ?? 'ask'}
            onChange={(v) => change({ layout: v === 'ask' ? null : (v as Layout) })}
          />
        </View>
      </Section>
      <Text style={styles.note}>These are the starting values for each new exam. You can still change them per exam.</Text>

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
  editor: { gap: 14, padding: 14 },
  note: { fontSize: 13, color: colors.textMuted, marginTop: -8, marginHorizontal: 4 },
  toggle: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, paddingHorizontal: 16 },
  divider: { borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.gridBorder },
  toggleText: { flex: 1, gap: 2 },
  toggleLabel: { fontSize: 16, color: colors.dark },
  toggleHint: { fontSize: 13, color: colors.textMuted },
})
