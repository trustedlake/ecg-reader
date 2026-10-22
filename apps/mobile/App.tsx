import { Platform } from 'react-native'
import { StatusBar } from 'expo-status-bar'
import { useFonts } from 'expo-font'
import { fontAssets } from './src/ui/Text'
import { NavigationContainer } from '@react-navigation/native'
import { SafeAreaProvider } from 'react-native-safe-area-context'
import { AuthProvider } from 'shared'
import { ApiProvider } from './src/api/ApiProvider'
import { AttemptDraftProvider } from './src/flow/AttemptDraft'
import { API_BASE_URL } from './src/platform/config'
import { mobileStorageAdapter } from './src/platform/storage'
import RootNavigator from './src/navigation/RootNavigator'
import { linking } from './src/navigation/linking'

// Web: hide every scrollbar and use the default arrow cursor over text and text fields,
// so the app looks like a phone app (scrolling and typing still work).
if (Platform.OS === 'web' && typeof document !== 'undefined') {
  const style = document.createElement('style')
  style.textContent =
    '*{scrollbar-width:none}*::-webkit-scrollbar{display:none}' + 'body,input,textarea{cursor:default}'
  document.head.appendChild(style)
}

export default function App() {
  const [fontsLoaded, fontError] = useFonts(fontAssets)
  if (!fontsLoaded && !fontError) return null
  return (
    <SafeAreaProvider>
      <AuthProvider storage={mobileStorageAdapter} apiBaseUrl={API_BASE_URL}>
        <ApiProvider>
          <AttemptDraftProvider>
            <NavigationContainer linking={linking}>
              <RootNavigator />
            </NavigationContainer>
          </AttemptDraftProvider>
        </ApiProvider>
      </AuthProvider>
      <StatusBar style="dark" />
    </SafeAreaProvider>
  )
}
