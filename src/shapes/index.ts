import { TLShapeUtilsMap } from '@tldraw/core'
import type { CustomShapeUtil } from './CustomShapeUtil'
import { ArrowShape, ArrowUtil } from './arrow'
import { BoxShape, BoxUtil } from './box'
import { PencilShape, PencilUtil } from './pencil'
import { StickyShape, StickyUtil } from './sticky'

export * from './arrow'
export * from './pencil'
export * from './box'
export * from './sticky'

export type Shape = BoxShape | ArrowShape | PencilShape | StickyShape

export const shapeUtils = {
  box: new BoxUtil(),
  arrow: new ArrowUtil(),
  pencil: new PencilUtil(),
  sticky: new StickyUtil()
}

export const getShapeUtils = <T extends Shape>(shape: T | T['type']) => {
  if (typeof shape === 'string') return shapeUtils[shape] as unknown as CustomShapeUtil<T>
  return shapeUtils[shape.type] as unknown as CustomShapeUtil<T>
}
