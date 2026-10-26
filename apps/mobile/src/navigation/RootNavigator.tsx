import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { useAuth } from 'shared'
import { LoadingView } from '../ui/Feedback'
import HomeScreen from '../screens/HomeScreen'
import WelcomeScreen from '../screens/WelcomeScreen'
import ComingSoonScreen from '../screens/ComingSoonScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import HelpScreen from '../screens/HelpScreen'
import AboutScreen from '../screens/AboutScreen'
import LoginScreen from '../screens/LoginScreen'
import ExamsScreen from '../screens/ExamsScreen'
import NewExamScreen from '../screens/NewExamScreen'
import ExamDetailScreen from '../screens/ExamDetailScreen'
import CaptureScreen from '../screens/CaptureScreen'
import CropScreen from '../screens/CropScreen'
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
        <AuthStack.Screen name="Welcome" component={WelcomeScreen} options={{ title: 'Welcome · ECG Reader' }} />
        <AuthStack.Screen name="Login" component={LoginScreen} options={{ title: 'Sign in · ECG Reader' }} />
        <AuthStack.Screen name="ComingSoon" component={ComingSoonScreen} options={{ title: 'Work in progress · ECG Reader' }} />
      </AuthStack.Navigator>
    )
  }

  return (
    <AppStack.Navigator screenOptions={{ headerShown: false }}>
      <AppStack.Screen name="Home" component={HomeScreen} options={{ title: 'Home · ECG Reader' }} />
      <AppStack.Screen name="ComingSoon" component={ComingSoonScreen} options={{ title: 'Work in progress · ECG Reader' }} />
      <AppStack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile · ECG Reader' }} />
      <AppStack.Screen name="Settings" component={SettingsScreen} options={{ title: 'Settings · ECG Reader' }} />
      <AppStack.Screen name="Help" component={HelpScreen} options={{ title: 'Help · ECG Reader' }} />
      <AppStack.Screen name="About" component={AboutScreen} options={{ title: 'About · ECG Reader' }} />
      <AppStack.Screen name="Exams" component={ExamsScreen} options={{ title: 'Exams · ECG Reader' }} />
      <AppStack.Screen name="NewExam" component={NewExamScreen} options={{ title: 'New exam · ECG Reader' }} />
      <AppStack.Screen name="ExamDetail" component={ExamDetailScreen} options={{ title: 'Exam · ECG Reader' }} />
      <AppStack.Screen name="Capture" component={CaptureScreen} options={{ title: 'ECG photo · ECG Reader' }} />
      <AppStack.Screen name="Layout" component={LayoutScreen} options={{ title: 'Layout · ECG Reader' }} />
      <AppStack.Screen name="Crop" component={CropScreen} options={{ title: 'Crop · ECG Reader' }} />
      <AppStack.Screen
        name="Processing"
        component={ProcessingScreen}
        options={{ title: 'Processing · ECG Reader', gestureEnabled: false }}
      />
      <AppStack.Screen name="AttemptState" component={AttemptStateScreen} options={{ title: 'Result · ECG Reader' }} />
    </AppStack.Navigator>
  )
}
