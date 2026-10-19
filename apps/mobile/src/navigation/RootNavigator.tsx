import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from 'shared'
import { LoadingView } from '../ui/Feedback'
import LoginScreen from '../screens/LoginScreen'
import ExamsScreen from '../screens/ExamsScreen'
import NewExamScreen from '../screens/NewExamScreen'
import ExamDetailScreen from '../screens/ExamDetailScreen'
import CaptureScreen from '../screens/CaptureScreen'
import LayoutScreen from '../screens/LayoutScreen'
import ProcessingScreen from '../screens/ProcessingScreen'
import AttemptStateScreen from '../screens/AttemptStateScreen'
import type { AppStackParamList, AuthStackParamList } from './types'

const AuthStack = createNativeStackNavigator<AuthStackParamList>()
const AppStack = createNativeStackNavigator<AppStackParamList>()

/** Pilha de login × pilha do app, decidida pelo token salvo (logout ou 401 → volta ao login). */
export default function RootNavigator() {
  const { isHydrated, isAuthenticated } = useAuth()

  if (!isHydrated) return <LoadingView />

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Entrar · Leitor ECG' }} />
      </AuthStack.Navigator>
    )
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Exams" component={ExamsScreen} options={{ title: 'Exames · Leitor ECG' }} />
      <AppStack.Screen name="NewExam" component={NewExamScreen} options={{ title: 'Novo exame · Leitor ECG' }} />
      <AppStack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ title: 'Exame · Leitor ECG' }} />
      <AppStack.Screen name="Capture" component={CaptureScreen} options={{ title: 'Foto do ECG · Leitor ECG' }} />
      <AppStack.Screen name="Layout" component={LayoutScreen} options={{ title: 'Layout · Leitor ECG' }} />
      <AppStack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: 'Processando · Leitor ECG', gestureEnabled: false }}
      />
      <AppStack.Screen name="AttemptState" component={AttemptStateScreen} options={{ title: 'Resultado · Leitor ECG' }} />
    </AppStack.Navigator>
  )
}
