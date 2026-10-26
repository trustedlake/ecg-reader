import { View } from 'react-native'
import Svg, { Line, Polyline, Rect, Text as SvgText } from 'react-native-svg'
import type { EvidenceMark } from 'shared'
import { Text } from '../../ui/Text'

export const MARKER_COLORS = ['#B3261E', '#1C5FB5', '#8A5A00', '#6A2C91', '#00796B', '#C2185B']

const WIDTH = 320
const HEIGHT = 120

/** Zoomed window of the extracted signal showing where a finding was measured. */
export default function EvidenceCrop({ mark, index }: { mark: EvidenceMark; index: number }) {
  const color = MARKER_COLORS[index % MARKER_COLORS.length]
  const values = mark.samples.filter((v): v is number => v !== null)
  if (values.length < 2) return null
  const min = Math.min(...values)
  const max = Math.max(...values)
  const span = Math.max(max - min, 0.2)
  const x = (i: number) => (i / Math.max(mark.samples.length - 1, 1)) * WIDTH
  const y = (v: number) => 12 + (1 - (v - min) / span) * (HEIGHT - 24)

  const runs: string[] = []
  const joined: string[] = []
  let current: string[] = []
  mark.samples.forEach((v, i) => {
    if (v === null) {
      if (current.length > 1) runs.push(current.join(' '))
      current = []
    } else {
      const point = `${x(i).toFixed(1)},${y(v).toFixed(1)}`
      current.push(point)
      joined.push(point)
    }
  })
  if (current.length > 1) runs.push(current.join(' '))

  const seconds = (mark.samples.length / mark.sampling_rate_hz).toFixed(1)
  return (
    <View style={{ gap: 4 }}>
      <Svg width="100%" height={HEIGHT} viewBox={`0 0 ${WIDTH} ${HEIGHT}`} preserveAspectRatio="none">
        <Rect x={0} y={0} width={WIDTH} height={HEIGHT} fill="#FBFBF7" stroke="#D5D9CF" />
        <Rect x={x(mark.from_index)} y={0} width={Math.max(x(mark.to_index) - x(mark.from_index), 3)} height={HEIGHT}
          fill={color} opacity={0.14} />
        <Line x1={x(mark.from_index)} y1={0} x2={x(mark.from_index)} y2={HEIGHT} stroke={color} strokeWidth={1.5} />
        <Line x1={x(mark.to_index)} y1={0} x2={x(mark.to_index)} y2={HEIGHT} stroke={color} strokeWidth={1.5} />
        <Polyline points={joined.join(' ')} fill="none" stroke="#1D2A21" strokeOpacity={0.3} strokeWidth={1.6} />
        {runs.map((points, k) => (
          <Polyline key={k} points={points} fill="none" stroke="#1D2A21" strokeWidth={1.6} />
        ))}
        <SvgText x={6} y={14} fontSize={12} fontWeight="bold" fill={color}>{`Lead ${mark.lead}`}</SvgText>
      </Svg>
      <Text style={{ fontSize: 12, color: '#5B6358' }}>
        {mark.label} · {seconds} s window
      </Text>
    </View>
  )
}
