import AsyncStorage from '@react-native-async-storage/async-storage'
import type { StorageAdapter } from 'shared'

export const mobileStorageAdapter: StorageAdapter = {
  getItem: (key) => AsyncStorage.getItem(key),
  setItem: async (key, value) => {
    await AsyncStorage.setItem(key, value)
  },
  removeItem: (key) => AsyncStorage.removeItem(key),
}