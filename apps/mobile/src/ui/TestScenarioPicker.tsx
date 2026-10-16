import { StyleSheet, Text, View } from 'react-native'
import type { TestScenario } from 'shared'
import SegmentedControl from './SegmentedControl'
import { INTERPRET_SCENARIOS, READ_SCENARIOS } from './testScenarios'

type Phase = 'read' | 'interpret'
const CATALOGS = { read: READ_SCENARIOS, interpret: INTERPRET_SCENARIOS }
const NONE = 'none'

interface Props {
  value: TestScenario | null
  onChange: (value: TestScenario | null) => void
}

/** Cenário das lambdas mock por tentativa (D7). Só aparece para staff com a flag ligada no backend. */
export default function TestScenarioPicker({ value, onChange }: Props) {
  function setPhase(phase: Phase, scenario: string, code?: string) {
    const next: TestScenario = { ...(value ?? {}) }
    if (scenario === NONE) {
      delete next[phase]
    } else {
      const entry = { scenario, ...(code ? { code } : {}) }
      ;(next as Record<Phase, unknown>)[phase] = entry
    }
    onChange(Object.keys(next).length ? next : null)
  }

  function renderPhase(phase: Phase, label: string) {
    const catalog = CATALOGS[phase]
    const current = value?.[phase]
    const codes = catalog.find((item) => item.value === current?.scenario)?.codes ?? []
    return (
      <View style={styles.phase}>
        <SegmentedControl<string>
          label={label}
          wrap
          options={[{ value: NONE, label: 'Padrão' }, ...catalog.map(({ value: v, label: l }) => ({ value: v, label: l }))]}
          value={current?.scenario ?? NONE}
          onChange={(scenario) => {
            const first = catalog.find((item) => item.value === scenario)?.codes[0]
            setPhase(phase, scenario, first)
          }}
        />
        {codes.length > 0 && current && (
          <SegmentedControl<string>
            label="Código"
            wrap
            options={codes.map((code) => ({ value: code, label: code }))}
            value={current.code ?? codes[0]!}
            onChange={(code) => setPhase(phase, current.scenario, code)}
          />
        )}
      </View>
    )
  }

  return (
    <View style={styles.box} accessibilityLabel="Modo de teste">
      <Text style={styles.tag}>MODO DE TESTE</Text>
      <Text style={styles.help}>
        Escolha o resultado que as lambdas simuladas devem devolver nesta tentativa. Só para validação.
      </Text>
      {renderPhase('read', 'Leitura')}
      {renderPhase('interpret', 'Interpretação')}
    </View>
  )
}

const styles = StyleSheet.create({
  box: {
    gap: 12,
    padding: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#e0a030',
    backgroundColor: '#fffaf0',
  },
  tag: { fontSize: 12, fontWeight: '800', letterSpacing: 1, color: '#8a5300' },
  help: { fontSize: 13, color: '#6b4a10' },
  phase: { gap: 8 },
})
