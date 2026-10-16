import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { API_MESSAGES, ApiError, createApiClient, isOffHours } from '../api'
import type { Attempt, AttemptStatus } from '../types'

function json(status: number, body: unknown): Response {
  return new Response(JSON.stringify(body), { status, headers: { 'Content-Type': 'application/json' } })
}

function attempt(status: AttemptStatus): Attempt {
  return {
    id: 'a1',
    exam_id: 'e1',
    status,
    layout: '3x4+1',
    calibration: { speed_mm_s: 25, gain_mm_mv: 10 },
    original_image_url: null,
    reading: null,
    interpretation: null,
    can_retry: false,
    needs_new_photo: false,
    created_at: '',
    updated_at: '',
  }
}

const fetchMock = vi.fn<typeof fetch>()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal('fetch', fetchMock)
})

afterEach(() => {
  vi.useRealTimers()
  vi.unstubAllGlobals()
})

const client = createApiClient({ baseUrl: 'https://api.test/', getToken: () => 'tok' })

describe('requisições', () => {
  it('usa baseUrl sem barra dupla e manda o token', async () => {
    fetchMock.mockResolvedValueOnce(json(200, attempt('criado')))
    await client.getAttempt('e1', 'a1')
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.test/api/exams/e1/attempts/a1/')
    expect(new Headers(init!.headers).get('Authorization')).toBe('Token tok')
  })

  it('baseUrl vazio = mesma origem', async () => {
    const sameOrigin = createApiClient({ baseUrl: '', getToken: () => null })
    fetchMock.mockResolvedValueOnce(json(200, attempt('criado')))
    await sameOrigin.startRead('e1', 'a1')
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('/api/exams/e1/attempts/a1/read/')
    expect(init!.method).toBe('POST')
    expect(new Headers(init!.headers).has('Authorization')).toBe(false)
  })

  it('createAttempt envia o corpo do contrato', async () => {
    fetchMock.mockResolvedValueOnce(json(201, { attempt_id: 'a1', upload_url: 'u', upload_headers: {} }))
    await client.createAttempt('e1', { filename: 'f.jpg', content_type: 'image/jpeg', layout: '6x2' })
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://api.test/api/exams/e1/attempts/')
    expect(JSON.parse(init!.body as string)).toEqual({ filename: 'f.jpg', content_type: 'image/jpeg', layout: '6x2' })
  })
})

describe('normalização de erros', () => {
  async function errorFor(response: Response | Error): Promise<ApiError> {
    if (response instanceof Error) fetchMock.mockRejectedValueOnce(response)
    else fetchMock.mockResolvedValueOnce(response)
    try {
      await client.getExam('e1')
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError)
      return error as ApiError
    }
    throw new Error('esperava erro')
  }

  it('falha de rede', async () => {
    const error = await errorFor(new TypeError('Failed to fetch'))
    expect(error).toMatchObject({ kind: 'network', status: 0, message: API_MESSAGES.network })
  })

  it('401 → unauthorized', async () => {
    const error = await errorFor(json(401, { detail: 'Token inválido.' }))
    expect(error).toMatchObject({ kind: 'unauthorized', status: 401, message: API_MESSAGES.unauthorized })
  })

  it('400 com erros de campo', async () => {
    const error = await errorFor(json(400, { layout: ['"4x3" não é um escolha válido.'], sex: ['Obrigatório.'] }))
    expect(error.kind).toBe('validation')
    expect(error.message).toBe('"4x3" não é um escolha válido.')
    expect(error.fieldErrors).toEqual({ layout: ['"4x3" não é um escolha válido.'], sex: ['Obrigatório.'] })
  })

  it('400 aninhado (test_scenario) e non_field_errors', async () => {
    let error = await errorFor(json(400, { test_scenario: { read: { scenario: ['Cenário inválido.'] } } }))
    expect(error.fieldErrors).toEqual({ test_scenario: ['Cenário inválido.'] })
    error = await errorFor(json(400, { non_field_errors: ['Informe patient_id OU os dados.'] }))
    expect(error.message).toBe('Informe patient_id OU os dados.')
  })

  it('404 e 409 usam o detail', async () => {
    expect(await errorFor(json(404, { detail: 'Não encontrado.' }))).toMatchObject({ kind: 'not_found', message: 'Não encontrado.' })
    expect(await errorFor(json(409, { detail: 'Estado inválido.', code: 'invalid_state' }))).toMatchObject({
      kind: 'conflict',
      message: 'Estado inválido.',
    })
  })

  it('503 sem corpo = fora do horário', async () => {
    const error = await errorFor(new Response('', { status: 503 }))
    expect(error).toMatchObject({ kind: 'server', status: 503, message: API_MESSAGES.offHours })
    expect(isOffHours(error)).toBe(true)
  })

  it('500 com HTML vira mensagem genérica', async () => {
    const error = await errorFor(new Response('<h1>Server Error</h1>', { status: 500 }))
    expect(error).toMatchObject({ kind: 'server', status: 500, message: API_MESSAGES.server })
    expect(isOffHours(error)).toBe(false)
  })
})

describe('uploadImage', () => {
  it('PUT com os headers assinados e o Blob', async () => {
    fetchMock.mockResolvedValueOnce(new Response(null, { status: 200 }))
    const blob = new Blob(['x'], { type: 'image/jpeg' })
    await client.uploadImage('https://s3/put', { 'Content-Type': 'image/jpeg' }, blob)
    const [url, init] = fetchMock.mock.calls[0]!
    expect(url).toBe('https://s3/put')
    expect(init).toMatchObject({ method: 'PUT', headers: { 'Content-Type': 'image/jpeg' }, body: blob })
  })

  it('URI local é lida como Blob antes do PUT (native)', async () => {
    const blob = new Blob(['x'])
    fetchMock.mockResolvedValueOnce(new Response(blob)).mockResolvedValueOnce(new Response(null, { status: 200 }))
    await client.uploadImage('https://s3/put', { 'Content-Type': 'image/png' }, 'file:///tmp/foto.png')
    expect(fetchMock.mock.calls[0]![0]).toBe('file:///tmp/foto.png')
    expect(fetchMock.mock.calls[1]![1]!.body).toBeInstanceOf(Blob)
  })

  it('403 do S3 não desloga', async () => {
    fetchMock.mockResolvedValueOnce(new Response('<Error/>', { status: 403 }))
    await expect(client.uploadImage('https://s3/put', {}, new Blob(['x']))).rejects.toMatchObject({
      kind: 'server',
      status: 403,
      message: API_MESSAGES.upload,
    })
  })
})

describe('pollAttempt', () => {
  beforeEach(() => vi.useFakeTimers())

  it('consulta a cada intervalo até sair de *_processando', async () => {
    fetchMock
      .mockResolvedValueOnce(json(200, attempt('leitura_processando')))
      .mockResolvedValueOnce(json(200, attempt('leitura_processando')))
      .mockResolvedValueOnce(json(200, attempt('aguardando_validacao')))
    const onUpdate = vi.fn()
    const promise = client.pollAttempt('e1', 'a1', { intervalMs: 2000, onUpdate })

    await vi.advanceTimersByTimeAsync(0)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1999)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    await vi.advanceTimersByTimeAsync(1)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    await vi.advanceTimersByTimeAsync(2000)

    await expect(promise).resolves.toMatchObject({ status: 'aguardando_validacao' })
    expect(fetchMock).toHaveBeenCalledTimes(3)
    expect(onUpdate).toHaveBeenCalledTimes(3)
  })

  it('resolve na hora se já não está processando', async () => {
    fetchMock.mockResolvedValueOnce(json(200, attempt('concluido')))
    await expect(client.pollAttempt('e1', 'a1')).resolves.toMatchObject({ status: 'concluido' })
  })

  it('timeout', async () => {
    fetchMock.mockImplementation(async () => json(200, attempt('interpretacao_processando')))
    const promise = client.pollAttempt('e1', 'a1', { intervalMs: 1000, timeoutMs: 3000 })
    const assertion = expect(promise).rejects.toMatchObject({ kind: 'timeout', message: API_MESSAGES.timeout })
    await vi.advanceTimersByTimeAsync(5000)
    await assertion
    expect(fetchMock.mock.calls.length).toBeLessThanOrEqual(4)
  })

  it('abort interrompe a espera', async () => {
    fetchMock.mockImplementation(async () => json(200, attempt('leitura_processando')))
    const controller = new AbortController()
    const promise = client.pollAttempt('e1', 'a1', { signal: controller.signal })
    const assertion = expect(promise).rejects.toMatchObject({ name: 'AbortError' })
    await vi.advanceTimersByTimeAsync(500)
    controller.abort()
    await assertion
    await vi.advanceTimersByTimeAsync(10000)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('tolera falha transitória e para em erro definitivo', async () => {
    fetchMock
      .mockRejectedValueOnce(new TypeError('offline'))
      .mockResolvedValueOnce(new Response('', { status: 503 }))
      .mockResolvedValueOnce(json(200, attempt('erro_leitura')))
    const promise = client.pollAttempt('e1', 'a1', { intervalMs: 100 })
    await vi.advanceTimersByTimeAsync(300)
    await expect(promise).resolves.toMatchObject({ status: 'erro_leitura' })

    fetchMock.mockReset()
    fetchMock.mockResolvedValueOnce(json(401, {}))
    await expect(client.pollAttempt('e1', 'a1')).rejects.toMatchObject({ kind: 'unauthorized' })
  })
})
