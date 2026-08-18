// TODO(mobile): File is a DOM type, won't exist under React Native's tsconfig — revisit when building the mobile upload flow
import { createContext, useCallback, useContext, useMemo, useState } from 'react'
import type { ReactNode } from 'react'

interface ExamDraftContextValue {
  imageFile: File | null
  setImageFile: (file: File | null) => void
  examId: string | null
  attemptId: string | null
  setExamCreated: (examId: string) => void
  setAttemptCreated: (attemptId: string) => void
  reset: () => void
}

const ExamDraftContext = createContext<ExamDraftContextValue | undefined>(undefined)

export function ExamDraftProvider({ children }: { children: ReactNode }) {
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [examId, setExamId] = useState<string | null>(null)
  const [attemptId, setAttemptId] = useState<string | null>(null)

  const setExamCreated = useCallback((id: string) => setExamId(id), [])
  const setAttemptCreated = useCallback((id: string) => setAttemptId(id), [])
  const reset = useCallback(() => {
    setImageFile(null)
    setExamId(null)
    setAttemptId(null)
  }, [])

  const value = useMemo(
    () => ({ imageFile, setImageFile, examId, attemptId, setExamCreated, setAttemptCreated, reset }),
    [imageFile, examId, attemptId, setExamCreated, setAttemptCreated, reset],
  )

  return <ExamDraftContext.Provider value={value}>{children}</ExamDraftContext.Provider>
}

export function useExamDraft(): ExamDraftContextValue {
  const ctx = useContext(ExamDraftContext)
  if (!ctx) {
    throw new Error('useExamDraft deve ser usado dentro de <ExamDraftProvider>')
  }
  return ctx
}
