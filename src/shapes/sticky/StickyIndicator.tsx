import { TLShapeUtil } from '@tldraw/core'
import * as React from 'react'
import type { StickyShape } from './StickyShape'

// https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.tsx
export const StickyIndicator = TLShapeUtil.Indicator<StickyShape>(({ shape }) => {
    const {
      size: [width, height],
    } = shape

    return (
      <rect x={0} y={0} rx={3} ry={3} width={Math.max(1, width)} height={Math.max(1, height)} />
    )

})
