# Adaptive Hover Panel 开发文档（React 版）

> 一个基于鼠标位置自适应方向与尺寸的 React 悬浮预览面板组件库。

## 目录

- [1. 项目概述](#1-项目概述)
- [2. 核心理念](#2-核心理念)
- [3. 技术栈](#3-技术栈)
- [4. Monorepo 结构](#4-monorepo-结构)
- [5. 开发路线图](#5-开发路线图)
- [6. Core 模块](#6-core-模块)
- [7. React 模块](#7-react-模块)
- [8. 组件 API](#8-组件-api)
- [9. 样式系统](#9-样式系统)
- [10. 性能优化](#10-性能优化)
- [11. 测试策略](#11-测试策略)
- [12. 构建与发布](#12-构建与发布)
- [13. README 规范](#13-readme-规范)
- [14. Storybook 场景](#14-storybook-场景)
- [15. 贡献指南](#15-贡献指南)

---

## 1. 项目概述

`Adaptive Hover Panel` 是一个面向**大面积内容预览**的 React 组件库。

它解决的问题：传统 Tooltip / Popover 围绕 trigger 元素定位，预览区域受触发点位置限制，难以承载大块内容（图片、表格、富文本卡片）。

本组件围绕**鼠标位置和屏幕剩余空间**定位，行为如下：

```
hover trigger → 延迟触发 → 读取鼠标坐标
                              ↓
                根据屏幕四象限决定方向
                              ↓
                  占满该方向剩余空间
                              ↓
                     渲染预览面板
```

定位关键词：**Cursor-aware Adaptive Hover Preview Panel**。

---

## 2. 核心理念

| 维度     | 普通 Tooltip / Popover  | Adaptive Hover Panel       |
| -------- | ----------------------- | -------------------------- |
| 锚点     | trigger 元素            | 鼠标位置                   |
| 尺寸     | 内容自适应              | 剩余空间自适应             |
| 方向     | 固定（top/bottom/...）  | 由鼠标所在象限自动决定     |
| 适用场景 | 短文本提示              | 大面积预览（图、表、卡片） |

---

## 3. 技术栈

- **运行时**：React 18+、TypeScript 5+
- **包管理**：pnpm workspace
- **库构建**：tsup（输出 ESM + CJS + d.ts）
- **示例开发**：Vite
- **测试**：Vitest + @testing-library/react
- **文档**：Storybook（组件示例）→ VitePress（站点，后期）

---

## 4. Monorepo 结构

```
adaptive-hover-panel/
├── packages/
│   ├── core/          # 纯算法、与框架无关
│   └── react/         # React Hook + Component
├── playground/        # Vite 本地调试
├── docs/              # VitePress 站点
├── package.json
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── README.md
```

### 4.1 `@adaptive-hover/core`

- 纯函数、纯类型
- **不**依赖 `react` / `vue` / DOM API
- 可被任意框架（Vue、Solid、Svelte）复用

### 4.2 `@adaptive-hover/react`

- 依赖 `react` `react-dom`（peerDeps）
- 提供 Hook、组件、Portal、状态机
- 仅做 React 层封装，算法全部委托给 core

---

## 5. 开发路线图

### 第一阶段（MVP）

只实现：`Hover → Delay → Open → Dynamic Layout`

明确**不做**：进出场动画、主题系统、复杂手势（pin / drag）、移动端触摸、完整无障碍（focus 管理 / ARIA）、嵌套面板。

### 第二阶段

动画、主题、键盘交互、a11y。

### 第三阶段

嵌套、移动端、自定义渲染器。

> 第一阶段先把"自适应布局"这一核心做扎实，避免范围爆炸。

---

## 6. Core 模块

### 6.1 文件结构

```
packages/core/src/
├── calculateLayout.ts
├── clamp.ts
├── constants.ts
├── types.ts
└── index.ts
```

### 6.2 类型定义

```ts
// types.ts
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
```

### 6.3 工具函数

```ts
// clamp.ts
export const clamp = (value: number, min: number, max: number): number =>
  Math.min(Math.max(value, min), max)
```

```ts
// constants.ts
export const DEFAULT_OFFSET = 8
export const DEFAULT_MARGIN = 12
export const DEFAULT_MIN_WIDTH = 240
export const DEFAULT_MIN_HEIGHT = 160
```

### 6.4 核心算法

步骤：

1. 根据鼠标在视口中的象限决定方向
2. 计算该方向上的可用宽高
3. 计算 `left` `top`
4. 用 `clamp` 限制到 `[min, max]` 区间，再用 `Math.max(margin, ...)` 兜底防溢出

```ts
// calculateLayout.ts
import { clamp } from './clamp'
import {
  DEFAULT_OFFSET,
  DEFAULT_MARGIN,
  DEFAULT_MIN_WIDTH,
  DEFAULT_MIN_HEIGHT,
} from './constants'
import type {
  LayoutOptions,
  LayoutResult,
  HorizontalPlacement,
  VerticalPlacement,
} from './types'

export function calculateLayout(opts: LayoutOptions): LayoutResult {
  const {
    mouseX,
    mouseY,
    viewportWidth,
    viewportHeight,
    offset = DEFAULT_OFFSET,
    margin = DEFAULT_MARGIN,
    minWidth = DEFAULT_MIN_WIDTH,
    minHeight = DEFAULT_MIN_HEIGHT,
    maxWidth = viewportWidth,
    maxHeight = viewportHeight,
  } = opts

  // 1. 方向：鼠标在右半边 → 面板放左边
  const horizontal: HorizontalPlacement =
    mouseX > viewportWidth / 2 ? 'left' : 'right'
  const vertical: VerticalPlacement =
    mouseY > viewportHeight / 2 ? 'top' : 'bottom'

  // 2. 可用尺寸
  const rawWidth =
    horizontal === 'left'
      ? mouseX - margin - offset
      : viewportWidth - mouseX - margin - offset

  const rawHeight =
    vertical === 'top'
      ? mouseY - margin - offset
      : viewportHeight - mouseY - margin - offset

  const width = clamp(rawWidth, minWidth, maxWidth)
  const height = clamp(rawHeight, minHeight, maxHeight)

  // 3. 定位
  const left =
    horizontal === 'left'
      ? Math.max(margin, mouseX - offset - width)
      : mouseX + offset

  const top =
    vertical === 'top'
      ? Math.max(margin, mouseY - offset - height)
      : mouseY + offset

  return { horizontal, vertical, left, top, width, height }
}
```

> `clamp` 后的宽度可能大于"鼠标到边缘"的可用空间（视口很小时）。`left` `top` 用 `Math.max(margin, ...)` 兜底，避免溢出视口。

### 6.5 入口

```ts
// index.ts
export * from './types'
export * from './calculateLayout'
export * from './clamp'
export * from './constants'
```

---

## 7. React 模块

### 7.1 文件结构

```
packages/react/src/
├── AdaptiveHoverPanel.tsx
├── useAdaptiveHoverPanel.ts
├── FloatingPanel.tsx
├── Portal.tsx
├── styles.css
├── types.ts
└── index.ts
```

### 7.2 状态机

用显式状态替代多个 boolean，避免状态组合爆炸：

```
        mouseenter (start delay)
IDLE ───────────────────────────► PENDING_OPEN
 ▲                                       │
 │                            delay 到期 │
 │                                       ▼
 │  closeDelay 到期                    OPEN
 │ ◄──────────────────── PENDING_CLOSE ◄┤
 │                            ▲         │ mouseleave
 │                            │         │
 │              re-enter      └───── PENDING_CLOSE
 └─ mouseleave (in PENDING_OPEN, cancel timer)
```

| 当前态           | 事件                | 下一态         | 动作              |
| ---------------- | ------------------- | -------------- | ----------------- |
| `IDLE`           | trigger enter       | `PENDING_OPEN` | 启动 openTimer    |
| `PENDING_OPEN`   | trigger leave       | `IDLE`         | 取消 openTimer    |
| `PENDING_OPEN`   | openTimer 到期      | `OPEN`         | 计算 layout、显示 |
| `OPEN`           | trigger/panel leave | `PENDING_CLOSE`| 启动 closeTimer   |
| `PENDING_CLOSE`  | trigger/panel enter | `OPEN`         | 取消 closeTimer   |
| `PENDING_CLOSE`  | closeTimer 到期     | `IDLE`         | 隐藏              |

### 7.3 Hook：`useAdaptiveHoverPanel`

职责：

- 维护状态机
- 管理 open / close 定时器
- 监听 `mouseenter` `mouseleave` `mousemove`
- 调用 `calculateLayout` 得到 layout
- 输出 `triggerProps` `panelProps`

返回值：

```ts
interface UseAdaptiveHoverPanelReturn {
  visible: boolean
  layout: LayoutResult | null
  triggerProps: HTMLAttributes<HTMLElement>
  panelProps: HTMLAttributes<HTMLElement>
  open: () => void
  close: () => void
}
```

实现要点：

- 定时器存 `useRef`，**不要存 state**，否则每次写入都触发 re-render
- `mousemove` 不直接 `setState`，用 `requestAnimationFrame` 节流
- `layout` 用 `useMemo`，依赖鼠标坐标、viewport、options
- 卸载时清理所有定时器与监听

### 7.4 Portal

```tsx
// Portal.tsx
import { createPortal } from 'react-dom'
import { useEffect, useState, type ReactNode } from 'react'

export function Portal({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.body)
  }, [])

  return container ? createPortal(children, container) : null
}
```

为什么必须 Portal：避免祖先节点的 `overflow: hidden`、`transform`、`z-index` 干扰浮窗渲染。

### 7.5 定位

浮窗必须 `position: fixed`。算法基于 viewport 坐标，`absolute` 会受最近定位祖先影响，与算法假设不符。

---

## 8. 组件 API

### 8.1 用法

```tsx
<AdaptiveHoverPanel
  delay={400}
  closeDelay={150}
  offset={8}
  margin={12}
  minWidth={240}
  minHeight={160}
  panel={<Preview data={item} />}
>
  <Button>悬停查看</Button>
</AdaptiveHoverPanel>
```

### 8.2 Props

```ts
interface AdaptiveHoverPanelProps {
  /** 触发元素 */
  children: ReactNode
  /** 浮窗内容 */
  panel: ReactNode

  /** 打开延迟（ms），默认 400 */
  delay?: number
  /** 关闭延迟（ms），默认 150 */
  closeDelay?: number

  /** 鼠标到面板距离，默认 8 */
  offset?: number
  /** 面板到视口边缘距离，默认 12 */
  margin?: number

  minWidth?: number
  minHeight?: number
  maxWidth?: number
  maxHeight?: number

  className?: string
  panelClassName?: string

  /** 禁用 hover 触发 */
  disabled?: boolean
}
```

> 第一版默认 `delay=400ms`。原方案的 2000ms 体感是"卡死"，不建议作为默认值。

---

## 9. 样式系统

### 9.1 默认毛玻璃效果

```css
.ahp-panel {
  position: fixed;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
  overflow: hidden;
}

@media (prefers-color-scheme: dark) {
  .ahp-panel {
    background: rgba(20, 20, 20, 0.45);
    border-color: rgba(255, 255, 255, 0.08);
  }
}
```

### 9.2 降级策略

`backdrop-filter` 在部分浏览器或低端设备不支持，应提供回退背景色（提高 alpha 通道至 0.85+）。可通过 `@supports` 检测：

```css
@supports not (backdrop-filter: blur(1px)) {
  .ahp-panel { background: rgba(255, 255, 255, 0.92); }
}
```

---

## 10. 性能优化

| 场景              | 做法                                            |
| ----------------- | ----------------------------------------------- |
| 频繁 mousemove    | `requestAnimationFrame` 节流，避免每帧 setState |
| 定时器            | 存 `useRef`，不存 state                         |
| layout 计算       | `useMemo`，依赖鼠标坐标 + viewport + options    |
| viewport 变化     | 监听 `resize`，去抖（150ms）                    |
| 大量 trigger 实例 | 共享一个全局监听器（第二阶段优化）              |

---

## 11. 测试策略

### 11.1 Core 单元测试（Vitest）

- 四象限方向判定（左上 / 右上 / 左下 / 右下）
- 中线与正中心
- 宽高计算（含 min / max clamp）
- `left` `top` 不溢出视口
- 极小视口（如 320×240）下不抛错
- `offset` `margin` 边界

### 11.2 React 集成测试（Testing Library）

- hover delay 后才打开
- mouseleave 后 closeDelay 才关闭
- trigger → panel 之间移动**不应**触发关闭
- `disabled=true` 时不响应
- Portal 正确挂载到 `document.body`
- 组件卸载时清理定时器与事件

### 11.3 手测清单

- 浏览器缩放 100% / 125% / 150% / 200%
- 极窄屏（≤ 480px）、超宽屏（≥ 2560px）
- DPR=1 / 2 / 3

---

## 12. 构建与发布

### 12.1 tsup 配置

```ts
// tsup.config.ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
})
```

### 12.2 package.json exports

```json
{
  "name": "@adaptive-hover/react",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"]
}
```

### 12.3 发布流程

1. `pnpm changeset` 添加变更说明
2. `pnpm -r build` 触发所有 package 构建
3. `pnpm changeset version` 自动 bump 版本
4. `pnpm changeset publish` 发布到 npm

---

## 13. README 规范

首页按以下顺序：

1. **GIF 演示**（最重要，决定第一印象）
2. 一句话介绍 + Badge（npm version、bundle size、license）
3. 安装：`pnpm add @adaptive-hover/react`
4. **10 秒上手**示例（复制即可运行）
5. Props 表
6. 浏览器兼容性
7. License（MIT）

> Quick Start 必须做到"复制即可运行"，不要让读者先去配 babel / postcss / 全局样式。

---

## 14. Storybook 场景

最少覆盖：

- **Basic**：单个按钮 + 短文本预览
- **Large Content**：富文本 / 长卡片
- **Image Preview**：图片缩略图 → 大图
- **Table Preview**：表格行 hover 显示详情
- **Edge Cases**：四角触发 / 极窄屏
- **Dark Mode**：暗色背景下的毛玻璃效果

---

## 15. 贡献指南

- Issue 优先，先讨论再 PR
- 提交规范：Conventional Commits（`feat:` `fix:` `docs:` ...）
- 每个 PR 需附带 Changeset
- Core 改动**必须**带单测；React 层鼓励带单测
- Lint / 类型检查通过才能合并

---

## 附录：与原方案的关键差异

| 项                | 原文档       | 本文档                            |
| ----------------- | ------------ | --------------------------------- |
| 默认 `delay`      | 2000ms       | 400ms（2000ms 体感卡顿）          |
| `calculateLayout` | 伪代码片段   | 完整实现 + 边界兜底               |
| 状态机            | 仅流程图     | 流程图 + 完整状态转换表           |
| `package.json`    | 缺 peerDeps  | 补 peerDeps、sideEffects、types   |
| 毛玻璃            | 无降级       | `@supports` 降级                  |
