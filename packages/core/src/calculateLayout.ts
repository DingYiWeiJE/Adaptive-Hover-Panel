import { clamp } from './clamp'
import {
  DEFAULT_OFFSET,
  DEFAULT_MARGIN,
  DEFAULT_MIN_WIDTH,
  DEFAULT_MIN_HEIGHT,
} from './constants'
import type {
  LayoutOptions,
  LayoutResult,
  HorizontalPlacement,
  VerticalPlacement,
} from './types'

export function calculateLayout(opts: LayoutOptions): LayoutResult {
  const {
    mouseX,
    mouseY,
    viewportWidth,
    viewportHeight,
    offset = DEFAULT_OFFSET,
    margin = DEFAULT_MARGIN,
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxWidth = viewportWidth,
    maxHeight = viewportHeight,
  } = opts

  const horizontal: HorizontalPlacement =
    mouseX > viewportWidth / 2 ? 'left' : 'right'
  const vertical: VerticalPlacement =
    mouseY > viewportHeight / 2 ? 'top' : 'bottom'

  const rawWidth =
    horizontal === 'left'
      ? mouseX - margin - offset
      : viewportWidth - mouseX - margin - offset

  const rawHeight =
    vertical === 'top'
      ? mouseY - margin - offset
      : viewportHeight - mouseY - margin - offset

  const width = clamp(rawWidth, minWidth, maxWidth)
  const height = clamp(rawHeight, minHeight, maxHeight)

  const left =
    horizontal === 'left'
      ? Math.max(margin, mouseX - offset - width)
      : mouseX + offset

  const top =
    vertical === 'top'
      ? Math.max(margin, mouseY - offset - height)
      : mouseY + offset

  return { horizontal, vertical, left, top, width, height }
}
