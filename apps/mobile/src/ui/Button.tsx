import type { ComponentProps } from 'react'
import { Button as SharedButton } from 'shared'
import { Text } from './Text'

/** Shared Button with its label in the app font (the nested Text inherits size and colour). */
export default function Button({ children, ...props }: ComponentProps<typeof SharedButton>) {
  return (
    <SharedButton {...props}>
      {typeof children === 'string' ? <Text style={{ fontWeight: '600' }}>{children}</Text> : children}
    </SharedButton>
  )
}
