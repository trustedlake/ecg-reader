import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import type { Calibration, Layout, Patient, TestScenario } from 'shared'

export type ImageContentType = 'image/jpeg' | 'image/png' | 'image/webp'

export interface PickedImage {
  uri: string
  /** Web: o File do <input>; no celular o upload lê a `uri`. */
  file?: Blob
  filename: string
  contentType: ImageContentType
  width: number
  height: number
}

/**
 * Rascunho da nova tentativa (foto → calibração → layout), guardado em memória entre as telas.
 * A foto não vai nos params da navegação (o File do web não é serializável).
 */
export interface AttemptDraft {
  examId: string
  patient: Patient
  image: PickedImage | null
  calibration: Calibration
  layout: Layout | null
  testScenario: TestScenario | null
}

interface AttemptDraftContextValue {
  draft: AttemptDraft | null
  start: (examId: string, patient: Patient, calibration: Calibration) => void
  update: (changes: Partial<AttemptDraft>) => void
  clear: () => void
}

const AttemptDraftContext = createContext<AttemptDraftContextValue | undefined>(undefined)

export function AttemptDraftProvider({ children }: { children: ReactNode }) {
  const [draft, setDraft] = useState<AttemptDraft | null>(null)

  const start = useCallback((examId: string, patient: Patient, calibration: Calibration) => {
    setDraft({ examId, patient, image: null, calibration, layout: null, testScenario: null })
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
  if (!ctx) throw new Error('useAttemptDraft deve ser usado dentro de <AttemptDraftProvider>')
  return ctx
}
