import { useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

/** A reading that is running on the server, so the user can leave the Processing screen and come back to it. */
export interface ActiveReading {
  examId: string
  attemptId: string
  /** Epoch ms when the countdown started; kept so coming back does not restart it. */
  startedAt: number
}

const KEY = 'active-reading'
let current: ActiveReading | null = null
let loaded = false
const listeners = new Set<(value: ActiveReading | null) => void>()

function publish(next: ActiveReading | null) {
  current = next
  listeners.forEach((listener) => listener(next))
}

export function setActiveReading(value: ActiveReading) {
  publish(value)
  AsyncStorage.setItem(KEY, JSON.stringify(value)).catch(() => undefined)
}

export function clearActiveReading() {
  publish(null)
  AsyncStorage.removeItem(KEY).catch(() => undefined)
}

export function getActiveReading(): ActiveReading | null {
  return current
}

export function useActiveReading(): ActiveReading | null {
  const [value, setValue] = useState<ActiveReading | null>(current)
  useEffect(() => {
    listeners.add(setValue)
    if (!loaded) {
      loaded = true
      AsyncStorage.getItem(KEY)
        .then((raw) => {
          if (raw && current == null) publish(JSON.parse(raw) as ActiveReading)
        })
        .catch(() => undefined)
    }
    setValue(current)
    return () => {
      listeners.delete(setValue)
    }
  }, [])
  return value
}
