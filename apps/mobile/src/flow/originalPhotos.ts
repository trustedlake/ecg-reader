import { useEffect, useState } from 'react'
import { Platform } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator'
import type { PickedImage } from './AttemptDraft'

/**
 * The photo the user took, before cropping. Only the cropped photo is uploaded, so the original is kept on this device,
 * per attempt, to show it on the Result screen.
 */
const PREFIX = 'original-photo:'
const INDEX_KEY = 'original-photo-index'
const MAX_KEPT = 4
const MAX_WIDTH = 1600

function toDataUrl(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(reader.error)
    reader.readAsDataURL(blob)
  })
}

export async function saveOriginalPhoto(attemptId: string, source: PickedImage): Promise<void> {
  try {
    const scaled = await ImageManipulator.manipulate(source.uri)
      .resize(source.width > MAX_WIDTH ? { width: MAX_WIDTH } : {})
      .renderAsync()
    const saved = await scaled.saveAsync({ format: SaveFormat.JPEG, compress: 0.75 })
    const value = Platform.OS === 'web' ? await toDataUrl(await (await fetch(saved.uri)).blob()) : saved.uri
    await AsyncStorage.setItem(PREFIX + attemptId, value)
    const raw = await AsyncStorage.getItem(INDEX_KEY)
    const ids = [attemptId, ...(raw ? (JSON.parse(raw) as string[]) : []).filter((id) => id !== attemptId)]
    await AsyncStorage.setItem(INDEX_KEY, JSON.stringify(ids.slice(0, MAX_KEPT)))
    await Promise.all(ids.slice(MAX_KEPT).map((id) => AsyncStorage.removeItem(PREFIX + id)))
  } catch {
    // Best effort: without it the Result screen shows the photo that was sent.
  }
}

export function useOriginalPhoto(attemptId: string): string | null {
  const [uri, setUri] = useState<string | null>(null)
  useEffect(() => {
    let alive = true
    AsyncStorage.getItem(PREFIX + attemptId)
      .then((value) => alive && setUri(value))
      .catch(() => undefined)
    return () => {
      alive = false
    }
  }, [attemptId])
  return uri
}
