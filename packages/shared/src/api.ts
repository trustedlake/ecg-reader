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
import { translateContractMessages } from './contractMessages'

export type ApiErrorKind =
  | 'network'
  | 'unauthorized'
  | 'validation'
  | 'not_found'
  | 'conflict'
  | 'server'
  | 'timeout'

// UI-ready messages. The UI decides the flow by `kind`, never by the text.
export const API_MESSAGES = {
  network: 'Could not reach the server. Check your internet connection and try again.',
  unauthorized: 'Your session has expired. Please sign in again.',
  validation: 'Please check the information provided.',
  not_found: 'We could not find this exam.',
  conflict: 'This exam changed state. Refresh and try again.',
  server: 'The server could not respond. Try again in a moment.',
  offHours: 'Service available Monday to Friday, 8 am to 8 pm.',
  timeout: 'Processing is taking longer than expected. Try again in a moment.',
  upload: 'Could not upload the photo. Try again.',
} as const

export class ApiError extends Error {
  kind: ApiErrorKind
  status: number
  fieldErrors?: Record<string, string[]>
  /** 503 that did not come from Django: the API Gateway has no tasks (off hours, D8). */
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

/** 503 without a Django body = API Gateway with no running tasks (off hours, D8). */
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
      // Nested serializer (e.g. test_scenario.read.scenario): flatten the first level.
      const nested = collectFieldErrors(value as Record<string, unknown>)
      if (nested) fields[key] = Object.values(nested).flat()
    }
  }
  return Object.keys(fields).length ? fields : undefined
}

/** Converts an HTTP error response from the backend into an ApiError. */
export async function toApiError(response: Response): Promise<ApiError> {
  let body: unknown = null
  try {
    body = await response.json()
  } catch {
    // empty or non-JSON body (e.g. API Gateway 503)
  }
  const obj = body && typeof body === 'object' && !Array.isArray(body) ? (body as Record<string, unknown>) : {}
  const detail = firstString(obj.detail)
  const status = response.status

  if (status === 401) return new ApiError('unauthorized', status, API_MESSAGES.unauthorized)
  if (status === 404) return new ApiError('not_found', status, detail ?? API_MESSAGES.not_found)
  if (status === 409) return new ApiError('conflict', status, detail ?? API_MESSAGES.conflict)
  if (status === 503) {
    // Every Django error has `detail`; the API Gateway 503 comes empty or with {"message": "Service Unavailable"}.
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
  /** Empty = same origin (web served by Django). On native: EXPO_PUBLIC_API_BASE_URL. */
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
  accept(examId: string, attemptId: string, variantId?: string): Promise<Attempt>
  reject(examId: string, attemptId: string): Promise<Attempt>
  retry(examId: string, attemptId: string): Promise<Attempt>
  sendFeedback(attemptId: string, input: FeedbackInput): Promise<unknown>
  pollAttempt(examId: string, attemptId: string, options?: PollOptions): Promise<Attempt>
}

function abortError(signal: AbortSignal): unknown {
  if (signal.reason !== undefined) return signal.reason
  const error = new Error('Operation cancelled')
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
  // Native: local URI (file://, content://) from the image picker. Web: blob:/data: URL.
  try {
    const response = await fetch(file)
    return await response.blob()
  } catch {
    throw new ApiError('validation', 0, 'Could not read the selected photo.')
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
    return translateContractMessages(await response.json()) as T
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
      // PUT straight to S3: the Content-Type must be the same one signed in the URL (upload_headers).
      response = await fetch(uploadUrl, { method: 'PUT', headers, body })
    } catch {
      throw new ApiError('network', 0, API_MESSAGES.network)
    }
    if (!response.ok) {
      // S3 403 = expired URL/invalid signature, not a session: never 'unauthorized'.
      throw new ApiError('server', response.status, API_MESSAGES.upload)
    }
  }

  async function pollAttempt(examId: string, attemptId: string, options: PollOptions = {}) {
    // 20 min: the real reading takes 50–190 s (up to 15 min); the backend flags TASK_TIMEOUT before that.
    const { intervalMs = 2000, timeoutMs = 1200000, signal, onUpdate } = options
    const deadline = Date.now() + timeoutMs
    for (;;) {
      if (signal?.aborted) throw abortError(signal)
      try {
        const attempt = await apiFetch<Attempt>(attemptPath(examId, attemptId), { signal })
        onUpdate?.(attempt)
        if (!isProcessing(attempt.status)) return attempt
      } catch (error) {
        // Transient failure (network, 5xx, down for a moment): keep trying until the deadline.
        // Off hours is not transient: stop right away, without polling in a loop.
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
    accept: (examId, attemptId, variantId) =>
      post<Attempt>(`${attemptPath(examId, attemptId)}accept/`, variantId ? { variant_id: variantId } : undefined),
    reject: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}reject/`),
    retry: (examId, attemptId) => post<Attempt>(`${attemptPath(examId, attemptId)}retry/`),
    sendFeedback: (attemptId, input) => post(`/api/attempts/${attemptId}/feedback/`, input),
    pollAttempt,
  }
}
