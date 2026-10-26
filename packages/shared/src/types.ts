// Backend API types (V1). Source of truth: the ecg-backend V1 migration plan §0.1
// and the Lambda contract doc §3.2 (summary/details format).

export type AttemptStatus =
  | 'created'
  | 'reading'
  | 'awaiting_validation'
  | 'reading_refused'
  | 'reading_error'
  | 'user_rejected'
  | 'interpreting'
  | 'completed'
  | 'interpretation_error'

export const PROCESSING_STATUSES: readonly AttemptStatus[] = [
  'reading',
  'interpreting',
]

export function isProcessing(status: AttemptStatus): boolean {
  return PROCESSING_STATUSES.includes(status)
}

export type Layout = '3x4' | '3x4+1' | '3x4+3' | '6x2' | '6x2+1' | '12x1'

export type Sex = 'F' | 'M'

export type SpeedMmS = 12.5 | 25 | 50
export type GainMmMv = 5 | 10 | 20

export interface Calibration {
  speed_mm_s: number
  gain_mm_mv: number
}

export interface ContractError {
  code: string
  category: string
  retryable: boolean
  message: string
}

export interface ContractWarning {
  code: string
  message: string
  lead?: string
}

export type LeadQuality = 'good' | 'partial' | 'saturated' | 'low'

export interface ReadingLead {
  name: string
  kind: 'panel' | 'rhythm'
  quality: LeadQuality
  coverage: number
}

/** One of the extractor's alternative readings of the same photo. */
export interface ReadingVariant {
  id: string
  overlay_url: string
  score: number
}

export interface ReadingMethod {
  method: string
  status: string
  selector_score: number | null
  chosen: boolean
  image_url: string | null
}

export interface ReadingBlock {
  status: 'OK' | 'OK_WITH_WARNINGS' | 'REFUSED' | 'ERROR'
  warnings: ContractWarning[]
  error: ContractError | null
  overlay_url: string | null
  refusal_preview_url: string | null
  refusal_region_px: [number, number, number, number] | null
  leads: ReadingLead[]
  /** Alternative readings; the app shows them best score first (the score itself is never shown). */
  variants?: ReadingVariant[]
  /** All six extraction methods in registry order, each with its own preview (rejection preview when it had no signal). */
  methods?: ReadingMethod[]
}

export type Classification = 'normal' | 'borderline' | 'abnormal'
export type Confidence = 'high' | 'medium' | 'low'

export interface InterpretationSummary {
  classification: Classification
  headline: string
  rhythm: string
  heart_rate_bpm: number | null
  key_findings: string[]
  text: string
}

export interface Measurement {
  value: number | null
  unit: string
  confidence: Confidence
  lead?: string
  formula?: string
}

/** One window of a lead showing where a finding was measured (gaps are null; bridged ranges are estimated). */
export interface EvidenceMark {
  lead: string
  label: string
  sampling_rate_hz: number
  from_index: number
  to_index: number
  samples: (number | null)[]
  bridged: [number, number][]
  /** Window and focus area on the analysed photo, [x0, y0, x1, y1] in photo pixels. */
  photo_box?: [number, number, number, number] | null
  photo_box_focus?: [number, number, number, number] | null
  image_size_px?: [number, number]
  /** Where the photo starts inside the overlay image, and the overlay size (the overlay adds a header and padding). */
  overlay_offset_px?: [number, number]
  overlay_size_px?: [number, number]
}

export interface Finding {
  code: string
  label: string
  severity: 'info' | 'warning' | 'critical'
  evidence?: string
  mark?: EvidenceMark
  /** Every window behind the finding (e.g. leads I and aVF for the axis); `mark` is the first one. */
  marks?: EvidenceMark[]
}

export interface Criterion {
  name: string
  value: number | null
  unit: string
  reference: string
  sex_specific: boolean
  status: 'normal' | 'abnormal' | 'not_evaluated'
}

export interface PerLeadMeasurement {
  name: string
  r_amplitude_mv?: number | null
  s_amplitude_mv?: number | null
  quality?: LeadQuality
  estimated?: boolean
  quality_reason?: string | null
}

export interface InterpretationDetails {
  measurements: Record<string, Measurement>
  findings: Finding[]
  criteria: Criterion[]
  per_lead: PerLeadMeasurement[]
}

export interface InterpretationBlock {
  status: 'OK' | 'OK_WITH_WARNINGS' | 'ERROR'
  warnings: ContractWarning[]
  error: ContractError | null
  summary: InterpretationSummary | null
  details: InterpretationDetails | null
  disclaimer: string | null
}

export interface Attempt {
  id: string
  exam_id: string
  status: AttemptStatus
  layout: Layout
  calibration: Calibration
  original_image_url: string | null
  reading: ReadingBlock | null
  interpretation: InterpretationBlock | null
  can_retry: boolean
  needs_new_photo: boolean
  created_at: string
  updated_at: string
}

export interface Patient {
  id: string
  name: string
  age: number
  sex: Sex | null
}

export interface Exam {
  id: string
  patient: Patient
  status: AttemptStatus
  reason: string
  created_at: string
  updated_at: string
  attempts?: Attempt[]
}

export interface Paginated<T> {
  count: number
  next: string | null
  previous: string | null
  results: T[]
}

export interface AppConfig {
  layouts: Layout[]
  calibration: {
    speed_mm_s: number[]
    gain_mm_mv: number[]
    default: Calibration
  }
  test_scenarios_enabled: boolean
}

export type ReadScenario = 'success' | 'success_with_warnings' | 'failure' | 'refused'
export type InterpretScenario = 'success' | 'success_with_warnings' | 'failure'

export interface TestScenario {
  read?: { scenario: ReadScenario; code?: string }
  interpret?: { scenario: InterpretScenario; code?: string }
}

export interface LoginUser {
  id: string
  username: string
  is_staff: boolean
  [extra: string]: unknown
}

export interface LoginResponse {
  token: string
  user: LoginUser
}

export type CreateExamInput =
  | { patient_id: string; reason?: string }
  | { name: string; age: number; sex: Sex; reason?: string }

export interface CreateAttemptInput {
  filename: string
  content_type: 'image/jpeg' | 'image/png' | 'image/webp'
  layout: Layout
  speed_mm_s?: SpeedMmS
  gain_mm_mv?: GainMmMv
  test_scenario?: TestScenario
}

export interface CreateAttemptResponse {
  attempt_id: string
  upload_url: string
  upload_headers: Record<string, string>
}

export interface FeedbackInput {
  issues: string[]
  description: string
}
