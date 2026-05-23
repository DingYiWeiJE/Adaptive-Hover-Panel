import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/DarkMode',
  component: AdaptiveHoverPanel,
  parameters: {
    layout: 'centered',
    backgrounds: { default: 'dark' },
    themes: { default: 'dark' },
  },
  globals: { theme: 'dark' },
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

export const Dark: Story = {
  render: () => (
    <div className="dark-bg">
      <AdaptiveHoverPanel
        panel={
          <div className="preview-text">
            <strong>暗色模式预览</strong>
            <p>切换右上角工具栏的 theme 为 light/dark，观察毛玻璃面板背景适配。</p>
          </div>
        }
      >
        <button type="button" className="demo-trigger">
          Hover 看暗色面板
        </button>
      </AdaptiveHoverPanel>
    </div>
  ),
}
