import { useState } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { colors } from 'shared'
import type { DiagnosisCheck, Finding } from 'shared'
import { Text } from '../../ui/Text'
import { TONE_COLORS, Tag } from '../../ui/Feedback'
import type { ReactNode } from 'react'
import { viewStyles } from './common'

type CheckState = { icon: string; label: string; tone: 'success' | 'attention' | 'danger' | 'neutral' }

function stateOf(check: DiagnosisCheck): CheckState {
  if (check.status === 'not_possible') return { icon: '?', label: 'Could not check', tone: 'attention' }
  if (check.status === 'not_implemented') return { icon: '–', label: 'Not checked', tone: 'neutral' }
  if (check.alert_level === 'urgent') return { icon: '✖', label: 'Urgent', tone: 'danger' }
  if (check.alert_level === 'review') return { icon: '!', label: 'Review', tone: 'attention' }
  return { icon: '✓', label: 'Normal', tone: 'success' }
}

/** Every check that was run: tap a row to see its result and the evidence behind it. */
export default function Checklist({
  checks,
  findings,
  renderEvidence,
}: {
  checks: DiagnosisCheck[]
  findings: Finding[]
  /** Optional rich evidence (photo crop, signal window) for a finding; text evidence is always shown. */
  renderEvidence?: (finding: Finding) => ReactNode
}) {
  return (
    <View style={styles.list} testID="checklist">
      {checks.map((check) => (
        <CheckRow key={check.code} check={check} findings={findings} renderEvidence={renderEvidence} />
      ))}
    </View>
  )
}

function CheckRow({
  check,
  findings,
  renderEvidence,
}: {
  check: DiagnosisCheck
  findings: Finding[]
  renderEvidence?: (finding: Finding) => ReactNode
}) {
  const [open, setOpen] = useState(check.alert_level !== 'ok' && check.status === 'done')
  const state = stateOf(check)
  const tone = TONE_COLORS[state.tone]
  const linked = findings.filter((finding) => check.finding_codes.includes(finding.code))

  return (
    <View style={styles.row}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.head}
        testID={`check-${check.code}`}
      >
        <View style={[styles.bullet, { backgroundColor: tone.bg }]}>
          <Text style={[styles.bulletText, { color: tone.fg }]}>{state.icon}</Text>
        </View>
        <View style={styles.title}>
          <Text style={styles.name}>{check.name}</Text>
          {check.value ? <Text style={viewStyles.muted}>{check.value}</Text> : null}
        </View>
        <Tag label={state.label} tone={state.tone} />
        <Text style={styles.toggle}>{open ? '▲' : '▼'}</Text>
      </Pressable>
      {open && (
        <View style={styles.body}>
          {check.reason ? <Text style={viewStyles.text}>{check.reason}</Text> : null}
          {check.status === 'done' && linked.length === 0 ? <Text style={viewStyles.muted}>Nothing abnormal found.</Text> : null}
          {linked.map((finding) => (
            <View key={finding.code} style={styles.evidence}>
              <Text style={styles.name}>{finding.label}</Text>
              {finding.evidence ? <Text style={viewStyles.muted}>{finding.evidence}</Text> : null}
              {renderEvidence?.(finding)}
            </View>
          ))}
        </View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: { borderWidth: 1, borderColor: colors.gridBorder, borderRadius: 10, overflow: 'hidden' },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10, padding: 12 },
  bullet: { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  bulletText: { fontSize: 14, fontWeight: '800' },
  title: { flex: 1, gap: 2 },
  name: { fontSize: 14, fontWeight: '700', color: colors.dark },
  toggle: { fontSize: 12, color: colors.primary },
  body: { gap: 10, paddingHorizontal: 12, paddingBottom: 12 },
  evidence: { gap: 4 },
})
