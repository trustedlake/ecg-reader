import type { InterpretScenario, ReadScenario } from 'shared'

// Cenários das lambdas mock (CONTRATO_LAMBDAS.md §4). O primeiro código de cada lista é o padrão.
export const READ_SCENARIOS: { value: ReadScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Sucesso', codes: [] },
  { value: 'success_with_warnings', label: 'Sucesso com avisos', codes: [] },
  {
    value: 'failure',
    label: 'Erro',
    codes: ['READ_TRACE_EXTRACTION_FAILED', 'READ_GRID_NOT_FOUND', 'STORAGE_ERROR', 'INTERNAL_ERROR'],
  },
  {
    value: 'refused',
    label: 'Recusa',
    codes: [
      'READ_REFUSED_BLURRY',
      'READ_REFUSED_CROPPED',
      'READ_REFUSED_OCCLUDED',
      'READ_REFUSED_LOW_CONTRAST',
      'READ_REFUSED_NOT_ECG',
      'READ_REFUSED_LAYOUT_MISMATCH',
    ],
  },
]

export const INTERPRET_SCENARIOS: { value: InterpretScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Sucesso', codes: [] },
  { value: 'success_with_warnings', label: 'Sucesso com avisos', codes: [] },
  { value: 'failure', label: 'Erro', codes: ['INTERP_NO_QRS_DETECTED', 'INTERP_SIGNAL_TOO_NOISY', 'INTERNAL_ERROR'] },
]
