import { Image, View } from 'react-native'
import type { EvidenceMark } from 'shared'

const WIDTH = 320

/** Zoomed crop of the photo (with the extracted trace) around the place where a finding was measured. */
export default function PhotoCrop({ mark, uri, color }: { mark: EvidenceMark; uri: string; color: string }) {
  const size = mark.overlay_size_px ?? mark.image_size_px
  const [ox, oy] = mark.overlay_offset_px ?? [0, 0]
  const shift = (b?: [number, number, number, number] | null) => b && ([b[0] + ox, b[1] + oy, b[2] + ox, b[3] + oy] as const)
  const box = shift(mark.photo_box)
  const focus = shift(mark.photo_box_focus)
  if (!box || !size) return null
  const pad = 24
  const x0 = Math.max(box[0] - pad, 0)
  const y0 = Math.max(box[1] - pad, 0)
  const x1 = Math.min(box[2] + pad, size[0])
  const y1 = Math.min(box[3] + pad, size[1])
  const scale = WIDTH / Math.max(x1 - x0, 1)
  const height = Math.min(Math.max((y1 - y0) * scale, 60), 220)
  return (
    <View style={{ width: WIDTH, height, overflow: 'hidden', borderRadius: 6, borderWidth: 1, borderColor: '#D6DBD2' }}>
      <Image
        source={{ uri }}
        style={{ position: 'absolute', width: size[0] * scale, height: size[1] * scale, left: -x0 * scale, top: -y0 * scale }}
        accessibilityLabel={`Photo crop: ${mark.label}`}
      />
      {focus && (
        <View
          style={{
            position: 'absolute',
            left: (focus[0] - x0) * scale - 3,
            top: (focus[1] - y0) * scale - 3,
            width: (focus[2] - focus[0]) * scale + 6,
            height: (focus[3] - focus[1]) * scale + 6,
            borderWidth: 2,
            borderColor: color,
          }}
        />
      )}
    </View>
  )
}
