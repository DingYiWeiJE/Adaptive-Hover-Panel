import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/Basic',
  component: AdaptiveHoverPanel,
  parameters: { layout: 'centered' },
  tags: ['autodocs'],
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

export const Default: Story = {
  args: {
    delay: 300,
    closeDelay: 150,
    panel: (
      <div className="preview-text">
        <strong>用户信息</strong>
        <p>这是一个最简单的悬停预览面板，按鼠标四象限自适应方向。</p>
      </div>
    ),
    children: (
      <button type="button" className="demo-trigger">
        Hover 我
      </button>
    ),
  },
}
