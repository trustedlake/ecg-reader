import type { InterpretScenario, ReadScenario } from 'shared'

// Scenarios for the lambdas' `mock` field (ecg-lambdas-v1). ecg-reading 2.0 only receives the scenario: the
// refusal/error code is decided by it. The first code in each list is the default.
export const READ_SCENARIOS: { value: ReadScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Success', codes: [] },
  { value: 'success_with_warnings', label: 'Success with warnings', codes: [] },
  { value: 'failure', label: 'Error', codes: [] },
  { value: 'refused', label: 'Refusal', codes: [] },
]

export const INTERPRET_SCENARIOS: { value: InterpretScenario; label: string; codes: string[] }[] = [
  { value: 'success', label: 'Success', codes: [] },
  { value: 'success_with_warnings', label: 'Success with warnings', codes: [] },
  { value: 'failure', label: 'Error', codes: ['INTERP_NO_QRS_DETECTED', 'INTERP_SIGNAL_TOO_NOISY', 'INTERNAL_ERROR'] },
]
