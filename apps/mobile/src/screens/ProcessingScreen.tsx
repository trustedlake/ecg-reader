import { useCallback, useEffect, useRef, useState } from 'react'
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { ApiError, Button, colors, isProcessing } from 'shared'
import type { Attempt, AttemptStatus, CreateAttemptInput, GainMmMv, SpeedMmS } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import type { AppScreenProps } from '../navigation/types'
import { ErrorBanner } from '../ui/Feedback'
import MissingDraft from '../ui/MissingDraft'
import { errorMessage } from '../ui/labels'
import Screen from '../ui/Screen'

type Step = 'create' | 'upload' | 'start' | 'poll'

const STEP_LABELS: Record<Step, string> = {
  create: 'Preparing the upload',
  upload: 'Uploading the photo',
  start: 'Starting the reading',
  poll: 'Processing',
}

const POLL_MESSAGES: Partial<Record<AttemptStatus, string>> = {
  leitura_processando:
    'Reading the ECG: detecting the grid and extracting the trace of each lead. This usually takes 1 to 3 minutes…',
  interpretacao_processando: 'Interpreting the signal: rhythm, rate and measurements…',
}

function isAbort(error: unknown): boolean {
  return error instanceof Error && error.name === 'AbortError'
}

export default function ProcessingScreen({ navigation, route }: AppScreenProps<'Processing'>) {
  const { examId } = route.params
  const { api } = useApi()
  const { draft, clear } = useAttemptDraft()

  // With an attemptId (coming from accept/retry), it only follows along; without one, it creates from the draft.
  const attemptIdRef = useRef<string | null>(route.params.attemptId ?? null)
  const uploadRef = useRef<{ url: string; headers: Record<string, string> } | null>(null)
  const stepRef = useRef<Step>(route.params.attemptId ? 'poll' : 'create')
  const controllerRef = useRef<AbortController | null>(null)
  const draftRef = useRef(draft)

  const [step, setStep] = useState<Step>(stepRef.current)
  const [status, setStatus] = useState<AttemptStatus | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [running, setRunning] = useState(false)

  const goTo = (next: Step) => {
    stepRef.current = next
    setStep(next)
  }

  const run = useCallback(async () => {
    controllerRef.current?.abort()
    const controller = new AbortController()
    controllerRef.current = controller
    const { signal } = controller
    const checkAborted = () => {
      if (signal.aborted) throw Object.assign(new Error('cancelled'), { name: 'AbortError' })
    }
    setError(null)
    setRunning(true)

    try {
      const current = draftRef.current
      if (stepRef.current === 'create') {
        if (!current?.image || !current.layout) throw new Error('Incomplete draft')
        const input: CreateAttemptInput = {
          filename: current.image.filename,
          content_type: current.image.contentType,
          layout: current.layout,
          speed_mm_s: current.calibration.speed_mm_s as SpeedMmS,
          gain_mm_mv: current.calibration.gain_mm_mv as GainMmMv,
          ...(current.testScenario ? { test_scenario: current.testScenario } : {}),
        }
        const created = await api.createAttempt(examId, input)
        attemptIdRef.current = created.attempt_id
        uploadRef.current = { url: created.upload_url, headers: created.upload_headers }
        checkAborted()
        goTo('upload')
      }

      if (stepRef.current === 'upload') {
        const image = current!.image!
        await api.uploadImage(uploadRef.current!.url, uploadRef.current!.headers, image.file ?? image.uri)
        checkAborted()
        goTo('start')
      }

      const attemptId = attemptIdRef.current!
      let attempt: Attempt | null = null
      if (stepRef.current === 'start') {
        try {
          attempt = await api.startRead(examId, attemptId)
        } catch (err) {
          // 409: the reading had already been started (e.g. the previous response was lost on the network).
          if (!(err instanceof ApiError && err.kind === 'conflict')) throw err
        }
        checkAborted()
        goTo('poll')
      }

      if (!attempt || isProcessing(attempt.status)) {
        if (attempt) setStatus(attempt.status)
        attempt = await api.pollAttempt(examId, attemptId, {
          signal,
          onUpdate: (update) => setStatus(update.status),
        })
      }

      if (route.params.attemptId) {
        navigation.replace('AttemptState', { examId, attemptId })
      } else {
        // New attempt: the photo and layout screens leave the stack (the draft is done), so
        // "back" from the result leads to the exam, also in the browser history.
        clear()
        navigation.reset({
          index: 2,
          routes: [
            { name: 'Exams' },
            { name: 'ExamDetail', params: { examId } },
            { name: 'AttemptState', params: { examId, attemptId } },
          ],
        })
      }
    } catch (err) {
      if (isAbort(err) || signal.aborted) return
      setError(err instanceof Error && err.message === 'Incomplete draft' ? 'The photo data was lost. Go back and choose the photo again.' : errorMessage(err))
    } finally {
      if (!signal.aborted) setRunning(false)
    }
  }, [api, clear, examId, navigation, route.params.attemptId])

  // New attempt without a draft (page reloaded or browser "back" after the upload): returns to the exam.
  const draftMissing = !route.params.attemptId && !draftRef.current

  useEffect(() => {
    if (draftMissing) return
    void run()
    // Leaving the screen (back, cancel, switching stacks on logout) stops the polling.
    return () => controllerRef.current?.abort()
  }, [draftMissing, run])

  function cancel() {
    controllerRef.current?.abort()
    if (stepRef.current === 'poll') navigation.popToTop()
    else navigation.goBack()
  }

  if (draftMissing) return <MissingDraft examId={examId} navigation={navigation} />

  const polling = step === 'poll'
  const message = polling ? (status && POLL_MESSAGES[status]) ?? 'Checking progress…' : STEP_LABELS[step]
  const steps: Step[] = route.params.attemptId ? ['poll'] : ['create', 'upload', 'start', 'poll']
  const currentIndex = steps.indexOf(step)

  return (
    <Screen
      title="Processing"
      footer={
        <>
          {error && (
            <Button fullWidth onPress={() => void run()} testID="processing-retry">
              Try again
            </Button>
          )}
          <Button fullWidth variant="outline" onPress={cancel} testID="processing-cancel">
            {polling ? 'Leave and check back later' : 'Cancel'}
          </Button>
        </>
      }
    >
      <View style={styles.center} accessibilityLiveRegion="polite">
        {running && <ActivityIndicator size="large" color={colors.primary} />}
        <Text style={styles.message}>{message}</Text>
        {polling && running && (
          <Text style={styles.note}>
            This may take a few minutes. If you leave, processing continues and the result appears in the exam list.
          </Text>
        )}
      </View>

      {steps.length > 1 && (
        <View style={styles.steps}>
          {steps.map((item, index) => {
            const done = index < currentIndex
            const active = index === currentIndex
            return (
              <View key={item} style={styles.stepRow}>
                <Text style={[styles.dot, done && styles.dotDone, active && styles.dotActive]}>
                  {done ? '✓' : index + 1}
                </Text>
                <Text style={[styles.stepText, active && styles.stepActive]}>{STEP_LABELS[item]}</Text>
              </View>
            )
          })}
        </View>
      )}

      {error && <ErrorBanner message={error} />}
      {draft?.testScenario && !route.params.attemptId && (
        <Text style={styles.testTag}>Test mode active for this attempt</Text>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  center: { alignItems: 'center', gap: 14, paddingVertical: 32 },
  message: { fontSize: 18, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  note: { fontSize: 14, color: colors.textMuted, textAlign: 'center' },
  steps: { gap: 10, paddingHorizontal: 8 },
  stepRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  dot: {
    width: 28,
    height: 28,
    borderRadius: 14,
    textAlign: 'center',
    lineHeight: 28,
    fontSize: 13,
    fontWeight: '700',
    overflow: 'hidden',
    color: colors.textMuted,
    backgroundColor: colors.background,
  },
  dotDone: { color: colors.white, backgroundColor: colors.success },
  dotActive: { color: colors.white, backgroundColor: colors.secondary },
  stepText: { fontSize: 15, color: colors.textMuted },
  stepActive: { color: colors.dark, fontWeight: '600' },
  testTag: { fontSize: 13, fontWeight: '700', color: '#8a5300', textAlign: 'center' },
})
