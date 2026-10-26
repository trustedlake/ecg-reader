import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'
import type { Calibration, Layout } from 'shared'

export interface ReadingDefaults {
  /** null = nothing chosen in Settings: use the server/contract default. */
  calibration: Calibration | null
  /** null = ask on the layout screen for every exam. */
  layout: Layout | null
}

const KEY = 'reading-defaults'
const NONE: ReadingDefaults = { calibration: null, layout: null }

/** Reading defaults chosen in Settings, kept on the device. */
export function useReadingDefaults(): [ReadingDefaults, (changes: Partial<ReadingDefaults>) => void] {
  const [value, setValue] = useState<ReadingDefaults>(NONE)

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => {
        if (raw) setValue({ ...NONE, ...(JSON.parse(raw) as Partial<ReadingDefaults>) })
      })
      .catch(() => undefined)
  }, [])

  const change = useCallback((changes: Partial<ReadingDefaults>) => {
    setValue((current) => {
      const next = { ...current, ...changes }
      AsyncStorage.setItem(KEY, JSON.stringify(next)).catch(() => undefined)
      return next
    })
  }, [])

  return [value, change]
}
