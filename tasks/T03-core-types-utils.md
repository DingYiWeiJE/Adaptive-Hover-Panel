# T03 — Core：类型 + 常量 + clamp

## 目标

实现 `@adaptive-hover/core` 的基础类型、常量、工具函数，为算法实现做准备。

## 前置依赖

T02 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 6.2、6.3 节

## 交付物

1. **[packages/core/src/types.ts](../packages/core/src/types.ts)**
   - `HorizontalPlacement = 'left' | 'right'`
   - `VerticalPlacement = 'top' | 'bottom'`
   - `LayoutOptions` 接口（含 `mouseX/Y`、`viewportWidth/Height`、可选的 `offset`、`margin`、`min/maxWidth`、`min/maxHeight`）
   - `LayoutResult` 接口（`horizontal`、`vertical`、`left`、`top`、`width`、`height`）
   - 严格按文档第 6.2 节签名实现

2. **[packages/core/src/clamp.ts](../packages/core/src/clamp.ts)**
   ```ts
   export const clamp = (value: number, min: number, max: number): number =>
     Math.min(Math.max(value, min), max)
   ```

3. **[packages/core/src/constants.ts](../packages/core/src/constants.ts)**
   ```ts
   export const DEFAULT_OFFSET = 8
   export const DEFAULT_MARGIN = 12
   export const DEFAULT_MIN_WIDTH = 240
   export const DEFAULT_MIN_HEIGHT = 160
   ```

4. **[packages/core/src/index.ts](../packages/core/src/index.ts)**
   - 重新导出 types、clamp、constants
   - 使用 `export * from './xxx'`

## 约束

- **不依赖** `react`、`vue`、`react-dom`、任何 DOM API
- 所有导出必须有显式类型
- 不得引入运行时副作用

## 验收标准

```bash
pnpm --filter @adaptive-hover/core typecheck
```

期望通过且无 warning。

手动检查：
- `packages/core/src/index.ts` 中能 `import { clamp, DEFAULT_OFFSET, type LayoutOptions } from '@adaptive-hover/core'` 不报错（在另一个 package 中）

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T03 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加偏离决定

## 完成记录

<!-- 完成后在此追加 -->
