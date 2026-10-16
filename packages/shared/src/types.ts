// Tipos da API do backend (V1). Fonte da verdade: ecg-backend docs/plano-migracao-v1.md §0.1
// e CONTRATO_LAMBDAS.md §3.2 (formato de summary/details).

export type AttemptStatus =
  | 'criado'
  | 'leitura_processando'
  | 'aguardando_validacao'
  | 'leitura_recusada'
  | 'erro_leitura'
  | 'rejeitado_usuario'
  | 'interpretacao_processando'
  | 'concluido'
  | 'erro_interpretacao'

export const PROCESSING_STATUSES: readonly AttemptStatus[] = [
  'leitura_processando',
  'interpretacao_processando',
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

export interface ReadingBlock {
  status: 'OK' | 'OK_WITH_WARNINGS' | 'REFUSED' | 'ERROR'
  warnings: ContractWarning[]
  error: ContractError | null
  overlay_url: string | null
  refusal_preview_url: string | null
  refusal_region_px: [number, number, number, number] | null
  leads: ReadingLead[]
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

export interface Finding {
  code: string
  label: string
  severity: 'info' | 'warning' | 'critical'
  evidence?: string
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
