import { useState } from 'react'
import type { ReactNode } from 'react'
import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Button, colors } from 'shared'
import type { InterpretationDetails } from 'shared'
import { InfoBox, TONE_COLORS, Tag, WarningList } from '../../ui/Feedback'
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
import FeedbackForm from './FeedbackForm'
import { AttemptContext, backToExam, viewStyles } from './common'
import type { AttemptViewProps } from './common'

/** concluido: resumo em destaque, detalhes expansíveis e o disclaimer sempre visível. */
export default function ResultView({ exam, attempt, navigation, banner }: AttemptViewProps) {
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const interpretation = attempt.interpretation
  const summary = interpretation?.summary
  const readingWarnings = attempt.reading?.warnings ?? []
  const classification = summary ? CLASSIFICATION_LABELS[summary.classification] : null
  const tone = classification ? TONE_COLORS[classification.tone] : TONE_COLORS.neutral

  return (
    <Screen
      title="Resultado"
      onBack={() => backToExam(navigation, exam.id)}
      footer={
        feedbackOpen ? undefined : (
          <>
            <Button fullWidth variant="outline" onPress={() => setFeedbackOpen(true)} testID="feedback-open">
              Enviar feedback
            </Button>
            <Button fullWidth variant="text" onPress={() => backToExam(navigation, exam.id)}>
              Voltar ao exame
            </Button>
          </>
        )
      }
    >
      {banner}
      <AttemptContext exam={exam} attempt={attempt} />

      {interpretation && <WarningList title="Avisos da interpretação" warnings={interpretation.warnings} />}
      <WarningList title="Avisos da leitura" warnings={readingWarnings} />

      {summary && classification ? (
        <View style={[styles.summary, { backgroundColor: tone.bg, borderColor: tone.fg }]} testID="summary">
          <Text style={[styles.classification, { color: tone.fg }]}>
            {classification.icon} {classification.label}
          </Text>
          <Text style={styles.headline} accessibilityRole="header">
            {summary.headline}
          </Text>
          <View style={styles.vitals}>
            <Vital label="Ritmo" value={summary.rhythm} />
            <Vital label="Frequência cardíaca" value={formatValue(summary.heart_rate_bpm, 'bpm')} />
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
        <InfoBox>O resumo da interpretação não está disponível.</InfoBox>
      )}

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
      <Text style={viewStyles.section}>Detalhes</Text>

      {measurementKeys.length > 0 && (
        <Section title="Medidas" testID="details-measurements">
          {measurementKeys.map((key) => {
            const measurement = details.measurements[key]
            const notes = [
              measurement.value === null ? null : `Confiança ${CONFIDENCE_LABELS[measurement.confidence].toLowerCase()}`,
              measurement.lead ? `derivação ${measurement.lead}` : null,
              measurement.formula ? `fórmula de ${measurement.formula}` : null,
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

      <Section title={`Achados (${details.findings.length})`} testID="details-findings">
        {details.findings.length === 0 && <Text style={viewStyles.muted}>Nenhum achado.</Text>}
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

      {details.criteria.length > 0 && (
        <Section title="Critérios avaliados" testID="details-criteria">
          {details.criteria.map((criterion) => {
            const status = CRITERION_STATUS_LABELS[criterion.status]
            return (
              <View key={criterion.name} style={styles.item}>
                <View style={styles.itemHead}>
                  <Text style={styles.itemTitle}>{criterion.name}</Text>
                  <Tag label={status.label} icon={status.icon} tone={status.tone} />
                </View>
                <Text style={viewStyles.text}>
                  {formatValue(criterion.value, criterion.unit)} · referência {criterion.reference}
                </Text>
                {criterion.sex_specific && <Tag label="Depende do sexo" icon="⚥" tone="progress" />}
              </View>
            )
          })}
        </Section>
      )}

      {details.per_lead.length > 0 && (
        <Section title="Por derivação" testID="details-per-lead">
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
        <Text style={styles.sectionToggle}>{open ? '▲ Ocultar' : '▼ Ver'}</Text>
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
