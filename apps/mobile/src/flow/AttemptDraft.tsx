import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Calibration, Layout, Patient, TestScenario } from 'shared'

export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp'

export interface PickedImage {
  uri: string
  /** Web: the File from the <input>; on mobile the upload reads the `uri`. */
  file?: Blob
  filename: string
  contentType: ImageContentType
  width: number
  height: number
}

/**
 * Draft of the new attempt (photo → calibration → layout), kept in memory across screens.
 * The photo is not passed in navigation params (the web File is not serializable).
 */
export interface AttemptDraft {
  examId: string
  patient: Patient
  image: PickedImage | null
  /** Original photo kept while `image` is its crop, so the crop can be adjusted again. */
  cropSource: PickedImage | null
  calibration: Calibration
  layout: Layout | null
  testScenario: TestScenario | null
}

interface AttemptDraftContextValue {
  draft: AttemptDraft | null
  start: (examId: string, patient: Patient, calibration: Calibration, layout?: Layout | null) => void
  update: (changes: Partial<AttemptDraft>) => void
  clear: () => void
}

const AttemptDraftContext = createContext<AttemptDraftContextValue | undefined>(undefined)

export function AttemptDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AttemptDraft | null>(null)

  const start = useCallback((examId: string, patient: Patient, calibration: Calibration, layout: Layout | null = null) => {
    setDraft({ examId, patient, image: null, cropSource: null, calibration, layout, testScenario: null })
  }, [])
  const update = useCallback((changes: Partial<AttemptDraft>) => {
    setDraft((current) => (current ? { ...current, ...changes } : current))
  }, [])
  const clear = useCallback(() => setDraft(null), [])

  const value = useMemo(() => ({ draft, start, update, clear }), [draft, start, update, clear])
  return <AttemptDraftContext.Provider value={value}>{children}</AttemptDraftContext.Provider>
}

export function useAttemptDraft(): AttemptDraftContextValue {
  const ctx = useContext(AttemptDraftContext)
  if (!ctx) throw new Error('useAttemptDraft must be used inside <AttemptDraftProvider>')
  return ctx
}
