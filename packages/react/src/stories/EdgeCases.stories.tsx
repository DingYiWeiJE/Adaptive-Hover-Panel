import type { CSSProperties } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/EdgeCases',
  component: AdaptiveHoverPanel,
  parameters: { layout: 'fullscreen' },
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

const CORNERS: { label: string; style: CSSProperties }[] = [
  { label: '左上', style: { top: 20, left: 20 } },
  { label: '右上', style: { top: 20, right: 20 } },
  { label: '左下', style: { bottom: 20, left: 20 } },
  { label: '右下', style: { bottom: 20, right: 20 } },
]

export const FourCorners: Story = {
  render: () => (
    <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
      {CORNERS.map((c) => (
        <div key={c.label} style={{ position: 'fixed', ...c.style }}>
          <AdaptiveHoverPanel
            panel={
              <div className="preview-text">
                <strong>{c.label} trigger</strong>
                <p>面板会出现在与之对角的方向，验证四象限自适应。</p>
              </div>
            }
          >
            <button type="button" className="demo-trigger" style={{ width: 160, height: 80 }}>
              {c.label}
            </button>
          </AdaptiveHoverPanel>
        </div>
      ))}
      <p
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          textAlign: 'center',
          maxWidth: 360,
          color: 'rgba(0,0,0,0.6)',
        }}
      >
        把鼠标移到四个角落的按钮，观察面板从对角方向弹出。
      </p>
    </div>
  ),
}
