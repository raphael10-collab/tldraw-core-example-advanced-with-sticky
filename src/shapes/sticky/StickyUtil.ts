import { TLBounds, Utils } from '@tldraw/core'
import { Vec } from '@tldraw/vec'
import { intersectLineSegmentBounds } from '@tldraw/intersect'
import { nanoid } from 'nanoid'
import { CustomShapeUtil } from 'shapes/CustomShapeUtil'
import { StickyComponent } from './StickyComponent'
import { StickyIndicator } from './StickyIndicator'

import {
	getTextSvgElement,
	defaultTextStyle,
	getStickyFontSize,
	getBoundsRectangle,
	TextAreaUtils,
} from '../shared'

import { AlignStyle, TDShapeType, TransformInfo } from '../../types'
import { StickyShape } from './StickyShape'

const PADDING = 16

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
			},
			props
		)
	}

	// https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.ts
	shouldRender = (prev: T, next: T) => {
		return next.size !== prev.size || next.text !== prev.text
	}

	transform = (
		shape: T,
		bounds: TLBounds,
		initialShape: T,
		scale: number[]
	) => {
		shape.point = [bounds.minX, bounds.minY]
		shape.size = [bounds.width, bounds.height]
	}

	transformSingle = (shape: T): Partial<T> => {
		return shape
	}
}
