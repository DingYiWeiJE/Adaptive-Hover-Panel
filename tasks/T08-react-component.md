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

**完成日期**：2026-05-23

### Children 注入方案：cloneElement（带 fallback）

主路径用 `cloneElement` 注入 `triggerProps`，原因：
- 不引入额外 DOM 节点，保持 children 原本的 box 模型与 ref 转发链
- `display: contents` 包装会引入一层 React 元素，对 ref/事件层级仍是干扰，且部分浏览器对 contents 的 a11y 处理仍有问题

具体处理：
1. **`isValidElement` 守卫**：children 为字符串、数字、null、数组等非合法 element 时，cloneElement 会失效，此时降级为 `<span style={{ display: 'contents' }}>` 包一层。
2. **事件链合并**：`onMouseEnter` / `onMouseLeave` / `onMouseMove` 用 `chain(childHandler, hookHandler)` 组合，先调用用户已有处理器再调用 hook 的，避免覆盖用户 `<Button onMouseEnter>` 里的业务逻辑。
3. **className 合并**：用户传给 `<AdaptiveHoverPanel className>` 的会与 children 自身 className 拼接。
4. **已知边界**：若 children 是不转发事件 props 到真实 DOM 节点的函数组件，cloneElement 注入会失效——第一阶段接受这一限制（文档已说明）。

### FloatingPanel 样式策略

- `position: fixed` + `left/top/width/height` 全部走 inline style，防止用户 className 的 css 覆盖导致定位失效。
- 视觉样式（背景、圆角、阴影）留给 T09 通过 `.ahp-panel` 类提供。
- 用户传入 `className` 时与默认 `ahp-panel` 类合并。

### 条件渲染

`!disabled && visible && layout` 三重判断：
- `disabled` 为冗余防御（hook 内部 disabled 变化已 `FORCE_CLOSE`，此处再拦一道防止极端时序下闪烁）
- `visible` 覆盖 `OPEN` 与 `PENDING_CLOSE` 两态
- `layout` 在首次有 mouse + viewport 数据后才计算出值，首帧仍可能为 null

### 注入到 FloatingPanel 的 panelProps

hook 返回的 `panelProps` 包含 `style`（含 layout），但本组件让 FloatingPanel 自己根据 `layout` prop 构造 inline style。spread `...panelProps` 时其 `style` 会被 FloatingPanel 内部的 `mergedStyle` 覆盖（`position/left/top/width/height` 显式写在最后），实际生效的事件处理器仍来自 panelProps。

### 验收

```
> @adaptive-hover/react@0.0.0 typecheck
> tsc --noEmit
```

无输出，typecheck 通过。

未创建临时 demo 文件；smoke test 留待 T11 playground。
