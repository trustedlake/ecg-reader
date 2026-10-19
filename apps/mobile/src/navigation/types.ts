import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type AuthStackParamList = {
  Login: undefined
}

export type AppStackParamList = {
  Exams: undefined
  NewExam: undefined
  ExamDetail: { examId: string }
  Capture: { examId: string }
  Layout: { examId: string }
  /** Sem attemptId: cria a tentativa a partir do rascunho. Com attemptId: só acompanha. */
  Processing: { examId: string; attemptId?: string }
  AttemptState: { examId: string; attemptId: string }
}

export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>
