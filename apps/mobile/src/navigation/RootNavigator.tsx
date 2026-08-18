import { ActivityIndicator, StyleSheet, Text, View } from 'react-native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { colors, useAuth } from 'shared'
import LoginScreen from '../screens/LoginScreen'

export type RootStackParamList = {
  Login: undefined
  AppHome: undefined
}

const Stack = createNativeStackNavigator<RootStackParamList>()

function AppHomePlaceholder() {
  return (
    <View style={styles.placeholder}>
      <Text style={styles.placeholderText}>Área logada (telas reais vêm na próxima etapa)</Text>
    </View>
  )
}

export default function RootNavigator() {
  const { isHydrated, isAuthenticated } = useAuth()

  if (!isHydrated) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    )
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="AppHome" component={AppHomePlaceholder} />
      ) : (
        <Stack.Screen name="Login" component={LoginScreen} />
      )}
    </Stack.Navigator>
  )
}

const styles = StyleSheet.create({
  loading: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.white,
    padding: 24,
  },
  placeholderText: {
    fontSize: 16,
    fontWeight: '500',
    color: colors.textMuted,
    textAlign: 'center',
  },
})