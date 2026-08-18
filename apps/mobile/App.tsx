import { StatusBar } from 'expo-status-bar'
import { NavigationContainer } from '@react-navigation/native'
import { AuthProvider } from 'shared'
import { mobileStorageAdapter } from './src/platform/storage'
import RootNavigator from './src/navigation/RootNavigator'

const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

export default function App() {
  return (
    <AuthProvider storage={mobileStorageAdapter} apiBaseUrl={apiBaseUrl!}>
      <NavigationContainer>
        <RootNavigator />
      </NavigationContainer>
      <StatusBar style="dark" />
    </AuthProvider>
  )
}