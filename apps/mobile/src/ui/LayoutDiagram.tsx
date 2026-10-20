import { StyleSheet, Text, View } from 'react-native'
import { colors } from 'shared'
import type { Layout } from 'shared'

// Grid of each layout (CONTRATO_LAMBDAS.md §2.2): grid rows + rhythm leads (10 s).
const GRID_3X4 = [
  ['I', 'aVR', 'V1', 'V4'],
  ['II', 'aVL', 'V2', 'V5'],
  ['III', 'aVF', 'V3', 'V6'],
]
const GRID_6X2 = [
  ['I', 'V1'],
  ['II', 'V2'],
  ['III', 'V3'],
  ['aVR', 'V4'],
  ['aVL', 'V5'],
  ['aVF', 'V6'],
]
const GRID_12X1 = ['I', 'II', 'III', 'aVR', 'aVL', 'aVF', 'V1', 'V2', 'V3', 'V4', 'V5', 'V6'].map((lead) => [lead])

export const LAYOUT_GRIDS: Record<Layout, { grid: string[][]; rhythm: string[] }> = {
  '3x4': { grid: GRID_3X4, rhythm: [] },
  '3x4+1': { grid: GRID_3X4, rhythm: ['II'] },
  '3x4+3': { grid: GRID_3X4, rhythm: ['V1', 'II', 'V5'] },
  '6x2': { grid: GRID_6X2, rhythm: [] },
  '6x2+1': { grid: GRID_6X2, rhythm: ['II'] },
  '12x1': { grid: GRID_12X1, rhythm: [] },
}

export function layoutDescription(layout: Layout): string {
  const { grid, rhythm } = LAYOUT_GRIDS[layout]
  const rows = grid.map((row) => row.join(', ')).join('; ')
  return rhythm.length ? `Linhas: ${rows}. Ritmo: ${rhythm.join(', ')}.` : `Linhas: ${rows}.`
}

/** Thumbnail of the ECG sheet: each cell is a lead; the rhythm strip spans the full width. */
export default function LayoutDiagram({ layout, active = false }: { layout: Layout; active?: boolean }) {
  const { grid, rhythm } = LAYOUT_GRIDS[layout]
  const rows = [...grid, ...rhythm.map((lead) => [lead])]
  return (
    <View style={[styles.paper, active && styles.paperActive]} importantForAccessibility="no-hide-descendants">
      {rows.map((row, rowIndex) => (
        <View key={rowIndex} style={styles.row}>
          {row.map((lead, cellIndex) => (
            <View
              key={cellIndex}
              style={[styles.cell, rowIndex >= grid.length && styles.rhythm, cellIndex > 0 && styles.cellDivider]}
            >
              <Text style={styles.lead} numberOfLines={1} allowFontScaling={false}>
                {lead}
              </Text>
            </View>
          ))}
        </View>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  paper: {
    height: 120,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e8b4b0',
    backgroundColor: '#fff6f5',
    overflow: 'hidden',
  },
  paperActive: { borderColor: colors.secondary },
  row: { flex: 1, flexDirection: 'row', borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: '#efc9c5' },
  cell: { flex: 1, justifyContent: 'center', paddingHorizontal: 3 },
  cellDivider: { borderLeftWidth: StyleSheet.hairlineWidth, borderLeftColor: '#efc9c5' },
  rhythm: { backgroundColor: '#fdeceb' },
  lead: { fontSize: 8, lineHeight: 9, color: '#9b4a43', fontWeight: '600' },
})
