import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'
import './_shared/demo.css'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'AdaptiveHoverPanel/LargeContent',
  component: AdaptiveHoverPanel,
  parameters: { layout: 'centered' },
}

export default meta

type Story = StoryObj<typeof AdaptiveHoverPanel>

export const RichCard: Story = {
  args: {
    minWidth: 360,
    minHeight: 280,
    panel: (
      <div className="preview-card">
        <h3>Adaptive Hover Panel</h3>
        <p>
          一个面向 <strong>大面积内容预览</strong> 的 React 组件。
          它围绕鼠标位置定位，并占满该方向上的剩余空间。
        </p>
        <p>核心特性：</p>
        <ul>
          <li>按鼠标四象限自动决定方向</li>
          <li>剩余空间自适应宽高</li>
          <li>状态机驱动 hover delay / close delay</li>
          <li>Portal 渲染避免 overflow / transform 干扰</li>
          <li>纯算法包 + React 包分离，框架无关</li>
        </ul>
        <p>
          适合用于：表格行预览、缩略图大图、卡片摘要展开、长文本提示。
        </p>
      </div>
    ),
    children: (
      <button type="button" className="demo-trigger">
        Hover 看富文本
      </button>
    ),
  },
}
