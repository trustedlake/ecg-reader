import { Pressable, StyleSheet, Text, View } from 'react-native'
import { Button, colors } from 'shared'
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

  return (
    <Screen
      title="Layout das derivações"
      onBack={() => navigation.goBack()}
      footer={
        <Button
          fullWidth
          disabled={!draft.layout}
          onPress={() => navigation.navigate('Processing', { examId })}
          testID="layout-continue"
        >
          Enviar para leitura
        </Button>
      }
    >
      <Text style={styles.help}>Escolha o layout igual ao impresso no papel do ECG.</Text>
      <View style={styles.grid} accessibilityRole="radiogroup" accessibilityLabel="Layout das derivações">
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
  label: { fontSize: 15, fontWeight: '600', color: colors.dark, textAlign: 'center' },
  labelSelected: { color: colors.secondary },
})
