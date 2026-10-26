import type { Layout } from 'shared'
import { LAYOUT_GRIDS } from '../ui/LayoutDiagram'

/**
 * Guide drawn over the crop box. It mirrors the Lambda templates (`baseline_fractions` and
 * `signal_x_fraction` in report_normal.json for 3x4+1 and data_12x1.json for 12x1), so the cuts
 * the user lines up with the leads are the cuts the reading uses. Fractions are relative to the box.
 */
const TEMPLATES: Partial<Record<Layout, { baselines: number[]; signalX: [number, number] }>> = {
  '3x4+1': { baselines: [0.14, 0.39, 0.635, 0.88], signalX: [0.035, 0.977] },
  '12x1': {
    baselines: [0.035, 0.117, 0.199, 0.281, 0.363, 0.445, 0.527, 0.609, 0.691, 0.773, 0.855, 0.937],
    signalX: [0.032, 0.982],
  },
}

export interface CropGuide {
  /** Horizontal cuts between rows (0..1 of the box height). */
  rowCuts: number[]
  /** Trace baseline of each row (0..1 of the box height). */
  baselines: number[]
  /** Number of rows that are split into columns (the grid rows; rhythm rows span the full width). */
  gridRows: number
  /** Vertical cuts between columns (0..1 of the box width). */
  columnCuts: number[]
}

export function cropGuide(layout: Layout): CropGuide {
  const { grid, rhythm } = LAYOUT_GRIDS[layout]
  const rows = grid.length + rhythm.length
  const template = TEMPLATES[layout]
  const baselines = template?.baselines ?? Array.from({ length: rows }, (_, i) => (i + 0.5) / rows)
  const columns = grid[0]?.length ?? 1
  return {
    rowCuts: baselines.slice(1).map((value, i) => (baselines[i]! + value) / 2),
    baselines,
    gridRows: grid.length,
    columnCuts: Array.from({ length: columns - 1 }, (_, i) => (i + 1) / columns),
  }
}
