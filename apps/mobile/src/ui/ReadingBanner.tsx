import { useEffect, useState } from 'react'
import { ActivityIndicator, Pressable, StyleSheet } from 'react-native'
import { useNavigation } from '@react-navigation/native'
import { colors, isProcessing } from 'shared'
import { useApi } from '../api/ApiProvider'
import { clearActiveReading, useActiveReading } from '../flow/activeReading'
import { Text } from './Text'

/** "Reading in progress" strip shown on every screen while a reading runs in the background. */
export default function ReadingBanner() {
  const active = useActiveReading()
  const { api } = useApi()
  const navigation = useNavigation<{ navigate: (name: string, params: object) => void }>()
  const [done, setDone] = useState(false)

  const attemptId = active?.attemptId
  const examId = active?.examId
  useEffect(() => {
    if (!attemptId || !examId) return
    setDone(false)
    let stopped = false
    const check = async () => {
      try {
        const attempt = await api.getAttempt(examId, attemptId)
        if (!stopped) setDone(!isProcessing(attempt.status))
      } catch {
        // Keep the banner; the next check retries.
      }
    }
    void check()
    const timer = setInterval(() => void check(), 5000)
    return () => {
      stopped = true
      clearInterval(timer)
    }
  }, [api, attemptId, examId])

  if (!active) return null

  const open = () => {
    if (done) clearActiveReading()
    // Opens the attempt: still processing → the Processing screen continues it; finished → the result.
    navigation.navigate('AttemptState', { examId: active.examId, attemptId: active.attemptId })
  }

  return (
    <Pressable onPress={open} accessibilityRole="button" testID="reading-banner" style={[styles.bar, done && styles.done]}>
      {done ? <Text style={[styles.check, styles.doneText]}>✓</Text> : <ActivityIndicator size="small" color={colors.secondary} />}
      <Text style={[styles.text, done && styles.doneText]}>
        {done ? 'Your ECG is ready. Tap to see it' : 'Reading in progress. Tap to return'}
      </Text>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginBottom: 8,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(55, 72, 57, 0.25)',
    backgroundColor: 'rgba(55, 72, 57, 0.12)',
  },
  done: { borderColor: 'rgba(76, 175, 80, 0.4)', backgroundColor: 'rgba(76, 175, 80, 0.16)' },
  text: { color: colors.secondary, fontSize: 14, fontWeight: '700' },
  check: { fontSize: 16, fontWeight: '700' },
  doneText: { color: '#2e7d32' },
})
