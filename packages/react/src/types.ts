import type { HTMLAttributes } from 'react'
import type { LayoutResult } from '@adaptive-hover/core'

export type PanelState = 'IDLE' | 'PENDING_OPEN' | 'OPEN' | 'PENDING_CLOSE'

export interface UseAdaptiveHoverPanelOptions {
  /** 打开延迟（ms），默认 400 */
  delay?: number
  /** 关闭延迟（ms），默认 150 */
  closeDelay?: number
  /** 鼠标到面板的间距，默认 8 */
  offset?: number
  /** 面板到视口边缘的安全距离，默认 12 */
  margin?: number
  /** 面板最小宽度，默认 240 */
  minWidth?: number
  /** 面板最小高度，默认 160 */
  minHeight?: number
  /** 面板最大宽度，默认随视口宽度 */
  maxWidth?: number
  /** 面板最大高度，默认随视口高度 */
  maxHeight?: number
  /** 禁用所有交互，默认 false */
  disabled?: boolean
}

export interface UseAdaptiveHoverPanelReturn {
  visible: boolean
  layout: LayoutResult | null
  triggerProps: HTMLAttributes<HTMLElement>
  panelProps: HTMLAttributes<HTMLElement>
  open: () => void
  close: () => void
}
