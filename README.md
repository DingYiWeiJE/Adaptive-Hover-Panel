# Adaptive Hover Panel

![demo](docs/demo.gif)

> 占位 GIF，待补。

视口感知的 React 悬停面板：自动翻转方向，永远留在屏幕内。

[![npm version](https://img.shields.io/npm/v/@adaptive-hover/react.svg)](https://www.npmjs.com/package/@adaptive-hover/react)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@adaptive-hover/react)](https://bundlephobia.com/package/@adaptive-hover/react)
[![license](https://img.shields.io/npm/l/@adaptive-hover/react.svg)](./LICENSE)

## 安装

```bash
pnpm add @adaptive-hover/react
```

也支持 `npm install` 和 `yarn add`。需要 React ≥ 18。

## 10 秒上手

```tsx
import { AdaptiveHoverPanel } from '@adaptive-hover/react'
import '@adaptive-hover/react/styles.css'

export function Demo() {
  return (
    <AdaptiveHoverPanel
      panel={
        <div style={{ padding: 12 }}>
          <strong>预览内容</strong>
          <p>悬停 400ms 自动展开，离开 150ms 自动收起。</p>
        </div>
      }
    >
      <button>悬停查看</button>
    </AdaptiveHoverPanel>
  )
}
```

复制即可运行，无需配置 babel / postcss / 全局样式。

## Props

| 字段             | 类型                                | 默认值 | 说明                              |
| ---------------- | ----------------------------------- | ------ | --------------------------------- |
| `children`       | `ReactNode`                         | —      | 触发元素（必填）                  |
| `panel`          | `ReactNode \| (() => ReactNode)`    | —      | 浮窗内容（必填），支持函数形式    |
| `delay`          | `number`                            | `400`  | 打开延迟（ms）                    |
| `closeDelay`     | `number`                            | `150`  | 关闭延迟（ms）                    |
| `offset`         | `number`                            | `8`    | 鼠标到面板距离（px）              |
| `margin`         | `number`                            | `12`   | 面板到视口边缘安全距离（px）      |
| `minWidth`       | `number`                            | —      | 面板最小宽度                      |
| `minHeight`      | `number`                            | —      | 面板最小高度                      |
| `maxWidth`       | `number`                            | —      | 面板最大宽度                      |
| `maxHeight`      | `number`                            | —      | 面板最大高度                      |
| `className`      | `string`                            | —      | 触发器外层 class                  |
| `panelClassName` | `string`                            | —      | 浮窗 class                        |
| `disabled`       | `boolean`                           | `false`| 禁用 hover 触发                   |

## 浏览器兼容性

| 浏览器  | 最低版本 |
| ------- | -------- |
| Chrome  | 76       |
| Edge    | 76       |
| Firefox | 103      |
| Safari  | 14       |

毛玻璃效果（`backdrop-filter`）在不支持的浏览器自动降级为半透明背景。

## License

[MIT](./LICENSE)
