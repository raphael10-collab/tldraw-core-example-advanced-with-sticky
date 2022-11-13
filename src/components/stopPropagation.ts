// https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/components/stopPropagation.ts

import type React from 'react'

export const stopPropagation = (e: KeyboardEvent | React.SyntheticEvent<any, Event>) =>
  e.stopPropagation()
