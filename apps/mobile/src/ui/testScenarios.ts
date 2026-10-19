import type { InterpretScenario, ReadScenario } from 'shared'

// Cenários do campo `mock` das lambdas (ecg-lambdas-v1). A ecg-reading 2.0 só recebe o cenário: o código
// da recusa/erro é decidido por ela. O primeiro código de cada lista é o padrão.
export const READ_SCENARIOS: { value: ReadScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Sucesso', codes: [] },
  { value: 'success_with_warnings', label: 'Sucesso com avisos', codes: [] },
  { value: 'failure', label: 'Erro', codes: [] },
  { value: 'refused', label: 'Recusa', codes: [] },
]

export const INTERPRET_SCENARIOS: { value: InterpretScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Sucesso', codes: [] },
  { value: 'success_with_warnings', label: 'Sucesso com avisos', codes: [] },
  { value: 'failure', label: 'Erro', codes: ['INTERP_NO_QRS_DETECTED', 'INTERP_SIGNAL_TOO_NOISY', 'INTERNAL_ERROR'] },
]
