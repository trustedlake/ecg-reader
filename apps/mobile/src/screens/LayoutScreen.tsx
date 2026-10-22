import { Pressable, StyleSheet, View } from 'react-native'
import { Text } from '../ui/Text'
import { colors } from 'shared'
import Button from '../ui/Button'
import type { Layout } from 'shared'
import { useApi } from '../api/ApiProvider'
import { useAttemptDraft } from '../flow/AttemptDraft'
import { LAYOUTS } from '../flow/defaults'
import type { AppScreenProps } from '../navigation/types'
import LayoutDiagram, { layoutDescription } from '../ui/LayoutDiagram'
import MissingDraft from '../ui/MissingDraft'
import { LAYOUT_LABELS } from '../ui/labels'
import Screen from '../ui/Screen'

export default function LayoutScreen({ navigation, route }: AppScreenProps<'Layout'>) {
  const { examId } = route.params
  const { config } = useApi()
  const { draft, update } = useAttemptDraft()

  if (!draft?.image || draft.examId !== examId) return <MissingDraft examId={examId} navigation={navigation} />

  const layouts: Layout[] = config?.layouts ?? LAYOUTS
  const upcoming = (Object.keys(LAYOUT_LABELS) as Layout[]).filter((layout) => !layouts.includes(layout))

  return (
    <Screen
      title="Lead layout"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          fullWidth
          disabled={!draft.layout}
          onPress={() => navigation.navigate('Processing', { examId })}
          testID="layout-continue"
        >
          Send for reading
        </Button>
      }
    >
      <Text style={styles.help}>Choose the layout that matches the one printed on the ECG paper.</Text>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Lead layout">
        {layouts.map((layout) => {
          const selected = draft.layout === layout
          return (
            <Pressable
              key={layout}
              onPress={() => update({ layout })}
              accessibilityRole="radio"
              accessibilityState={{ checked: selected }}
              accessibilityLabel={`Layout ${LAYOUT_LABELS[layout]}. ${layoutDescription(layout)}`}
              testID={`layout-${layout}`}
              style={({ pressed }) => [styles.card, selected && styles.selected, pressed && styles.pressed]}
            >
              <LayoutDiagram layout={layout} active={selected} />
              <Text style={[styles.label, selected && styles.labelSelected]}>{LAYOUT_LABELS[layout]}</Text>
            </Pressable>
          )
        })}
      </View>
      {upcoming.length > 0 && (
        <>
          <Text style={styles.upcomingTitle}>Upcoming</Text>
          <View style={styles.grid} testID="layouts-upcoming">
            {upcoming.map((layout) => (
              <View
                key={layout}
                style={[styles.card, styles.disabled]}
                accessibilityState={{ disabled: true }}
                accessibilityLabel={`Layout ${LAYOUT_LABELS[layout]}. Upcoming, not available yet.`}
                testID={`layout-upcoming-${layout}`}
              >
                <LayoutDiagram layout={layout} active={false} />
                <Text style={styles.label}>{LAYOUT_LABELS[layout]}</Text>
              </View>
            ))}
          </View>
        </>
      )}
    </Screen>
  )
}

const styles = StyleSheet.create({
  help: { fontSize: 15, color: colors.textMuted },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  card: {
    flexBasis: '47%',
    flexGrow: 1,
    gap: 8,
    padding: 10,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: colors.gridBorder,
    backgroundColor: colors.white,
  },
  selected: { borderColor: colors.secondary, backgroundColor: '#eef2ec' },
  pressed: { opacity: 0.8 },
  disabled: { opacity: 0.4 },
  upcomingTitle: { fontSize: 13, fontWeight: '600', color: colors.textMuted, textTransform: 'uppercase', marginTop: 8 },
  label: { fontSize: 15, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  labelSelected: { color: colors.secondary },
})
