import { Pressable, StyleSheet } from 'react-native'
import { colors } from 'shared'
import Icon from './Icon'

/** Back arrow used below the header and over the auth photo. */
export default function BackButton({ onPress, color = colors.dark }: { onPress: () => void; color?: string }) {
  return (
    <Pressable
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Back"
      hitSlop={8}
      style={({ pressed }) => [styles.back, pressed && styles.pressed]}
      testID="screen-back"
    >
      {/* SVG chevron: a font glyph sits below the vertical centre. */}
      <Icon name="back" size={26} color={color} />
    </Pressable>
  )
}

const styles = StyleSheet.create({
  back: { width: 44, height: 44, alignItems: 'center', justifyContent: 'center' },
  pressed: { opacity: 0.6 },
})
