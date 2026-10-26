import { Platform, Pressable, StyleSheet, View } from 'react-native'
import { useNavigation, useRoute } from '@react-navigation/native'
import { colors } from 'shared'
import type { AppStackParamList } from '../navigation/types'
import Icon from './Icon'
import type { IconName } from './Icon'
import { Text } from './Text'

type Target = 'Home' | 'Exams' | 'NewExam' | 'Profile'

const TABS: { icon: IconName; label: string; target: Target; testID: string; routes: string[] }[] = [
  { icon: 'home', label: 'Home', target: 'Home', testID: 'tab-home', routes: ['Home', 'Settings', 'Help', 'About'] },
  { icon: 'list', label: 'My exams', target: 'Exams', testID: 'tab-exams', routes: ['Exams', 'ExamDetail', 'AttemptState'] },
  { icon: 'newExam', label: 'New exam', target: 'NewExam', testID: 'tab-new-exam', routes: ['NewExam', 'Capture', 'Layout'] },
  { icon: 'user', label: 'Profile', target: 'Profile', testID: 'tab-profile', routes: ['Profile'] },
]

/** Bottom navigation shown on every screen of the app; the tab of the current section is highlighted. */
export default function TabBar() {
  const navigation = useNavigation<{ navigate: (name: Target) => void }>()
  const route = useRoute()
  return (
    <View style={styles.bar}>
      {TABS.map((tab) => {
        const active = tab.routes.includes(route.name as keyof AppStackParamList)
        return (
          <Pressable
            key={tab.label}
            onPress={() => navigation.navigate(tab.target)}
            accessibilityRole="button"
            accessibilityLabel={tab.label}
            testID={tab.testID}
            style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.pressed]}
          >
            <Icon name={tab.icon} color={active ? colors.secondary : colors.textMuted} size={24} />
            <Text style={[styles.label, active && styles.labelActive]}>{tab.label}</Text>
          </Pressable>
        )
      })}
    </View>
  )
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
    paddingTop: 10,
    // Web has no safe-area inset, so leave room for the phone's home indicator.
    paddingBottom: Platform.OS === 'web' ? 30 : 8,
    borderTopWidth: 3,
    borderTopColor: 'transparent',
  },
  tabActive: { borderTopColor: colors.secondary },
  label: { fontSize: 12, color: colors.textMuted },
  labelActive: { color: colors.secondary, fontWeight: '700' },
  pressed: { opacity: 0.6 },
})
