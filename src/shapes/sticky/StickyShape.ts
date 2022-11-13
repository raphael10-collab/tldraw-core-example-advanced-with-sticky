import type { TLShape } from '@tldraw/core'

export interface StickyShape extends TLShape {
  type: 'sticky'
  size: number[]
  text: string
}
