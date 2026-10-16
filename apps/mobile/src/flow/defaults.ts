import type { Calibration, Layout } from 'shared'

// Valores do contrato (CONTRATO_LAMBDAS.md §2.1) usados se /api/config/ ainda não respondeu.
export const DEFAULT_CALIBRATION: Calibration = { speed_mm_s: 25, gain_mm_mv: 10 }
export const SPEEDS_MM_S = [12.5, 25, 50]
export const GAINS_MM_MV = [5, 10, 20]
export const LAYOUTS: Layout[] = ['3x4', '3x4+1', '3x4+3', '6x2', '6x2+1', '12x1']
export const MIN_LONG_SIDE_PX = 800
export const MIN_SHORT_SIDE_PX = 500
