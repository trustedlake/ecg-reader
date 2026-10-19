import { Platform } from 'react-native'
import type { LinkingOptions } from '@react-navigation/native'
import type { AppStackParamList, AuthStackParamList } from './types'

type RootParamList = AppStackParamList & AuthStackParamList

/**
 * Rotas da versão web: cada tela vira uma URL, então o "voltar" do navegador e o recarregar funcionam.
 * Só na web; no Expo Go a navegação continua sem deep links.
 * Abrir direto uma URL interna põe a lista de exames embaixo, para o "voltar" do app ter para onde ir.
 */
export const linking: LinkingOptions<RootParamList> | undefined =
  Platform.OS === 'web'
    ? {
        prefixes: [],
        config: {
          initialRouteName: 'Exams',
          screens: {
            Login: 'login',
            Exams: '',
            NewExam: 'exames/novo',
            ExamDetail: 'exames/:examId',
            Capture: 'exames/:examId/foto',
            Layout: 'exames/:examId/layout',
            Processing: 'exames/:examId/processando/:attemptId?',
            AttemptState: 'exames/:examId/tentativas/:attemptId',
          },
        },
      }
    : undefined
