import { TLBounds, Utils } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import { intersectLineSegmentBounds } from '@tldraw/intersect'
import { nanoid } from 'nanoid'
import { CustomShapeUtil } from 'shapes/CustomShapeUtil'
import { StickyComponent } from './StickyComponent'
import { StickyIndicator } from './StickyIndicator'
import type { StickyShape } from './StickyShape'

import { getTextSvgElement, defaultTextStyle, getStickyFontSize, getBoundsRectangle, TextAreaUtils } from '../shared'

import { AlignStyle, StickyShape, TDShapeType, TransformInfo } from '../../types'


type T = StickyShape
type E = SVGSVGElement

export class StickyUtil extends CustomShapeUtil<T, E> {
  Component = StickyComponent

  Indicator = StickyIndicator

  hideResizeHandles = false

  getBounds = (shape: T) => {
    const [width, height] = shape.size
    return {
      minX: shape.point[0],
      maxX: shape.point[0] + width,
      minY: shape.point[1],
      maxY: shape.point[1] + height,
      width,
      height,
    }
  }


  /* ----------------- Custom Methods ----------------- */

  canBind = true


  getShape = (props: Partial<T>): T => {
    return Utils.deepMerge<T>(
      {
        id: 'id',
        type: TDShapeType.Sticky,
        name: 'Sticky',
        parentId: 'page',
        childIndex: 1,
        point: [0, 0],
        size: [200, 200],
        text: '',
        rotation: 0,
        style: defaultTextStyle,
      },
      props
    )
  }


  // https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.ts
  shouldRender = (prev: T, next: T) => {
    return next.size !== prev.size || next.style !== prev.style || next.text !== prev.text
  }




  // https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.tsx
  transform = (
    shape: T,
    bounds: TLBounds,
    { scaleX, scaleY, transformOrigin }: TransformInfo<T>
  ): Partial<T> => {
    console.log("transform-shape: ", shape)
    console.log("transform-bounds: ", bounds)

    if (transformOrigin) {

      const point = Vec.toFixed([
        bounds.minX +
          (bounds.width - shape.size[0]) * (scaleX < 0 ? 1 - transformOrigin[0] : transformOrigin[0]),
        bounds.minY +
          (bounds.height - shape.size[1]) *
             (scaleY < 0 ? 1 - transformOrigin[1] : transformOrigin[1]),
      ])
      return {
        point,
      }
    }
  }

  transformSingle = (shape: T): Partial<T> => {
    return shape
  }

  // https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.tsx
  getSvgElement = (shape: T, isDarkMode: boolean): SVGElement | void => {
    const bounds = this.getBounds(shape)

    const style = getStickyShapeStyle(shape.style, isDarkMode)

    const fontSize = getStickyFontSize(shape.style.size) * (shape.style.scale ?? 1)
    const fontFamily = getFontFace(shape.style.font).slice(1, -1)
    const textAlign = shape.style.textAlign ?? AlignStyle.Start

    const textElm = getTextSvgElement(
      shape.text,
      fontSize,
      fontFamily,
      textAlign,
      bounds.width - PADDING * 2,
      true
    )

    textElm.setAttribute('fill', style.color)
    textElm.setAttribute('transform', `translate(${PADDING}, ${PADDING})`)

    const g = document.createElementNS('http://www.w3.org/2000/svg', 'g')
    const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect')
    rect.setAttribute('width', bounds.width + '')
    rect.setAttribute('height', bounds.height + '')
    rect.setAttribute('fill', style.fill)
    rect.setAttribute('rx', '3')
    rect.setAttribute('ry', '3')

    g.appendChild(rect)
    g.appendChild(textElm)

    return g
  }
}

