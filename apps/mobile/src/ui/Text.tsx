import { StyleSheet, Text as RNText, TextInput as RNTextInput } from 'react-native'
import type { Ref } from 'react'
import type { StyleProp, TextInputProps, TextProps, TextStyle } from 'react-native'

/** DM Sans faces bundled in assets/fonts, keyed by the name registered with expo-font. */
export const fontAssets = {
  DMSans_400Regular: require('../../assets/fonts/DMSans_400Regular.ttf'),
  DMSans_500Medium: require('../../assets/fonts/DMSans_500Medium.ttf'),
  DMSans_600SemiBold: require('../../assets/fonts/DMSans_600SemiBold.ttf'),
  DMSans_700Bold: require('../../assets/fonts/DMSans_700Bold.ttf'),
  DMSans_800ExtraBold: require('../../assets/fonts/DMSans_800ExtraBold.ttf'),
}

const FAMILY_BY_WEIGHT: Record<string, keyof typeof fontAssets> = {
  normal: 'DMSans_400Regular',
  '100': 'DMSans_400Regular',
  '200': 'DMSans_400Regular',
  '300': 'DMSans_400Regular',
  '400': 'DMSans_400Regular',
  '500': 'DMSans_500Medium',
  '600': 'DMSans_600SemiBold',
  bold: 'DMSans_700Bold',
  '700': 'DMSans_700Bold',
  '800': 'DMSans_800ExtraBold',
  '900': 'DMSans_800ExtraBold',
}

/** Custom fonts ship one file per weight, so fontWeight is turned into the matching DM Sans face. */
function withFont(style: StyleProp<TextStyle>): StyleProp<TextStyle> {
  const flat = StyleSheet.flatten(style) ?? {}
  if (flat.fontFamily) return style
  const family = FAMILY_BY_WEIGHT[String(flat.fontWeight ?? '400')] ?? 'DMSans_400Regular'
  return [style, { fontFamily: family, fontWeight: 'normal' }]
}

export function Text({ style, ...props }: TextProps) {
  return <RNText {...props} style={withFont(style)} />
}

export function TextInput({ style, ...props }: TextInputProps & { ref?: Ref<RNTextInput> }) {
  return <RNTextInput {...props} style={withFont(style)} />
}
