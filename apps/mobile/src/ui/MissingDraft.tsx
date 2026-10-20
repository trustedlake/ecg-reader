import { useEffect } from 'react'
import type { NativeStackNavigationProp } from '@react-navigation/native-stack'
import type { AppStackParamList } from '../navigation/types'
import { LoadingView } from './Feedback'

/**
 * The draft lives in memory. Without it (web page reloaded mid-flow, or the browser's "back"
 * after the photo has already been uploaded), the photo, layout and processing screens go back to the exam.
 */
export default function MissingDraft({
  examId,
  navigation,
}: {
  examId: string
  navigation: NativeStackNavigationProp<AppStackParamList>
}) {
  useEffect(() => {
    // Deferred: when opened directly by URL, the screen mounts before the browser accepts actions.
    const timer = setTimeout(() => {
      // popTo does nothing if the exam is not in the stack (e.g. URL opened directly): then it replaces the current screen.
      const inStack = navigation.getState().routes.some((r) => r.name === 'ExamDetail')
      if (inStack) navigation.popTo('ExamDetail', { examId })
      else navigation.replace('ExamDetail', { examId })
    }, 0)
    return () => clearTimeout(timer)
  }, [examId, navigation])
  return <LoadingView />
}
