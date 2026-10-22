import type { NativeStackScreenProps } from '@react-navigation/native-stack'

export type AuthStackParamList = {
  Welcome: undefined
  Login: undefined
  ComingSoon: undefined
}

export type AuthScreenProps<T extends keyof AuthStackParamList> = NativeStackScreenProps<AuthStackParamList, T>

export type AppStackParamList = {
  Home: undefined
  ComingSoon: undefined
  Profile: undefined
  Settings: undefined
  Help: undefined
  About: undefined
  Exams: undefined
  NewExam: undefined
  ExamDetail: { examId: string }
  Capture: { examId: string }
  Layout: { examId: string }
  /** Without attemptId: creates the attempt from the draft. With attemptId: only follows it. */
  Processing: { examId: string; attemptId?: string }
  AttemptState: { examId: string; attemptId: string }
}

export type AppScreenProps<T extends keyof AppStackParamList> = NativeStackScreenProps<AppStackParamList, T>
