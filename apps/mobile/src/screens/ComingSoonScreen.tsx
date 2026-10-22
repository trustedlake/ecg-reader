import { StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import { SafeAreaView } from 'react-native-safe-area-context'
import Svg, { Path } from 'react-native-svg'
import { colors } from 'shared'
import BackButton from '../ui/BackButton'
import Button from '../ui/Button'
import { useNavigation } from '@react-navigation/native'

export default function ComingSoonScreen() {
  const navigation = useNavigation()
  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.backRow}>
        <BackButton onPress={() => navigation.goBack()} />
      </View>
      <View style={styles.body}>
        <View style={styles.iconBg}>
          <Svg viewBox="0 0 24 24" width={44} height={44} fill="none">
            <Path
              d="M14.7 6.3a4 4 0 0 0-5.4 5.4L3 18l3 3 6.3-6.3a4 4 0 0 0 5.4-5.4l-2.5 2.5-2.2-.5-.5-2.2z"
              stroke={colors.white}
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.title} accessibilityRole="header">
          Work in progress!
        </Text>
        <Text style={styles.text}>
          We could not get this ready in time for the hackathon. We apologise for that.
        </Text>
      </View>
      <View style={styles.footer}>
        <Button fullWidth onPress={() => navigation.goBack()} testID="coming-soon-back">
          Go back
        </Button>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white, width: '100%', maxWidth: 480, alignSelf: 'center' },
  backRow: { paddingHorizontal: 20, paddingTop: 8 },
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 16 },
  iconBg: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: { fontSize: 28, fontWeight: '700', color: colors.secondary },
  text: { fontSize: 16, color: colors.textMuted, textAlign: 'center', lineHeight: 23 },
  footer: { padding: 20 },
})
