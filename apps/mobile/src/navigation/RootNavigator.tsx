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

/** Login stack vs. app stack, decided by the saved token (logout or 401 → back to login). */
export default function RootNavigator() {
  const { isHydrated, isAuthenticated } = useAuth()

  if (!isHydrated) return <LoadingView />

  if (!isAuthenticated) {
    return (
      <AuthStack.Navigator screenOptions={{ headerShown: false }}>
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in · ECG Reader' }} />
      </AuthStack.Navigator>
    )
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Exams" component={ExamsScreen} options={{ title: 'Exams · ECG Reader' }} />
      <AppStack.Screen name="NewExam" component={NewExamScreen} options={{ title: 'New exam · ECG Reader' }} />
      <AppStack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ title: 'Exam · ECG Reader' }} />
      <AppStack.Screen name="Capture" component={CaptureScreen} options={{ title: 'ECG photo · ECG Reader' }} />
      <AppStack.Screen name="Layout" component={LayoutScreen} options={{ title: 'Layout · ECG Reader' }} />
      <AppStack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: 'Processing · ECG Reader', gestureEnabled: false }}
      />
      <AppStack.Screen name="AttemptState" component={AttemptStateScreen} options={{ title: 'Result · ECG Reader' }} />
    </AppStack.Navigator>
  )
}
