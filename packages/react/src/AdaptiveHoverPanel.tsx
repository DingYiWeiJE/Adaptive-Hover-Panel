import {
  cloneElement,
  isValidElement,
  type MouseEvent,
  type ReactNode,
} from 'react'
import { useAdaptiveHoverPanel } from './useAdaptiveHoverPanel'
import { Portal } from './Portal'
import { FloatingPanel } from './FloatingPanel'

export interface AdaptiveHoverPanelProps {
  children: ReactNode
  panel: ReactNode
  delay?: number
  closeDelay?: number
  offset?: number
  margin?: number
  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number
  className?: string
  panelClassName?: string
  disabled?: boolean
}

type MouseHandler = (e: MouseEvent<HTMLElement>) => void

interface InjectableChildProps {
  className?: string
  onMouseEnter?: MouseHandler
  onMouseLeave?: MouseHandler
  onMouseMove?: MouseHandler
}

function chain(
  a: MouseHandler | undefined,
  b: MouseHandler | undefined
): MouseHandler | undefined {
  if (!a) return b
  if (!b) return a
  return (e) => {
    a(e)
    b(e)
  }
}

function mergeClassName(a?: string, b?: string): string | undefined {
  if (a && b) return `${a} ${b}`
  return a ?? b
}

export function AdaptiveHoverPanel(props: AdaptiveHoverPanelProps) {
  const {
    children,
    panel,
    className,
    panelClassName,
    delay,
    closeDelay,
    offset,
    margin,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    disabled,
  } = props

  const { visible, layout, triggerProps, panelProps } = useAdaptiveHoverPanel({
    delay,
    closeDelay,
    offset,
    margin,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    disabled,
  })

  let trigger: ReactNode
  if (isValidElement<InjectableChildProps>(children)) {
    const childProps = children.props
    trigger = cloneElement(children, {
      className: mergeClassName(childProps.className, className),
      onMouseEnter: chain(childProps.onMouseEnter, triggerProps.onMouseEnter),
      onMouseLeave: chain(childProps.onMouseLeave, triggerProps.onMouseLeave),
      onMouseMove: chain(childProps.onMouseMove, triggerProps.onMouseMove),
    })
  } else {
    trigger = (
      <span style={{ display: 'contents' }} className={className} {...triggerProps}>
        {children}
      </span>
    )
  }

  const showPanel = !disabled && visible && layout

  return (
    <>
      {trigger}
      {showPanel && (
        <Portal>
          <FloatingPanel
            layout={layout}
            className={panelClassName}
            {...panelProps}
          >
            {panel}
          </FloatingPanel>
        </Portal>
      )}
    </>
  )
}
