import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, fireEvent, render, screen } from '@testing-library/react'
import { AdaptiveHoverPanel, type AdaptiveHoverPanelProps } from './AdaptiveHoverPanel'

const DELAY = 400
const CLOSE_DELAY = 150

function advance(ms: number) {
  act(() => {
    vi.advanceTimersByTime(ms)
  })
}

function renderPanel(extra: Partial<AdaptiveHoverPanelProps> = {}) {
  return render(
    <AdaptiveHoverPanel
      delay={DELAY}
      closeDelay={CLOSE_DELAY}
      panel={<div role="tooltip">Panel Content</div>}
      {...extra}
    >
      <button data-testid="trigger" type="button">
        Hover me
      </button>
    </AdaptiveHoverPanel>
  )
}

describe('AdaptiveHoverPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({
      toFake: [
        'setTimeout',
        'clearTimeout',
        'requestAnimationFrame',
        'cancelAnimationFrame',
      ],
    })
  })

  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('delay 控制打开', () => {
    renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY - 1)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    advance(1)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('closeDelay 控制关闭', () => {
    renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    fireEvent.mouseLeave(trigger)
    advance(CLOSE_DELAY - 1)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    advance(1)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('trigger → panel 平滑过渡不关闭', () => {
    renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY)
    const panel = screen.getByRole('tooltip')
    expect(panel).toBeInTheDocument()

    fireEvent.mouseLeave(trigger)
    fireEvent.mouseEnter(panel)

    advance(CLOSE_DELAY * 2)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()
  })

  it('panel mouseleave 后 closeDelay 关闭', () => {
    renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY)
    const panel = screen.getByRole('tooltip')

    fireEvent.mouseLeave(trigger)
    fireEvent.mouseEnter(panel)
    fireEvent.mouseLeave(panel)

    advance(CLOSE_DELAY)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('disabled=true 时 hover 不打开', () => {
    renderPanel({ disabled: true })
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY * 2)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })

  it('Portal 挂载到 document.body 直属子节点', () => {
    renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY)

    const panelContent = screen.getByRole('tooltip')
    const floatingPanel = panelContent.parentElement
    expect(floatingPanel).not.toBeNull()
    expect(floatingPanel?.parentElement).toBe(document.body)
  })

  it('卸载时清理定时器', () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, 'clearTimeout')
    const { unmount } = renderPanel()
    const trigger = screen.getByTestId('trigger')

    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    const callsBeforeUnmount = clearTimeoutSpy.mock.calls.length
    unmount()

    expect(clearTimeoutSpy.mock.calls.length).toBeGreaterThan(callsBeforeUnmount)

    advance(DELAY * 2)
    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()

    clearTimeoutSpy.mockRestore()
  })

  it('disabled 动态切换为 true 时立即关闭面板', () => {
    const { rerender } = render(
      <AdaptiveHoverPanel
        delay={DELAY}
        closeDelay={CLOSE_DELAY}
        disabled={false}
        panel={<div role="tooltip">Panel Content</div>}
      >
        <button data-testid="trigger" type="button">
          Hover me
        </button>
      </AdaptiveHoverPanel>
    )

    const trigger = screen.getByTestId('trigger')
    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })
    advance(DELAY)
    expect(screen.getByRole('tooltip')).toBeInTheDocument()

    rerender(
      <AdaptiveHoverPanel
        delay={DELAY}
        closeDelay={CLOSE_DELAY}
        disabled={true}
        panel={<div role="tooltip">Panel Content</div>}
      >
        <button data-testid="trigger" type="button">
          Hover me
        </button>
      </AdaptiveHoverPanel>
    )

    expect(screen.queryByRole('tooltip')).not.toBeInTheDocument()
  })
})
