import { ScrollView, StyleSheet, View } from 'react-native'
import type { ReactNode } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { colors } from 'shared'
import AppHeader from './AppHeader'

interface ScreenProps {
  title?: string
  onBack?: () => void
  right?: ReactNode
  /** false when the screen has its own scrollable list (FlatList). */
  scroll?: boolean
  footer?: ReactNode
  children: ReactNode
}

/** Standard frame: safe area, header, content with a 480 px max width (web) and fixed footer. */
export default function Screen({ title, onBack, right, scroll = true, footer, children }: ScreenProps) {
  return (
    <SafeAreaView style={styles.safe} edges={['top', 'bottom', 'left', 'right']}>
      <View style={styles.column}>
        {title !== undefined && <AppHeader title={title} onBack={onBack} right={right} />}
        {scroll ? (
          <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
            {children}
          </ScrollView>
        ) : (
          <View style={styles.fill}>{children}</View>
        )}
        {footer && <View style={styles.footer}>{footer}</View>}
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  column: {
    flex: 1,
    width: '100%',
    maxWidth: 480,
    alignSelf: 'center',
    backgroundColor: colors.white,
  },
  content: { padding: 20, gap: 16, flexGrow: 1 },
  fill: { flex: 1 },
  footer: {
    padding: 16,
    gap: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
})
