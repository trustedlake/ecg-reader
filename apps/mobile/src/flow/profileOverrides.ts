import { useCallback, useEffect, useState } from 'react'
import AsyncStorage from '@react-native-async-storage/async-storage'

export interface ProfileOverrides {
  name: string
  role: string
}

/** Name and role edited on the Profile screen, kept on the device per username (empty = use the account value). */
export function useProfileOverrides(username: string): [ProfileOverrides, (changes: Partial<ProfileOverrides>) => void] {
  const key = `profile-overrides:${username}`
  const [value, setValue] = useState<ProfileOverrides>({ name: '', role: '' })

  useEffect(() => {
    AsyncStorage.getItem(key)
      .then((raw) => {
        if (raw) setValue({ name: '', role: '', ...(JSON.parse(raw) as Partial<ProfileOverrides>) })
      })
      .catch(() => undefined)
  }, [key])

  const change = useCallback(
    (changes: Partial<ProfileOverrides>) => {
      setValue((current) => {
        const next = { ...current, ...changes }
        AsyncStorage.setItem(key, JSON.stringify(next)).catch(() => undefined)
        return next
      })
    },
    [key],
  )

  return [value, change]
}
