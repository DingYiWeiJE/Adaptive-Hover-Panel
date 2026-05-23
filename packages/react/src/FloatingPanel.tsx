import type { CSSProperties, HTMLAttributes, ReactNode } from 'react'
import type { LayoutResult } from '@adaptive-hover/core'

export interface FloatingPanelProps extends HTMLAttributes<HTMLDivElement> {
  layout: LayoutResult
  children: ReactNode
}

export function FloatingPanel({
  layout,
  className,
  style,
  children,
  ...rest
}: FloatingPanelProps) {
  const mergedStyle: CSSProperties = {
    ...style,
    position: 'fixed',
    left: layout.left,
    top: layout.top,
    width: layout.width,
    height: layout.height,
  }

  const mergedClassName = className ? `ahp-panel ${className}` : 'ahp-panel'

  return (
    <div className={mergedClassName} style={mergedStyle} {...rest}>
      {children}
    </div>
  )
}
