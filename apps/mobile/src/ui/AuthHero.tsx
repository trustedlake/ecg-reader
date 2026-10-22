import type { ReactNode } from 'react'
import { ImageBackground, StyleSheet, View } from 'react-native'
import { colors } from 'shared'

interface AuthHeroProps {
  /** Header content drawn over the green-tinted photo. */
  children?: ReactNode
  height?: number | `${number}%`
}

/** Pexels photo with a green overlay in the logo colour. Photo: pexels.com/photo/5327579. */
export default function AuthHero({ children, height = '45%' }: AuthHeroProps) {
  return (
    <ImageBackground source={require('../../assets/welcome.jpg')} style={[styles.hero, { height }]} resizeMode="cover">
      <View style={styles.tint} />
      <View style={styles.content}>{children}</View>
    </ImageBackground>
  )
}

const styles = StyleSheet.create({
  hero: { width: '100%', backgroundColor: colors.secondary },
  tint: { ...StyleSheet.absoluteFill, backgroundColor: colors.secondary, opacity: 0.8 },
  content: { flex: 1, padding: 24, justifyContent: 'flex-end', paddingBottom: 56 },
})
