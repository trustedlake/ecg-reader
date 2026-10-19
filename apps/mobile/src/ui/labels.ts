import { API_MESSAGES, ApiError, isOffHours } from 'shared'
import type { AttemptStatus, Classification, Confidence, Criterion, Finding, Layout, LeadQuality, Sex } from 'shared'

export const STATUS_LABELS: Record<AttemptStatus, string> = {
  criado: 'Aguardando envio',
  leitura_processando: 'Lendo o ECG',
  aguardando_validacao: 'Aguardando sua validação',
  leitura_recusada: 'Foto recusada',
  erro_leitura: 'Erro na leitura',
  rejeitado_usuario: 'Leitura recusada por você',
  interpretacao_processando: 'Interpretando',
  concluido: 'Concluído',
  erro_interpretacao: 'Erro na interpretação',
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

export const SEX_LABELS: Record<Sex, string> = { F: 'Feminino', M: 'Masculino' }

export const LAYOUT_LABELS: Record<Layout, string> = {
  '3x4': '3 × 4',
  '3x4+1': '3 × 4 + 1 ritmo',
  '3x4+3': '3 × 4 + 3 ritmos',
  '6x2': '6 × 2',
  '6x2+1': '6 × 2 + 1 ritmo',
  '12x1': '12 × 1',
}

/** Texto pronto para a UI a partir de qualquer erro (ApiError, rede, exceção inesperada). */
export function errorMessage(error: unknown): string {
  if (isOffHours(error)) return API_MESSAGES.offHours
  if (error instanceof ApiError && error.status === 429) {
    return 'Muitas tentativas seguidas. Aguarde um minuto e tente de novo.'
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

// ── Desfechos da tentativa (F3). A UI decide o fluxo por `code`/`retryable`, nunca pelo texto da lambda.

/** Dica prática para cada motivo de recusa da leitura (CONTRATO_LAMBDAS.md §5, categoria `refused`). */
export const REFUSAL_TIPS: Record<string, string> = {
  READ_REFUSED_BLURRY:
    'Apoie o celular (ou os cotovelos) numa superfície firme, toque na tela para focar e só fotografe quando o traçado estiver nítido.',
  READ_REFUSED_CROPPED:
    'Afaste um pouco o celular até o papel inteiro caber na foto, com uma pequena margem em volta.',
  READ_REFUSED_OCCLUDED:
    'Tire dedos, objetos e anotações de cima do traçado e evite reflexo de luz direta no papel.',
  READ_REFUSED_LOW_CONTRAST:
    'Fotografe num lugar bem iluminado, de preferência com luz natural e sem sombra sobre o papel.',
  READ_REFUSED_NOT_ECG:
    'Confira se a foto é do traçado do ECG em papel, e não de outro documento ou da tela de um aparelho.',
  READ_REFUSED_LAYOUT_MISMATCH:
    'Confira quantas linhas e colunas de derivações o papel tem e escolha o layout certo antes de enviar.',
}
export const REFUSAL_TIP_FALLBACK =
  'Tire outra foto com o papel inteiro, reto, nítido e bem iluminado, sem nada sobre o traçado.'

export const LEAD_QUALITY_LABELS: Record<LeadQuality, { label: string; icon: string; tone: StatusTone }> = {
  good: { label: 'Boa', icon: '✓', tone: 'success' },
  partial: { label: 'Parcial', icon: '◐', tone: 'attention' },
  saturated: { label: 'Saturada', icon: '▲', tone: 'attention' },
  low: { label: 'Baixa', icon: '!', tone: 'danger' },
}

export const CLASSIFICATION_LABELS: Record<Classification, { label: string; icon: string; tone: StatusTone }> = {
  normal: { label: 'Normal', icon: '✓', tone: 'success' },
  borderline: { label: 'Limítrofe', icon: '!', tone: 'attention' },
  abnormal: { label: 'Alterado', icon: '✕', tone: 'danger' },
}

export const SEVERITY_LABELS: Record<Finding['severity'], { label: string; tone: StatusTone }> = {
  info: { label: 'Informativo', tone: 'neutral' },
  warning: { label: 'Atenção', tone: 'attention' },
  critical: { label: 'Crítico', tone: 'danger' },
}

export const CONFIDENCE_LABELS: Record<Confidence, string> = { high: 'Alta', medium: 'Média', low: 'Baixa' }

export const CRITERION_STATUS_LABELS: Record<Criterion['status'], { label: string; icon: string; tone: StatusTone }> = {
  normal: { label: 'Normal', icon: '✓', tone: 'success' },
  abnormal: { label: 'Alterado', icon: '✕', tone: 'danger' },
  not_evaluated: { label: 'Não avaliado', icon: '–', tone: 'neutral' },
}

/** Ordem e nome das medidas conhecidas; medidas novas da lambda real aparecem depois, com a chave crua. */
export const MEASUREMENT_LABELS: Record<string, string> = {
  heart_rate_bpm: 'Frequência cardíaca',
  rr_ms: 'Intervalo RR',
  pr_ms: 'Intervalo PR',
  qrs_ms: 'Duração do QRS',
  qt_ms: 'Intervalo QT',
  qtc_ms: 'QT corrigido (QTc)',
  qrs_axis_deg: 'Eixo do QRS',
}

const UNIT_LABELS: Record<string, string> = { deg: '°' }

/** Número no formato brasileiro (vírgula decimal), com a unidade; `null` = não medível. */
export function formatValue(value: number | null | undefined, unit?: string): string {
  if (value === null || value === undefined) return 'Não medível'
  const number = String(value).replace('.', ',')
  if (!unit) return number
  const label = UNIT_LABELS[unit] ?? unit
  return label === '°' ? `${number}°` : `${number} ${label}`
}
