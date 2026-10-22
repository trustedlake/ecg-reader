import { ImageBackground, Platform, Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import Icon from '../ui/Icon'
import type { IconName } from '../ui/Icon'
import Screen from '../ui/Screen'

export default function HomeScreen({ navigation }: AppScreenProps<'Home'>) {
  const newExam = () => navigation.navigate('NewExam')
  const exams = () => navigation.navigate('Exams')

  const shortcuts: { icon: IconName; label: string; onPress: () => void; testID: string }[] = [
    { icon: 'user', label: 'Profile', onPress: () => navigation.navigate('Profile'), testID: 'home-profile' },
    { icon: 'settings', label: 'Settings', onPress: () => navigation.navigate('Settings'), testID: 'home-settings' },
    { icon: 'help', label: 'Help', onPress: () => navigation.navigate('Help'), testID: 'home-help' },
    { icon: 'info', label: 'About', onPress: () => navigation.navigate('About'), testID: 'home-about' },
  ]

  const tabs: { icon: IconName; label: string; onPress: () => void; active?: boolean; testID: string }[] = [
    { icon: 'home', label: 'Home', onPress: () => {}, active: true, testID: 'tab-home' },
    { icon: 'list', label: 'My exams', onPress: exams, testID: 'tab-exams' },
    { icon: 'newExam', label: 'New exam', onPress: newExam, testID: 'tab-new-exam' },
    { icon: 'user', label: 'Profile', onPress: () => navigation.navigate('Profile'), testID: 'tab-profile' },
  ]

  const tabBar = (
    <View style={styles.tabBar}>
      {tabs.map((tab) => (
        <Pressable
          key={tab.label}
          onPress={tab.onPress}
          accessibilityRole="button"
          accessibilityLabel={tab.label}
          testID={tab.testID}
          style={({ pressed }) => [styles.tab, tab.active && styles.tabActive, pressed && styles.pressed]}
        >
          <Icon name={tab.icon} color={tab.active ? colors.secondary : colors.textMuted} size={24} />
          <Text style={[styles.tabLabel, tab.active && styles.tabLabelActive]}>{tab.label}</Text>
        </Pressable>
      ))}
    </View>
  )

  return (
    <Screen title="ECG Reader" footer={tabBar} footerBare>

      <ImageBackground source={require('../../assets/home-banner.jpg')} style={styles.banner} imageStyle={styles.bannerImage}>
        <View style={styles.bannerContent}>
          <Text style={styles.bannerKicker}>Paper ECG reader</Text>
          <Text style={styles.bannerTitle}>Turn a photo of an ECG into a digital signal</Text>
          <Pressable
            onPress={newExam}
            accessibilityRole="button"
            accessibilityLabel="New exam"
            testID="home-new-exam"
            style={({ pressed }) => [styles.bannerButton, pressed && styles.pressed]}
          >
            <Text style={styles.bannerButtonText}>New exam</Text>
          </Pressable>
        </View>
      </ImageBackground>

      <Text style={styles.sectionTitle}>My exams</Text>
      <Pressable
        onPress={exams}
        accessibilityRole="button"
        accessibilityLabel="My exams"
        testID="home-exams"
        style={({ pressed }) => [styles.examsCard, pressed && styles.pressed]}
      >
        <View style={styles.examsIcon}>
          <Icon name="list" color={colors.white} size={24} />
        </View>
        <View style={styles.examsText}>
          <Text style={styles.examsTitle}>See all your exams</Text>
          <Text style={styles.examsSub}>Open a result or continue where you stopped</Text>
        </View>
        <Text style={styles.chevron}>›</Text>
      </Pressable>

      <Text style={styles.sectionTitle}>More</Text>
      <View style={styles.shortcuts}>
        {shortcuts.map((item) => (
          <Pressable
            key={item.label}
            onPress={item.onPress}
            accessibilityRole="button"
            accessibilityLabel={item.label}
            testID={item.testID}
            style={({ pressed }) => [styles.shortcut, pressed && styles.pressed]}
          >
            <View style={styles.shortcutIcon}>
              <Icon name={item.icon} color={colors.secondary} size={24} />
            </View>
            <Text style={styles.shortcutLabel}>{item.label}</Text>
          </Pressable>
        ))}
      </View>
    </Screen>
  )
}

const styles = StyleSheet.create({
  // Explicit width: on web the ImageBackground otherwise takes the photo's intrinsic width and overflows.
  banner: { width: '100%', height: 200, borderRadius: 20, overflow: 'hidden', backgroundColor: colors.secondary },
  bannerImage: { borderRadius: 20 },
  bannerContent: { flex: 1, padding: 20, paddingRight: 150, justifyContent: 'flex-end', gap: 8 },
  bannerKicker: { fontSize: 13, color: colors.white, opacity: 0.85 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: colors.white },
  bannerButton: {
    alignSelf: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 20,
    marginTop: 4,
  },
  bannerButtonText: { fontSize: 15, fontWeight: '700', color: colors.secondary },
  sectionTitle: { fontSize: 18, fontWeight: '800', color: colors.dark, marginTop: 4 },
  examsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  examsIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  examsText: { flex: 1, gap: 2 },
  examsTitle: { fontSize: 16, fontWeight: '700', color: colors.dark },
  examsSub: { fontSize: 13, color: colors.textMuted },
  chevron: { fontSize: 28, color: colors.textMuted },
  shortcuts: { flexDirection: 'row', justifyContent: 'space-between' },
  shortcut: { alignItems: 'center', gap: 8, width: '23%' },
  shortcutIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: '#e8eee6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shortcutLabel: { fontSize: 13, fontWeight: '600', color: colors.dark },
  tabBar: { flexDirection: 'row', justifyContent: 'space-around' },
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
  tabLabel: { fontSize: 12, color: colors.textMuted },
  tabLabelActive: { color: colors.secondary, fontWeight: '700' },
  pressed: { opacity: 0.6 },
})
