# T08 — React：AdaptiveHoverPanel 组件

## 目标

实现用户面向的 `<AdaptiveHoverPanel>` 组件，组合 Hook + Portal + FloatingPanel。

## 前置依赖

T06（Portal）、T07（Hook）已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 8 节

## 交付物

1. **[packages/react/src/FloatingPanel.tsx](../packages/react/src/FloatingPanel.tsx)**
   - 纯展示组件
   - Props: `{ layout: LayoutResult; className?: string; children: ReactNode; ...panelProps }`
   - 应用 `position: fixed` + layout 中的 `left/top/width/height`
   - 默认带 `className="ahp-panel"`，与 T09 的 css 文件配合
   - 用户传入 `className` 时合并

2. **[packages/react/src/AdaptiveHoverPanel.tsx](../packages/react/src/AdaptiveHoverPanel.tsx)**
   - Props 严格按文档 8.2：
     ```ts
     interface AdaptiveHoverPanelProps {
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
     ```
   - 内部调用 `useAdaptiveHoverPanel` 获取 layout 和 triggerProps/panelProps
   - 用 `cloneElement`（或包装 div）把 `triggerProps` 注入 `children`
     - 推荐方案：包一层 `<span style="display: contents">`（避免破坏 children 的样式）或直接 cloneElement
     - 由实现者权衡，但需在完成记录里说明选择
   - 通过 `<Portal>` 渲染 `<FloatingPanel>`，仅当 `visible && layout` 时

3. **[packages/react/src/index.ts](../packages/react/src/index.ts)**
   ```ts
   export { AdaptiveHoverPanel } from './AdaptiveHoverPanel'
   export { useAdaptiveHoverPanel } from './useAdaptiveHoverPanel'
   export type * from './types'
   ```

## 默认值（必须与 T07 一致）

- `delay = 400`、`closeDelay = 150`
- `offset = 8`、`margin = 12`
- `minWidth = 240`、`minHeight = 160`

## 约束

- `disabled === true` 时不渲染 panel，trigger 不响应 hover
- 卸载组件时无 React act 警告（确认 T07 的清理逻辑生效）
- 不在本任务做样式（T09 处理），但要预留 className 接口

## 验收标准

```bash
pnpm --filter @adaptive-hover/react typecheck
```

集成测试在 T10。先做 smoke test：
- 在 playground（T11 之后）能看到面板按象限切换方向
- 本任务可临时新建 `packages/react/src/__demo__.tsx` 在浏览器开发模式手测，完成后删除

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T08 标记 `[x]` 并填日期
2. 在完成记录中说明 children 的注入方案（cloneElement / wrapper）
3. 删除任何临时 demo 文件

## 完成记录

<!-- 完成后在此追加 -->
