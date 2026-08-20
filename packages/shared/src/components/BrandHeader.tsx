import { Pressable, StyleSheet, Text, View } from 'react-native'
import Svg, { Path } from 'react-native-svg'
import { colors } from '../theme'

interface BrandHeaderProps {
  profileInitial: string
  onLogoPress: () => void
  onProfilePress: () => void
}

export default function BrandHeader({ profileInitial, onLogoPress, onProfilePress }: BrandHeaderProps) {
  return (
    <Pressable style={styles.header} onPress={onProfilePress}>
      <Pressable
        style={styles.logoGroup}
        onPress={(e) => {
          e?.stopPropagation?.()
          onLogoPress()
        }}
      >
        <View style={styles.logoIcon}>
          <Svg viewBox="-2 0 48 28" width={18} height={13} fill="none">
            <Path
              d="M0 18h8l4-12 4 20 4-24 4 16 4-8h8l4 8 4 0"
              stroke={colors.white}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </Svg>
        </View>
        <Text style={styles.logoText}>Leitor ECG</Text>
      </Pressable>
      <View style={styles.profile}>
        <Text style={styles.profileInitial}>{profileInitial}</Text>
      </View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    height: 55,
    paddingHorizontal: 16,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gridBorder,
  },
  logoGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  logoText: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.dark,
    letterSpacing: -0.5,
  },
  profile: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.dark,
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  profileInitial: {
    color: colors.white,
    fontSize: 14,
    fontWeight: '600',
  },
})