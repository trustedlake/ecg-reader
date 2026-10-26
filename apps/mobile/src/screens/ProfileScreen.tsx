import { StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors, useAuth } from 'shared'
import type { AppScreenProps } from '../navigation/types'
import Screen from '../ui/Screen'
import { Row, Section } from '../ui/Section'
import TextField from '../ui/TextField'
import { useProfileOverrides } from '../flow/profileOverrides'

export default function ProfileScreen({ navigation }: AppScreenProps<'Profile'>) {
  const { logout, user } = useAuth()
  const [overrides, change] = useProfileOverrides(user?.username ?? '')
  const accountName = typeof user?.name === 'string' && user.name ? user.name : user?.username ?? 'Doctor'
  const name = overrides.name.trim() || accountName
  const initials = name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
  const role = overrides.role.trim() || (user?.is_staff ? 'Administrator' : 'Clinician')
  const soon = () => navigation.navigate('ComingSoon')
  const roleDefault = user?.is_staff ? 'Administrator' : 'Clinician'

  return (
    <Screen title="Profile" onBack={() => navigation.goBack()}>
      <View style={styles.hero}>
        <View style={styles.avatar}>
          <Text style={styles.initials}>{initials}</Text>
        </View>
        <Text style={styles.name}>{name}</Text>
        <Text style={styles.username}>@{user?.username}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{role}</Text>
        </View>
      </View>

      <Section title="Account">
        <View style={styles.editor}>
          <TextField label="Name" value={overrides.name} placeholder={accountName} onChangeText={(v) => change({ name: v })} testID="profile-name" />
          <TextField label="Role" value={overrides.role} placeholder={roleDefault} onChangeText={(v) => change({ role: v })} testID="profile-role" />
        </View>
        <Row icon="user" label="Username" value={user?.username ?? ''} last />
      </Section>

      <Section title="Activity">
        <Row icon="list" label="My exams" onPress={() => navigation.navigate('Exams')} testID="profile-exams" />
        <Row icon="newExam" label="New exam" onPress={() => navigation.navigate('NewExam')} testID="profile-new-exam" last />
      </Section>

      <Section title="Security">
        <Row icon="settings" label="Change password" onPress={soon} testID="profile-password" last />
      </Section>

      <Section>
        <Row icon="logout" label="Log out" onPress={logout} danger last testID="profile-logout" />
      </Section>
    </Screen>
  )
}

const styles = StyleSheet.create({
  editor: { gap: 14, padding: 14 },
  hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  initials: { fontSize: 32, fontWeight: '800', color: colors.white },
  name: { fontSize: 22, fontWeight: '800', color: colors.dark },
  username: { fontSize: 15, color: colors.textMuted },
  badge: { backgroundColor: '#e8eee6', borderRadius: 999, paddingVertical: 4, paddingHorizontal: 12, marginTop: 4 },
  badgeText: { fontSize: 13, fontWeight: '700', color: colors.secondary },
})
