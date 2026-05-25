import {
  useCallback,
  useEffect,
  useReducer,
  useRef,
  useState,
  type HTMLAttributes,
  type MouseEvent,
} from 'react'
import { calculateLayout, type LayoutResult } from '@adaptive-hover/core'
import type {
  PanelState,
  UseAdaptiveHoverPanelOptions,
  UseAdaptiveHoverPanelReturn,
} from './types'

const DEFAULT_DELAY = 400
const DEFAULT_CLOSE_DELAY = 150
const RESIZE_DEBOUNCE_MS = 150

type Action =
  | { type: 'TRIGGER_ENTER' }
  | { type: 'TRIGGER_LEAVE' }
  | { type: 'PANEL_ENTER' }
  | { type: 'PANEL_LEAVE' }
  | { type: 'OPEN_FIRED' }
  | { type: 'CLOSE_FIRED' }
  | { type: 'FORCE_OPEN' }
  | { type: 'FORCE_CLOSE' }

function reducer(state: PanelState, action: Action): PanelState {
  switch (state) {
    case 'IDLE':
      switch (action.type) {
        case 'TRIGGER_ENTER':
          return 'PENDING_OPEN'
        case 'FORCE_OPEN':
          return 'OPEN'
        default:
          return state
      }
    case 'PENDING_OPEN':
      switch (action.type) {
        case 'TRIGGER_LEAVE':
        case 'FORCE_CLOSE':
          return 'IDLE'
        case 'OPEN_FIRED':
        case 'FORCE_OPEN':
          return 'OPEN'
        default:
          return state
      }
    case 'OPEN':
      switch (action.type) {
        case 'TRIGGER_LEAVE':
        case 'PANEL_LEAVE':
          return 'PENDING_CLOSE'
        case 'FORCE_CLOSE':
          return 'IDLE'
        default:
          return state
      }
    case 'PENDING_CLOSE':
      switch (action.type) {
        case 'TRIGGER_ENTER':
        case 'PANEL_ENTER':
        case 'FORCE_OPEN':
          return 'OPEN'
        case 'CLOSE_FIRED':
        case 'FORCE_CLOSE':
          return 'IDLE'
        default:
          return state
      }
  }
}

function getInitialViewport() {
  if (typeof window === 'undefined') return { w: 0, h: 0 }
  return { w: window.innerWidth, h: window.innerHeight }
}

export function useAdaptiveHoverPanel(
  options: UseAdaptiveHoverPanelOptions = {}
): UseAdaptiveHoverPanelReturn {
  const {
    delay = DEFAULT_DELAY,
    closeDelay = DEFAULT_CLOSE_DELAY,
    offset,
    margin,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
    disabled = false,
  } = options

  const [state, dispatch] = useReducer(reducer, 'IDLE' as PanelState)
  const [viewport, setViewport] = useState(getInitialViewport)
  const [frozenLayout, setFrozenLayout] = useState<LayoutResult | null>(null)

  const openTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const closeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const pendingMouseRef = useRef({ x: 0, y: 0 })

  const clearOpenTimer = useCallback(() => {
    if (openTimerRef.current != null) {
      clearTimeout(openTimerRef.current)
      openTimerRef.current = null
    }
  }, [])

  const clearCloseTimer = useCallback(() => {
    if (closeTimerRef.current != null) {
      clearTimeout(closeTimerRef.current)
      closeTimerRef.current = null
    }
  }, [])

  useEffect(() => {
    if (state === 'PENDING_OPEN') {
      clearOpenTimer()
      openTimerRef.current = setTimeout(() => {
        openTimerRef.current = null
        dispatch({ type: 'OPEN_FIRED' })
      }, delay)
      return clearOpenTimer
    }
    if (state === 'PENDING_CLOSE') {
      clearCloseTimer()
      closeTimerRef.current = setTimeout(() => {
        closeTimerRef.current = null
        dispatch({ type: 'CLOSE_FIRED' })
      }, closeDelay)
      return clearCloseTimer
    }
    return undefined
  }, [state, delay, closeDelay, clearOpenTimer, clearCloseTimer])

  useEffect(() => {
    if (disabled) dispatch({ type: 'FORCE_CLOSE' })
  }, [disabled])

  useEffect(() => {
    if (typeof window === 'undefined') return undefined
    let debounceTimer: ReturnType<typeof setTimeout> | null = null
    const onResize = () => {
      if (debounceTimer != null) clearTimeout(debounceTimer)
      debounceTimer = setTimeout(() => {
        debounceTimer = null
        setViewport({ w: window.innerWidth, h: window.innerHeight })
      }, RESIZE_DEBOUNCE_MS)
    }
    window.addEventListener('resize', onResize)
    return () => {
      window.removeEventListener('resize', onResize)
      if (debounceTimer != null) clearTimeout(debounceTimer)
    }
  }, [])

  const handleMouseMove = useCallback(
    (e: MouseEvent<HTMLElement>) => {
      console.log('%c Ding 🚀🚀🚀', 'color: white; background: linear-gradient(135deg, #00c853, #64dd17); padding: 6px 12px; border-radius: 8px; font-size: 14px; font-weight: bold; text-shadow: 0 1px 2px rgba(0,0,0,0.3);', 
        '正在移动'
      );
      
      if (disabled) return
      pendingMouseRef.current = { x: e.clientX, y: e.clientY }
    },
    [disabled]
  )

  const onTriggerEnter = useCallback(() => {
    if (disabled) return
    dispatch({ type: 'TRIGGER_ENTER' })
  }, [disabled])

  const onTriggerLeave = useCallback(() => {
    if (disabled) return
    dispatch({ type: 'TRIGGER_LEAVE' })
  }, [disabled])

  const onPanelEnter = useCallback(() => {
    if (disabled) return
    dispatch({ type: 'PANEL_ENTER' })
  }, [disabled])

  const onPanelLeave = useCallback(() => {
    if (disabled) return
    dispatch({ type: 'PANEL_LEAVE' })
  }, [disabled])

  const open = useCallback(() => {
    if (disabled) return
    dispatch({ type: 'FORCE_OPEN' })
  }, [disabled])

  const close = useCallback(() => {
    dispatch({ type: 'FORCE_CLOSE' })
  }, [])

  const visible = state === 'OPEN' || state === 'PENDING_CLOSE'

  useEffect(() => {
    if (!visible) {
      setFrozenLayout(null)
      return
    }
    setFrozenLayout((prev) => {
      if (prev) return prev
      if (viewport.w === 0 || viewport.h === 0) return null
      return calculateLayout({
        mouseX: pendingMouseRef.current.x,
        mouseY: pendingMouseRef.current.y,
        viewportWidth: viewport.w,
        viewportHeight: viewport.h,
        offset,
        margin,
        minWidth,
        minHeight,
        maxWidth,
        maxHeight,
      })
    })
  }, [
    visible,
    viewport.w,
    viewport.h,
    offset,
    margin,
    minWidth,
    minHeight,
    maxWidth,
    maxHeight,
  ])

  const layout = frozenLayout

  const triggerProps: HTMLAttributes<HTMLElement> = {
    onMouseEnter: onTriggerEnter,
    onMouseLeave: onTriggerLeave,
    onMouseMove: handleMouseMove,
  }

  const panelProps: HTMLAttributes<HTMLElement> = {
    onMouseEnter: onPanelEnter,
    onMouseLeave: onPanelLeave,
    style: layout
      ? {
          position: 'fixed',
          left: layout.left,
          top: layout.top,
          width: layout.width,
          height: layout.height,
        }
      : undefined,
  }

  return { visible, layout, triggerProps, panelProps, open, close }
}
