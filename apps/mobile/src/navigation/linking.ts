import { Platform } from 'react-native'
import type { LinkingOptions } from '@react-navigation/native'
import type { AppStackParamList, AuthStackParamList } from './types'

type RootParamList = AppStackParamList & AuthStackParamList

/**
 * Web routes: each screen becomes a URL, so the browser's "back" and reload work.
 * Web only; in Expo Go navigation stays without deep links.
 * Opening an internal URL directly puts the home menu underneath, so the app's "back" has somewhere to go.
 */
export const linking: LinkingOptions<RootParamList> | undefined =
  Platform.OS === 'web'
    ? {
        prefixes: [],
        config: {
          initialRouteName: 'Home',
          screens: {
            Welcome: 'welcome',
            Login: 'login',
            ComingSoon: 'coming-soon',
            Home: '',
            Profile: 'profile',
            Settings: 'settings',
            Help: 'help',
            About: 'about',
            Exams: 'exams',
            NewExam: 'exams/new',
            ExamDetail: 'exams/:examId',
            Capture: 'exams/:examId/photo',
            Layout: 'exams/:examId/layout',
            Crop: 'exams/:examId/crop',
            Processing: 'exams/:examId/processing/:attemptId?',
            AttemptState: 'exams/:examId/attempts/:attemptId',
          },
        },
      }
    : undefined
