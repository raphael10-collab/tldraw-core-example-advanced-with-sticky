import {
	SVGContainer,
	TLShapeUtil,
	HTMLContainer,
	TLBounds,
	Utils,
} from '@tldraw/core'
import * as React from 'react'
import type { StickyShape } from './StickyShape'
import { GHOSTED_OPACITY, LETTER_SPACING } from '../../constants'

import { styled } from '../../styles'

import { AlignStyle, TDMeta, TDShapeType, TransformInfo } from '../../types'

import { TextAreaUtils } from '../shared/index'

type T = StickyShape
type E = HTMLDivElement

// https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/shapes/StickyUtil/StickyUtil.tsx

/* -------------------------------------------------- */
/*                       Helpers                      */
/* -------------------------------------------------- */

const PADDING = 16
const MIN_CONTAINER_HEIGHT = 200

const StyledStickyContainer = styled('div', {
	pointerEvents: 'all',
	position: 'relative',
	backgroundColor: 'rgba(255, 220, 100)',
	fontFamily: 'sans-serif',
	height: '100%',
	width: '100%',
	padding: PADDING + 'px',
	borderRadius: '3px',
	perspective: '800px',
	variants: {
		isGhost: {
			false: { opacity: 1 },
			true: { transition: 'opacity .2s', opacity: GHOSTED_OPACITY },
		},
		isDarkMode: {
			true: {
				boxShadow:
					'2px 3px 12px -2px rgba(0,0,0,.3), 1px 1px 4px rgba(0,0,0,.3), 1px 1px 2px rgba(0,0,0,.3)',
			},
			false: {
				boxShadow:
					'2px 3px 12px -2px rgba(0,0,0,.2), 1px 1px 4px rgba(0,0,0,.16),  1px 1px 2px rgba(0,0,0,.16)',
			},
		},
	},
})

const commonTextWrapping = {
	whiteSpace: 'pre-wrap',
	overflowWrap: 'break-word',
	letterSpacing: LETTER_SPACING,
}

const StyledText = styled('div', {
	position: 'absolute',
	top: PADDING,
	left: PADDING,
	width: `calc(100% - ${PADDING * 2}px)`,
	height: 'fit-content',
	font: 'inherit',
	pointerEvents: 'none',
	userSelect: 'none',
	variants: {
		isEditing: {
			true: {
				opacity: 1,
			},
			false: {
				opacity: 1,
			},
		},
		alignment: {
			[AlignStyle.Start]: {
				textAlign: 'left',
			},
			[AlignStyle.Middle]: {
				textAlign: 'center',
			},
			[AlignStyle.End]: {
				textAlign: 'right',
			},
			[AlignStyle.Justify]: {
				textAlign: 'justify',
			},
		},
	},
	...commonTextWrapping,
})

const StyledTextArea = styled('textarea', {
	width: '100%',
	height: '100%',
	border: 'none',
	overflow: 'hidden',
	background: 'none',
	outline: 'none',
	textAlign: 'left',
	font: 'inherit',
	padding: 0,
	color: 'transparent',
	verticalAlign: 'top',
	resize: 'none',
	caretColor: 'black',
	...commonTextWrapping,
	variants: {
		alignment: {
			[AlignStyle.Start]: {
				textAlign: 'left',
			},
			[AlignStyle.Middle]: {
				textAlign: 'center',
			},
			[AlignStyle.End]: {
				textAlign: 'right',
			},
			[AlignStyle.Justify]: {
				textAlign: 'justify',
			},
		},
	},
	'&:focus': {
		outline: 'none',
		border: 'none',
	},
})

export const StickyComponent = TLShapeUtil.Component<T, E, TDMeta>(
	(
		{
			shape,
			meta,
			events,
			isGhost,
			isBinding,
			isEditing,
			onShapeBlur,
			onShapeChange,
		},
		ref
	) => {
		const font = 'sans-serif' // getStickyFontStyle(shape.style)
		const color = 'black'
		const fill = 'yellow'
		const textAlign = AlignStyle.Start

		const rContainer = React.useRef<HTMLDivElement>(null)

		const rTextArea = React.useRef<HTMLTextAreaElement>(null)

		const rText = React.useRef<HTMLDivElement>(null)

		const rIsMounted = React.useRef(false)

		const handlePointerDown = React.useCallback((e: React.PointerEvent) => {
			e.stopPropagation()
		}, [])

		// https://github.com/tldraw/tldraw/blob/main/packages/tldraw/src/state/TLDR.ts
		const normalizeText = (text: string) => {
			return text
				.replace(/\r?\n|\r/g, '\n')
				.split('\n')
				.map((x) => x || ' ')
				.join('\n')
		}

		const onChange = React.useCallback(
			(text: string) => {
				onShapeChange?.({
					id: shape.id,
					type: shape.type,
					text: normalizeText(text),
				})
			},
			[shape.id]
		)

		const handleTextChange = React.useCallback(
			(e: React.ChangeEvent<HTMLTextAreaElement>) => {
				onChange(e.currentTarget.value)
			},
			[onShapeChange, onChange]
		)

		const handleKeyDown = React.useCallback(
			(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
				if (e.key === 'Escape') {
					e.preventDefault()
					e.stopPropagation()
					onShapeBlur?.()
					return
				}

				if (e.key === 'Tab' && shape.text.length === 0) {
					e.preventDefault()
					return
				}

				if (!(e.key === 'Meta' || e.metaKey)) {
					e.stopPropagation()
				} else if (e.key === 'z' && e.metaKey) {
					if (e.shiftKey) {
						document.execCommand('redo', false)
					} else {
						document.execCommand('undo', false)
					}
					e.stopPropagation()
					e.preventDefault()
					return
				}
				if ((e.metaKey || e.ctrlKey) && e.key === '=') {
					e.preventDefault()
				}
				if (e.key === 'Tab') {
					e.preventDefault()
					if (e.shiftKey) {
						TextAreaUtils.unindent(e.currentTarget)
					} else {
						TextAreaUtils.indent(e.currentTarget)
					}

					onShapeChange?.({
						...shape,
						text: normalizeText(e.currentTarget.value),
					})
				}
			},
			[shape, onShapeChange]
		)

		const handleBlur = React.useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				e.currentTarget.setSelectionRange(0, 0)
				onShapeBlur?.()
			},
			[]
		)

		const handleFocus = React.useCallback(
			(e: React.FocusEvent<HTMLTextAreaElement>) => {
				if (!isEditing) return
				if (!rIsMounted.current) return
				e.currentTarget.select()
			},
			[isEditing]
		)

		// Focus when editing changes to true
		React.useEffect(() => {
			if (isEditing) {
				rIsMounted.current = true
				const elm = rTextArea.current!
				elm.focus()
				elm.select()
			}
		}, [isEditing])

		// Resize to fit text
		React.useEffect(() => {
			const text = rText.current!

			const { size } = shape
			const { offsetHeight: currTextHeight } = text
			const minTextHeight = MIN_CONTAINER_HEIGHT - PADDING * 2
			const prevTextHeight = size[1] - PADDING * 2

			// Same size? We can quit here
			if (currTextHeight === prevTextHeight) return

			if (currTextHeight > minTextHeight) {
				// Snap the size to the text content if the text only when the
				// text is larger than the minimum text height.
				onShapeChange?.({
					id: shape.id,
					size: [size[0], currTextHeight + PADDING * 2],
				})
				return
			}

			if (currTextHeight < minTextHeight && size[1] > MIN_CONTAINER_HEIGHT) {
				// If we're smaller than the minimum height and the container
				// is too tall, snap it down to the minimum container height
				onShapeChange?.({ id: shape.id, size: [size[0], MIN_CONTAINER_HEIGHT] })
				return
			}

			const textarea = rTextArea.current
			textarea?.focus()
		}, [shape.text, shape.size[1], shape.style])

		const style = {
			font,
			color,
			textShadow: meta.isDarkMode
				? `0.5px 0.5px 2px rgba(255, 255, 255,.25)`
				: `0.5px 0.5px 2px rgba(255, 255, 255,.5)`,
		}

		return (
			<HTMLContainer ref={ref} {...events}>
				<StyledStickyContainer
					ref={rContainer}
					isDarkMode={meta.isDarkMode}
					isGhost={isGhost}
					style={{ backgroundColor: fill, ...style }}
				>
					{isBinding && (
						<div
							className="tl-binding-indicator"
							style={{
								position: 'absolute',
								top: -8,
								left: -8,
								width: `calc(100% + ${8 * 2}px)`,
								height: `calc(100% + ${8 * 2}px)`,
								backgroundColor: 'var(--tl-selectFill)',
							}}
						/>
					)}
					<StyledText ref={rText} isEditing={isEditing} alignment={textAlign}>
						{shape.text}&#8203;
					</StyledText>
					{isEditing && (
						<StyledTextArea
							ref={rTextArea}
							onPointerDown={handlePointerDown}
							value={shape.text}
							onChange={handleTextChange}
							onKeyDown={handleKeyDown}
							onFocus={handleFocus}
							onBlur={handleBlur}
							tabIndex={-1}
							autoComplete="false"
							autoCapitalize="false"
							autoCorrect="false"
							autoSave="false"
							autoFocus
							spellCheck={true}
							alignment={shape.style.textAlign}
							onContextMenu={(e) => e.stopPropagation()}
							onCopy={(e) => e.stopPropagation()}
							onPaste={(e) => e.stopPropagation()}
							onCut={(e) => e.stopPropagation()}
						/>
					)}
				</StyledStickyContainer>
			</HTMLContainer>
		)
	}
)
