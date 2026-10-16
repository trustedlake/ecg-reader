import { API_MESSAGES, ApiError, isOffHours } from 'shared'
import type { AttemptStatus, Layout, Sex } from 'shared'

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
