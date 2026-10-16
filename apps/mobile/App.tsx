import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from 'shared'
import { ApiProvider } from './src/api/ApiProvider'
import { AttemptDraftProvider } from './src/flow/AttemptDraft'
import { API_BASE_URL } from './src/platform/config'
import { mobileStorageAdapter } from './src/platform/storage'
import RootNavigator from './src/navigation/RootNavigator'

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider storage={mobileStorageAdapter} apiBaseUrl={API_BASE_URL}>
        <ApiProvider>
          <AttemptDraftProvider>
            <NavigationContainer>
              <RootNavigator />
            </NavigationContainer>
          </AttemptDraftProvider>
        </ApiProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  )
}
