export type HorizontalPlacement = 'left' | 'right'
export type VerticalPlacement = 'top' | 'bottom'

export interface LayoutOptions {
  mouseX: number
  mouseY: number
  viewportWidth: number
  viewportHeight: number

  /** 鼠标到面板的间距，默认 8 */
  offset?: number
  /** 面板到视口边缘的安全距离，默认 12 */
  margin?: number

  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
}

export interface LayoutResult {
  horizontal: HorizontalPlacement
  vertical: VerticalPlacement
  left: number
  top: number
  width: number
  height: number
}
