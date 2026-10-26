import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../../ui/Text'
import { colors } from 'shared'
import Button from '../../ui/Button'
import type { InterpretationDetails } from 'shared'
import { InfoBox, TONE_COLORS, Tag } from '../../ui/Feedback'
import {
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
import type { ImageMarker } from '../../ui/ZoomableImage'
import EvidenceCrop, { MARKER_COLORS } from './EvidenceCrop'
import PhotoCrop from './PhotoCrop'
import { useOriginalPhoto } from '../../flow/originalPhotos'
import FeedbackForm from './FeedbackForm'
import { AttemptContext, backToExam, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** completed: highlighted summary, expandable details and the always-visible disclaimer. */
export default function ResultView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackSent, setFeedbackSent] = useState(false)
  const feedbackKey = `feedback-sent:${attempt.id}`
  const localOriginal = useOriginalPhoto(attempt.id)
  useEffect(() => {
    AsyncStorage.getItem(feedbackKey)
      .then((value) => setFeedbackSent(value === '1'))
      .catch(() => undefined)
  }, [feedbackKey])
  const markFeedbackSent = () => {
    setFeedbackSent(true)
    AsyncStorage.setItem(feedbackKey, '1').catch(() => undefined)
  }
  const interpretation = attempt.interpretation
  const summary = interpretation?.summary
  const classification = summary ? CLASSIFICATION_LABELS[summary.classification] : null
  const tone = classification ? TONE_COLORS[classification.tone] : TONE_COLORS.neutral

  return (
    <Screen
      title="Result"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        feedbackOpen ? undefined : (
          <>
            <Button fullWidth onPress={() => navigation.popTo('Home')} testID="back-home">
              Back to home
            </Button>
            {feedbackSent ? (
              <Text style={styles.feedbackSent} testID="feedback-saved">
                ✓ Feedback sent and saved. Thank you!
              </Text>
            ) : (
              <Button fullWidth variant="text" onPress={() => setFeedbackOpen(true)} testID="feedback-open">
                Something wrong? Report a problem
              </Button>
            )}
          </>
        )
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />

      {summary && classification ? (
        <View style={[styles.summary, { backgroundColor: tone.bg, borderColor: tone.fg }]} testID="summary">
          <Text style={[styles.classification, { color: tone.fg }]}>
            {classification.icon} {classification.label}
          </Text>
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

      <ExamImages
        originalUrl={localOriginal ?? attempt.original_image_url}
        extractedUrl={attempt.reading?.overlay_url}
        findings={interpretation?.details?.findings}
      />

      {interpretation?.details && <Details details={interpretation.details} photoUri={attempt.reading?.overlay_url} />}

      {interpretation?.disclaimer && (
        <Text style={styles.disclaimer} testID="disclaimer">
          ⓘ {interpretation.disclaimer}
        </Text>
      )}

      {feedbackOpen && <FeedbackForm attemptId={attempt.id} onSent={markFeedbackSent} onClose={() => setFeedbackOpen(false)} />}
    </Screen>
  )
}

/** The photo that was sent and the same photo with the extracted signal drawn on it. */
function ExamImages({
  originalUrl,
  extractedUrl,
  findings,
}: {
  originalUrl?: string | null
  extractedUrl?: string | null
  findings?: InterpretationDetails['findings']
}) {
  if (!originalUrl && !extractedUrl) return null
  const markers: ImageMarker[] = []
  ;(findings ?? []).forEach((finding, index) => {
    const mark = finding.mark
    const box = mark?.photo_box_focus ?? mark?.photo_box
    if (!mark || !box) return
    const [ox, oy] = mark.overlay_offset_px ?? [0, 0]
    markers.push({
      box: [box[0] + ox, box[1] + oy, box[2] + ox, box[3] + oy],
      label: String(index + 1),
      color: MARKER_COLORS[index % MARKER_COLORS.length],
    })
  })
  return (
    <Section title="Photo and extracted signal" testID="details-images" defaultOpen>
      {originalUrl ? (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Original photo</Text>
          <ZoomableImage uri={originalUrl} accessibilityLabel="Original ECG photo" />
        </View>
      ) : null}
      {extractedUrl ? (
        <View style={styles.item}>
          <Text style={styles.itemTitle}>Extracted signal</Text>
          <ZoomableImage uri={extractedUrl} accessibilityLabel="ECG photo with the extracted signal" markers={markers} />
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

function Details({ details, photoUri }: { details: InterpretationDetails; photoUri?: string | null }) {
  const known = Object.keys(MEASUREMENT_LABELS).filter((key) => key in details.measurements)
  const extra = Object.keys(details.measurements).filter((key) => !(key in MEASUREMENT_LABELS))
  const measurementKeys = [...known, ...extra]
  // Keep the position in the full list so the numbers match the markers on the photo.
  const indexed = details.findings.map((finding, index) => ({ finding, index }))
  const irregularities = indexed.filter(({ finding }) => finding.severity !== 'info')
  const informational = indexed.filter(({ finding }) => finding.severity === 'info')

  return (
    <View style={styles.details}>
      <Text style={viewStyles.section}>Details</Text>

      {(measurementKeys.length > 0 || details.per_lead.length > 0) && (
        <Section title="Measurements" testID="details-measurements" defaultOpen>
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
          {details.per_lead.length > 0 && <LeadTable perLead={details.per_lead} />}
        </Section>
      )}

      {details.findings.length === 0 && (
        <Section title="Findings (0)" testID="details-findings">
          <Text style={viewStyles.muted}>No findings.</Text>
        </Section>
      )}

      {irregularities.length > 0 && (
        <Section
          title={`Irregularities (${irregularities.length})`}
          testID="details-irregularities"
          tone="danger"
          defaultOpen
        >
          {irregularities.map(({ finding, index }) => (
            <FindingItem key={finding.code} finding={finding} index={index} photoUri={photoUri} />
          ))}
        </Section>
      )}

      {informational.length > 0 && (
        <Section title={`Evidence and information (${informational.length})`} testID="details-findings" tone="progress">
          {informational.map(({ finding, index }) => (
            <FindingItem key={finding.code} finding={finding} index={index} photoUri={photoUri} />
          ))}
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
    </View>
  )
}

function LeadTable({ perLead }: { perLead: InterpretationDetails['per_lead'] }) {
  return (
    <View style={styles.table} testID="details-per-lead">
      <View style={styles.tableRow}>
        <Text style={[styles.cell, styles.cellLead, styles.cellHead]}>Lead</Text>
        <Text style={[styles.cell, styles.cellHead]}>R (mV)</Text>
        <Text style={[styles.cell, styles.cellHead]}>S (mV)</Text>
        <Text style={[styles.cell, styles.cellQuality, styles.cellHead]}>Quality</Text>
      </View>
      {perLead.map((lead) => {
        const quality = lead.quality ? LEAD_QUALITY_LABELS[lead.quality] : null
        return (
          <View key={lead.name} style={styles.tableRow}>
            <Text style={[styles.cell, styles.cellLead, styles.cellHead]}>{lead.name}</Text>
            <Text style={styles.cell}>{formatValue(roundMv(lead.r_amplitude_mv))}</Text>
            <Text style={styles.cell}>{formatValue(roundMv(lead.s_amplitude_mv))}</Text>
            <Text style={[styles.cell, styles.cellQuality]}>
              {quality ? `${quality.icon} ${quality.label}` : ''}
              {lead.estimated ? ' ≈' : ''}
            </Text>
          </View>
        )
      })}
      <Text style={viewStyles.muted}>≈ Estimated</Text>
    </View>
  )
}

function FindingItem({
  finding,
  index,
  photoUri,
}: {
  finding: InterpretationDetails['findings'][number]
  index: number
  photoUri?: string | null
}) {
  const severity = SEVERITY_LABELS[finding.severity]
  const color = MARKER_COLORS[index % MARKER_COLORS.length]
  const marks = finding.marks?.length ? finding.marks : finding.mark ? [finding.mark] : []
  return (
    <View style={styles.item}>
      <View style={styles.itemHead}>
        <Text style={[styles.itemTitle, { color }]}>
          {index + 1}. {finding.label}
        </Text>
        <Tag label={severity.label} tone={finding.severity === 'info' ? 'progress' : severity.tone} />
      </View>
      {finding.evidence ? <Text style={viewStyles.muted}>{finding.evidence}</Text> : null}
      {finding.mark && photoUri ? <PhotoCrop mark={finding.mark} uri={photoUri} color={color} /> : null}
      {marks.map((mark, k) => (
        <EvidenceCrop key={`${mark.lead}-${k}`} mark={mark} index={index} />
      ))}
    </View>
  )
}

function roundMv(value: number | null | undefined): number | null {
  return value === null || value === undefined ? null : Math.round(value * 100) / 100
}

function Section({
  title,
  testID,
  defaultOpen = false,
  tone,
  children,
}: {
  title: string
  testID?: string
  defaultOpen?: boolean
  tone?: 'progress' | 'danger'
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  const toned = tone ? TONE_COLORS[tone] : null
  return (
    <View style={[styles.section, toned && { borderColor: toned.fg }]}>
      <Pressable
        onPress={() => setOpen((value) => !value)}
        accessibilityRole="button"
        accessibilityState={{ expanded: open }}
        style={[styles.sectionHead, toned && { backgroundColor: toned.bg }]}
        testID={testID}
      >
        <Text style={[styles.sectionTitle, toned && { color: toned.fg }]}>{title}</Text>
        <Text style={[styles.sectionToggle, toned && { color: toned.fg }]}>{open ? '▲ Hide' : '▼ Show'}</Text>
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
  feedbackSent: { textAlign: 'center', fontSize: 14, fontWeight: '600', color: colors.primary },
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
  table: { gap: 6, marginTop: 8 },
  tableRow: { flexDirection: 'row', alignItems: 'center' },
  cell: { flex: 1, fontSize: 14 },
  cellLead: { flex: 0.8 },
  cellQuality: { flex: 1.6 },
  cellHead: { fontWeight: '700' },
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
