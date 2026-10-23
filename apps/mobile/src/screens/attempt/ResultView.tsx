import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../ui/Text'
import { colors } from 'shared'
import Button from '../../ui/Button'
import type { InterpretationDetails } from 'shared'
import { InfoBox, TONE_COLORS, Tag } from '../../ui/Feedback'
import {
  ALERT_LABELS,
  CLASSIFICATION_LABELS,
  CONFIDENCE_LABELS,
  CRITERION_STATUS_LABELS,
  LEAD_QUALITY_LABELS,
  MEASUREMENT_LABELS,
  SEVERITY_LABELS,
  formatValue,
} from '../../ui/labels'
import Screen from '../../ui/Screen'
import ZoomableImage from '../../ui/ZoomableImage'
import Checklist from './Checklist'
import FeedbackForm from './FeedbackForm'
import { AttemptContext, backToExam, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** completed: highlighted summary, expandable details and the always-visible disclaimer. */
export default function ResultView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const interpretation = attempt.interpretation
  const summary = interpretation?.summary
  const classification = summary ? CLASSIFICATION_LABELS[summary.classification] : null
  const alert = summary?.alert_level ? ALERT_LABELS[summary.alert_level] : null
  // The alert level is the diagnoser's own verdict; it sets the colour when present.
  const tone = alert ? TONE_COLORS[alert.tone] : classification ? TONE_COLORS[classification.tone] : TONE_COLORS.neutral

  return (
    <Screen
      title="Result"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        feedbackOpen ? undefined : (
          <>
            <Button fullWidth variant="outline" onPress={() => setFeedbackOpen(true)} testID="feedback-open">
              Send feedback
            </Button>
            <Button fullWidth variant="text" onPress={() => backToExam(navigation, exam.id)}>
              Back to exam
            </Button>
          </>
        )
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />

      {summary && classification ? (
        <View style={[styles.summary, { backgroundColor: tone.bg, borderColor: tone.fg }]} testID="summary">
          {alert ? (
            <View style={styles.list} testID="alert">
              <Text style={[styles.classification, { color: tone.fg }]}>
                {alert.icon} {alert.label}
              </Text>
              {summary.alert_text ? <Text style={viewStyles.text}>{summary.alert_text}</Text> : null}
              {(summary.alert_reasons ?? []).map((reason) => (
                <Text key={reason} style={viewStyles.muted}>
                  • {reason}
                </Text>
              ))}
            </View>
          ) : (
            <Text style={[styles.classification, { color: tone.fg }]}>
              {classification.icon} {classification.label}
            </Text>
          )}
          <Text style={styles.headline} accessibilityRole="header">
            {summary.headline}
          </Text>
          <View style={styles.vitals}>
            <Vital label="Rhythm" value={summary.rhythm} />
            <Vital label="Heart rate" value={formatValue(summary.heart_rate_bpm, 'bpm')} />
          </View>
          {summary.key_findings.length > 0 && (
            <View style={styles.list}>
              {summary.key_findings.map((finding) => (
                <Text key={finding} style={viewStyles.text}>
                  • {finding}
                </Text>
              ))}
            </View>
          )}
          {summary.text ? <Text style={viewStyles.text}>{summary.text}</Text> : null}
        </View>
      ) : (
        <InfoBox>The interpretation summary is not available.</InfoBox>
      )}

      <ExamImages originalUrl={attempt.original_image_url} extractedUrl={attempt.reading?.overlay_url} />

      {interpretation?.details && <Details details={interpretation.details} />}

      {interpretation?.disclaimer && (
        <Text style={styles.disclaimer} testID="disclaimer">
          ⓘ {interpretation.disclaimer}
        </Text>
      )}

      {feedbackOpen && <FeedbackForm attemptId={attempt.id} onClose={() => setFeedbackOpen(false)} />}
    </Screen>
  )
}

/** The photo that was sent and the same photo with the extracted signal drawn on it. */
function ExamImages({ originalUrl, extractedUrl }: { originalUrl?: string | null; extractedUrl?: string | null }) {
  if (!originalUrl && !extractedUrl) return null
  return (
    <Section title="Photo and extracted signal" testID="details-images">
      {originalUrl ? (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Original photo</Text>
          <ZoomableImage uri={originalUrl} accessibilityLabel="Original ECG photo" />
        </View>
      ) : null}
      {extractedUrl ? (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Extracted signal</Text>
          <ZoomableImage uri={extractedUrl} accessibilityLabel="ECG photo with the extracted signal" />
        </View>
      ) : null}
    </Section>
  )
}

function Vital({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.vital}>
      <Text style={viewStyles.muted}>{label}</Text>
      <Text style={styles.vitalValue}>{value}</Text>
    </View>
  )
}

function Details({ details }: { details: InterpretationDetails }) {
  const known = Object.keys(MEASUREMENT_LABELS).filter((key) => key in details.measurements)
  const extra = Object.keys(details.measurements).filter((key) => !(key in MEASUREMENT_LABELS))
  const measurementKeys = [...known, ...extra]

  return (
    <View style={styles.details}>
      <Text style={viewStyles.section}>Details</Text>

      {measurementKeys.length > 0 && (
        <Section title="Measurements" testID="details-measurements">
          {measurementKeys.map((key) => {
            const measurement = details.measurements[key]
            const notes = [
              measurement.value === null ? null : `${CONFIDENCE_LABELS[measurement.confidence]} confidence`,
              measurement.lead ? `lead ${measurement.lead}` : null,
              measurement.formula ? `${measurement.formula} formula` : null,
            ].filter(Boolean)
            return (
              <Row
                key={key}
                label={MEASUREMENT_LABELS[key] ?? key}
                value={formatValue(measurement.value, measurement.unit)}
                note={notes.join(' · ')}
              />
            )
          })}
        </Section>
      )}

      {details.checks && details.checks.length > 0 ? (
        <View style={styles.details} testID="details-checklist">
          <Text style={styles.sectionTitle}>Checklist ({details.checks.filter((c) => c.status === 'done').length} of {details.checks.length} checked)</Text>
          <Checklist checks={details.checks} findings={details.findings} />
        </View>
      ) : (
        <Section title={`Findings (${details.findings.length})`} testID="details-findings">
          {details.findings.length === 0 && <Text style={viewStyles.muted}>No findings.</Text>}
          {details.findings.map((finding) => {
            const severity = SEVERITY_LABELS[finding.severity]
            return (
              <View key={finding.code} style={styles.item}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{finding.label}</Text>
                  <Tag label={severity.label} tone={severity.tone} />
                </View>
                {finding.evidence ? <Text style={viewStyles.muted}>{finding.evidence}</Text> : null}
              </View>
            )
          })}
        </Section>
      )}

      {details.criteria.length > 0 && (
        <Section title="Criteria evaluated" testID="details-criteria">
          {details.criteria.map((criterion) => {
            const status = CRITERION_STATUS_LABELS[criterion.status]
            return (
              <View key={criterion.name} style={styles.item}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{criterion.name}</Text>
                  <Tag label={status.label} icon={status.icon} tone={status.tone} />
                </View>
                <Text style={viewStyles.text}>
                  {formatValue(criterion.value, criterion.unit)} · reference {criterion.reference}
                </Text>
                {criterion.sex_specific && <Tag label="Depends on sex" icon="⚥" tone="progress" />}
              </View>
            )
          })}
        </Section>
      )}

      {details.per_lead.length > 0 && (
        <Section title="Per lead" testID="details-per-lead">
          {details.per_lead.map((lead) => {
            const quality = lead.quality ? LEAD_QUALITY_LABELS[lead.quality] : null
            return (
              <View key={lead.name} style={styles.item}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{lead.name}</Text>
                  {quality && <Tag label={quality.label} icon={quality.icon} tone={quality.tone} />}
                </View>
                <Text style={viewStyles.text}>
                  R {formatValue(roundMv(lead.r_amplitude_mv), 'mV')} · S {formatValue(roundMv(lead.s_amplitude_mv), 'mV')}
                </Text>
              </View>
            )
          })}
        </Section>
      )}
    </View>
  )
}

function roundMv(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : Math.round(value * 100) / 100
}

function Section({ title, testID, children }: { title: string; testID?: string; children: ReactNode }) {
  const [open, setOpen] = useState(false)
  return (
    <View style={styles.section}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={styles.sectionHead}
        testID={testID}
      >
        <Text style={styles.sectionTitle}>{title}</Text>
        <Text style={styles.sectionToggle}>{open ? '▲ Hide' : '▼ Show'}</Text>
      </Pressable>
      {open && <View style={styles.sectionBody}>{children}</View>}
    </View>
  )
}

function Row({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <View style={styles.row}>
      <View style={styles.rowLabel}>
        <Text style={styles.itemTitle}>{label}</Text>
        {note ? <Text style={viewStyles.muted}>{note}</Text> : null}
      </View>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  summary: { gap: 10, padding: 16, borderRadius: 12, borderWidth: 1 },
  classification: { fontSize: 15, fontWeight: '800', textTransform: 'uppercase', letterSpacing: 0.5 },
  headline: { fontSize: 20, fontWeight: '700', color: colors.dark },
  vitals: { flexDirection: 'row', flexWrap: 'wrap', gap: 20 },
  vital: { gap: 2 },
  vitalValue: { fontSize: 17, fontWeight: '700', color: colors.dark },
  list: { gap: 4 },
  details: { gap: 8 },
  section: { borderWidth: 1, borderColor: colors.gridBorder, borderRadius: 10, overflow: 'hidden' },
  sectionHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 14, gap: 8 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.dark, flexShrink: 1 },
  sectionToggle: { fontSize: 13, fontWeight: '600', color: colors.primary },
  sectionBody: { gap: 12, paddingHorizontal: 14, paddingBottom: 14 },
  item: { gap: 4 },
  itemHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 14, fontWeight: '700', color: colors.dark, flexShrink: 1 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 },
  rowLabel: { flexShrink: 1, gap: 2 },
  rowValue: { fontSize: 15, fontWeight: '700', color: colors.dark, textAlign: 'right' },
  disclaimer: {
    fontSize: 13,
    lineHeight: 19,
    color: colors.textLight,
    padding: 12,
    borderRadius: 8,
    backgroundColor: colors.background,
  },
})
