import type {
  AppConfig,
  Attempt,
  CreateAttemptInput,
  CreateAttemptResponse,
  CreateExamInput,
  Exam,
  FeedbackInput,
  LoginResponse,
  Paginated,
} from './types'
import { isProcessing } from './types'

export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'timeout'

// Mensagens prontas para a UI (pt-BR). A UI decide o fluxo por `kind`, nunca pelo texto.
export const API_MESSAGES = {
  network: 'Sem conexão com o servidor. Verifique a internet e tente de novo.',
  unauthorized: 'Sua sessão expirou. Entre novamente.',
  validation: 'Confira os dados informados.',
  not_found: 'Não encontramos este exame.',
  conflict: 'Este exame mudou de estado. Atualize e tente de novo.',
  server: 'O servidor não conseguiu responder. Tente de novo em instantes.',
  offHours: 'Serviço disponível de segunda a sexta, das 8h às 20h.',
  timeout: 'O processamento está demorando mais que o esperado. Tente de novo em instantes.',
  upload: 'Não foi possível enviar a foto. Tente de novo.',
} as const

export class ApiError extends Error {
  kind: ApiErrorKind
  status: number
  fieldErrors?: Record<string, string[]>
  /** 503 que não veio do Django: o API Gateway está sem tasks (fora do horário, D8). */
  offHours?: boolean

  constructor(
    kind: ApiErrorKind,
    status: number,
    message: string,
    fieldErrors?: Record<string, string[]>,
  ) {
    super(message)
    this.name = 'ApiError'
    this.kind = kind
    this.status = status
    if (fieldErrors) this.fieldErrors = fieldErrors
  }
}

/** 503 sem corpo do Django = API Gateway sem tasks rodando (fora do horário, D8). */
export function isOffHours(error: unknown): boolean {
  return error instanceof ApiError && error.offHours === true
}

function firstString(value: unknown): string | undefined {
  if (typeof value === 'string') return value
  if (Array.isArray(value) && typeof value[0] === 'string') return value[0]
  return undefined
}

function collectFieldErrors(body: Record<string, unknown>): Record<string, string[]> | undefined {
  const fields: Record<string, string[]> = {}
  for (const [key, value] of Object.entries(body)) {
    if (key === 'detail' || key === 'code') continue
    if (Array.isArray(value)) {
      const messages = value.filter((v): v is string => typeof v === 'string')
      if (messages.length) fields[key] = messages
    } else if (typeof value === 'string') {
      fields[key] = [value]
    } else if (value && typeof value === 'object') {
      // Serializer aninhado (ex.: test_scenario.read.scenario): achata o primeiro nível.
      const nested = collectFieldErrors(value as Record<string, unknown>)
      if (nested) fields[key] = Object.values(nested).flat()
    }
  }
  return Object.keys(fields).length ? fields : undefined
}

/** Converte uma resposta HTTP de erro do backend em ApiError. */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // corpo vazio ou não-JSON (ex.: 503 do API Gateway)
  }
  const obj = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {}
  const detail = firstString(obj.detail)
  const status = response.status

  if (status === 401) return new ApiError('unauthorized', status, API_MESSAGES.unauthorized)
  if (status === 404) return new ApiError('not_found', status, detail ?? API_MESSAGES.not_found)
  if (status === 409) return new ApiError('conflict', status, detail ?? API_MESSAGES.conflict)
  if (status === 503) {
    // Todo erro do Django tem `detail`; o 503 do API Gateway vem vazio ou com {"message": "Service Unavailable"}.
    if (detail) return new ApiError('server', status, detail)
    return Object.assign(new ApiError('server', status, API_MESSAGES.offHours), { offHours: true })
  }
  if (status >= 400 && status < 500) {
    const fieldErrors = collectFieldErrors(obj)
    const message =
      detail ?? firstString(obj.non_field_errors) ?? (fieldErrors ? Object.values(fieldErrors)[0]?.[0] : undefined)
    return new ApiError('validation', status, message ?? API_MESSAGES.validation, fieldErrors)
  }
  return new ApiError('server', status, API_MESSAGES.server)
}

interface ApiFetchOptions extends RequestInit {
  token?: string
}

export interface ApiClientConfig {
  /** Vazio = mesma origem (web servido pelo Django). No native: EXPO_PUBLIC_API_BASE_URL. */
  baseUrl: string
  getToken: () => string | null | Promise<string | null>
}

export type UploadSource = Blob | string

export interface PollOptions {
  intervalMs?: number
  timeoutMs?: number
  signal?: AbortSignal
  onUpdate?: (attempt: Attempt) => void
}

export interface ApiClient {
  apiFetch<T>(path: string, options?: ApiFetchOptions): Promise<T>
  login(username: string, password: string): Promise<LoginResponse>
  getConfig(): Promise<AppConfig>
  listExams(page?: number): Promise<Paginated<Exam>>
  getExam(examId: string): Promise<Exam>
  createExam(input: CreateExamInput): Promise<Exam>
  createAttempt(examId: string, input: CreateAttemptInput): Promise<CreateAttemptResponse>
  uploadImage(uploadUrl: string, headers: Record<string, string>, file: UploadSource): Promise<void>
  startRead(examId: string, attemptId: string): Promise<Attempt>
  getAttempt(examId: string, attemptId: string): Promise<Attempt>
  accept(examId: string, attemptId: string): Promise<Attempt>
  reject(examId: string, attemptId: string): Promise<Attempt>
  retry(examId: string, attemptId: string): Promise<Attempt>
  sendFeedback(attemptId: string, input: FeedbackInput): Promise<unknown>
  pollAttempt(examId: string, attemptId: string, options?: PollOptions): Promise<Attempt>
}

function abortError(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) return signal.reason
  const error = new Error('Operação cancelada')
  error.name = 'AbortError'
  return error
}

function wait(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) return reject(abortError(signal))
    const timer = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort)
      resolve()
    }, ms)
    function onAbort() {
      clearTimeout(timer)
      reject(abortError(signal!))
    }
    signal?.addEventListener('abort', onAbort, { once: true })
  })
}

async function toBlob(file: UploadSource): Promise<Blob> {
  if (typeof file !== 'string') return file
  // Native: URI local (file://, content://) vinda do image picker. Web: blob:/data: URL.
  try {
    const response = await fetch(file)
    return await response.blob()
  } catch {
    throw new ApiError('validation', 0, 'Não foi possível ler a foto selecionada.')
  }
}

export function createApiClient(config: ApiClientConfig): ApiClient {
  const baseUrl = config.baseUrl.replace(/\/+$/, '')

  async function apiFetch<T>(path: string, options: ApiFetchOptions = {}): Promise<T> {
    const { token, headers, ...rest } = options
    const effectiveToken = token ?? (await config.getToken())

    const mergedHeaders = new Headers(headers)
    if (!mergedHeaders.has('Content-Type')) {
      mergedHeaders.set('Content-Type', 'application/json')
    }
    if (effectiveToken) {
      mergedHeaders.set('Authorization', `Token ${effectiveToken}`)
    }

    let response: Response
    try {
      response = await fetch(`${baseUrl}${path}`, { ...rest, headers: mergedHeaders })
    } catch (error) {
      if (rest.signal?.aborted) throw error
      throw new ApiError('network', 0, API_MESSAGES.network)
    }

    if (!response.ok) {
      throw await toApiError(response)
    }
    if (response.status === 204) {
      return undefined as T
    }
    return (await response.json()) as T
  }

  const post = <T>(path: string, body?: unknown) =>
    apiFetch<T>(path, { method: 'POST', body: body === undefined ? undefined : JSON.stringify(body) })

  const attemptPath = (examId: string, attemptId: string) =>
    `/api/exams/${examId}/attempts/${attemptId}/`

  const getAttempt = (examId: string, attemptId: string) =>
    apiFetch<Attempt>(attemptPath(examId, attemptId))

  async function uploadImage(uploadUrl: string, headers: Record<string, string>, file: UploadSource) {
    const body = await toBlob(file)
    let response: Response
    try {
      // PUT direto no S3: o Content-Type precisa ser o mesmo assinado na URL (upload_headers).
      response = await fetch(uploadUrl, { method: 'PUT', headers, body })
    } catch {
      throw new ApiError('network', 0, API_MESSAGES.network)
    }
    if (!response.ok) {
      // 403 do S3 = URL expirada/assinatura inválida, não sessão: nunca 'unauthorized'.
      throw new ApiError('server', response.status, API_MESSAGES.upload)
    }
  }

  async function pollAttempt(examId: string, attemptId: string, options: PollOptions = {}) {
    const { intervalMs = 2000, timeoutMs = 300000, signal, onUpdate } = options
    const deadline = Date.now() + timeoutMs
    for (;;) {
      if (signal?.aborted) throw abortError(signal)
      try {
        const attempt = await apiFetch<Attempt>(attemptPath(examId, attemptId), { signal })
        onUpdate?.(attempt)
        if (!isProcessing(attempt.status)) return attempt
      } catch (error) {
        // Falha transitória (rede, 5xx, fora do ar por instantes): continua tentando até o prazo.
        // Fora do horário não é transitório: para na hora, sem consultar em loop.
        const transient =
          error instanceof ApiError && (error.kind === 'network' || error.kind === 'server') && !isOffHours(error)
        if (!transient) throw error
      }
      if (Date.now() + intervalMs > deadline) {
        throw new ApiError('timeout', 0, API_MESSAGES.timeout)
      }
      await wait(intervalMs, signal)
    }
  }

  return {
    apiFetch,
    login: (username, password) => post<LoginResponse>('/api/auth/login/', { username, password }),
    getConfig: () => apiFetch<AppConfig>('/api/config/'),
    listExams: (page = 1) => apiFetch<Paginated<Exam>>(`/api/exams/?page=${page}`),
    getExam: (examId) => apiFetch<Exam>(`/api/exams/${examId}/`),
    createExam: (input) => post<Exam>('/api/exams/', input),
    createAttempt: (examId, input) => post<CreateAttemptResponse>(`/api/exams/${examId}/attempts/`, input),
    uploadImage,
    startRead: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}read/`),
    getAttempt,
    accept: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}accept/`),
    reject: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}reject/`),
    retry: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}retry/`),
    sendFeedback: (attemptId, input) => post(`/api/attempts/${attemptId}/feedback/`, input),
    pollAttempt,
  }
}
