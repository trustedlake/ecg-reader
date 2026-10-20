import { API_MESSAGES, ApiError, isOffHours } from 'shared'
import type { AttemptStatus, Classification, Confidence, Criterion, Finding, Layout, LeadQuality, Sex } from 'shared'

export const STATUS_LABELS: Record<AttemptStatus, string> = {
  criado: 'Waiting to upload',
  leitura_processando: 'Reading the ECG',
  aguardando_validacao: 'Waiting for your validation',
  leitura_recusada: 'Photo rejected',
  erro_leitura: 'Reading error',
  rejeitado_usuario: 'Reading rejected by you',
  interpretacao_processando: 'Interpreting',
  concluido: 'Completed',
  erro_interpretacao: 'Interpretation error',
}

export type StatusTone = 'neutral' | 'progress' | 'attention' | 'success' | 'danger'

export const STATUS_TONES: Record<AttemptStatus, StatusTone> = {
  criado: 'neutral',
  leitura_processando: 'progress',
  aguardando_validacao: 'attention',
  leitura_recusada: 'danger',
  erro_leitura: 'danger',
  rejeitado_usuario: 'neutral',
  interpretacao_processando: 'progress',
  concluido: 'success',
  erro_interpretacao: 'danger',
}

export const SEX_LABELS: Record<Sex, string> = { F: 'Female', M: 'Male' }

export const LAYOUT_LABELS: Record<Layout, string> = {
  '3x4': '3 × 4',
  '3x4+1': '3 × 4 + 1 rhythm',
  '3x4+3': '3 × 4 + 3 rhythms',
  '6x2': '6 × 2',
  '6x2+1': '6 × 2 + 1 rhythm',
  '12x1': '12 × 1',
}

/** UI-ready text from any error (ApiError, network, unexpected exception). */
export function errorMessage(error: unknown): string {
  if (isOffHours(error)) return API_MESSAGES.offHours
  if (error instanceof ApiError && error.status === 429) {
    return 'Too many attempts in a row. Wait a minute and try again.'
  }
  if (error instanceof ApiError) return error.message
  return API_MESSAGES.server
}

export function formatDateTime(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

// ── Attempt outcomes (F3). The UI decides the flow by `code`/`retryable`, never by the lambda's text.

/** Practical tip for each reading refusal reason (the Lambda contract doc, catalog, `refused` category). */
export const REFUSAL_TIPS: Record<string, string> = {
  READ_REFUSED_UNREADABLE_TRACE:
    'Photograph the paper head-on, flat and without folds, with good light and no shadows, and only upload when the trace lines are sharp.',
  READ_REFUSED_BLURRY:
    'Rest the phone (or your elbows) on a firm surface, tap the screen to focus, and only take the photo when the trace is sharp.',
  READ_REFUSED_CROPPED:
    'Move the phone back a little until the whole paper fits in the photo, with a small margin around it.',
  READ_REFUSED_OCCLUDED:
    'Remove fingers, objects and notes from over the trace and avoid direct glare on the paper.',
  READ_REFUSED_LOW_CONTRAST:
    'Take the photo in a well-lit place, preferably with natural light and no shadow over the paper.',
  READ_REFUSED_NOT_ECG:
    'Check that the photo is of the paper ECG trace, and not of another document or a device screen.',
  READ_REFUSED_LAYOUT_MISMATCH:
    'Check how many rows and columns of leads the paper has and choose the right layout before uploading.',
}
export const REFUSAL_TIP_FALLBACK =
  'Take another photo with the whole paper in frame, flat, sharp and well lit, with nothing over the trace.'

export const LEAD_QUALITY_LABELS: Record<LeadQuality, { label: string; icon: string; tone: StatusTone }> = {
  good: { label: 'Good', icon: '✓', tone: 'success' },
  partial: { label: 'Partial', icon: '◐', tone: 'attention' },
  saturated: { label: 'Saturated', icon: '▲', tone: 'attention' },
  low: { label: 'Low', icon: '!', tone: 'danger' },
}

export const CLASSIFICATION_LABELS: Record<Classification, { label: string; icon: string; tone: StatusTone }> = {
  normal: { label: 'Normal', icon: '✓', tone: 'success' },
  borderline: { label: 'Borderline', icon: '!', tone: 'attention' },
  abnormal: { label: 'Abnormal', icon: '✕', tone: 'danger' },
}

export const SEVERITY_LABELS: Record<Finding['severity'], { label: string; tone: StatusTone }> = {
  info: { label: 'Informational', tone: 'neutral' },
  warning: { label: 'Warning', tone: 'attention' },
  critical: { label: 'Critical', tone: 'danger' },
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = { high: 'High', medium: 'Medium', low: 'Low' }

export const CRITERION_STATUS_LABELS: Record<Criterion['status'], { label: string; icon: string; tone: StatusTone }> = {
  normal: { label: 'Normal', icon: '✓', tone: 'success' },
  abnormal: { label: 'Abnormal', icon: '✕', tone: 'danger' },
  not_evaluated: { label: 'Not evaluated', icon: '–', tone: 'neutral' },
}

/** Order and name of known measurements; new measurements from the real lambda appear afterwards, with the raw key. */
export const MEASUREMENT_LABELS: Record<string, string> = {
  heart_rate_bpm: 'Heart rate',
  rr_ms: 'RR interval',
  pr_ms: 'PR interval',
  qrs_ms: 'QRS duration',
  qt_ms: 'QT interval',
  qtc_ms: 'Corrected QT (QTc)',
  qrs_axis_deg: 'QRS axis',
}

const UNIT_LABELS: Record<string, string> = { deg: '°' }

/** Number with a decimal comma, with the unit; `null` = not measurable. */
export function formatValue(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return 'Not measurable'
  const number = String(value)
  if (!unit) return number
  const label = UNIT_LABELS[unit] ?? unit
  return label === '°' ? `${number}°` : `${number} ${label}`
}
