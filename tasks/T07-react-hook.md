# T07 — React：状态机 + useAdaptiveHoverPanel Hook

## 目标

实现核心 Hook `useAdaptiveHoverPanel`，包含状态机、定时器管理、鼠标事件、布局计算。

## 前置依赖

T03、T04（用于 layout 计算）、T06（Portal 已就绪）。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 7.2 节（状态机）、7.3 节（Hook）、第 10 节（性能优化）

## 交付物

1. **[packages/react/src/types.ts](../packages/react/src/types.ts)**
   - `UseAdaptiveHoverPanelOptions`：含 `delay`、`closeDelay`、`offset`、`margin`、`minWidth/Height`、`maxWidth/Height`、`disabled`
   - `UseAdaptiveHoverPanelReturn`：见下方签名
   - `PanelState = 'IDLE' | 'PENDING_OPEN' | 'OPEN' | 'PENDING_CLOSE'`

2. **[packages/react/src/useAdaptiveHoverPanel.ts](../packages/react/src/useAdaptiveHoverPanel.ts)**

   函数签名：
   ```ts
   export function useAdaptiveHoverPanel(
     options?: UseAdaptiveHoverPanelOptions
   ): UseAdaptiveHoverPanelReturn

   interface UseAdaptiveHoverPanelReturn {
     visible: boolean
     layout: LayoutResult | null
     triggerProps: HTMLAttributes<HTMLElement>
     panelProps: HTMLAttributes<HTMLElement>
     open: () => void
     close: () => void
   }
   ```

## 状态机（严格按文档 7.2）

| 当前态           | 事件                | 下一态          | 动作                      |
| ---------------- | ------------------- | --------------- | ------------------------- |
| `IDLE`           | trigger enter       | `PENDING_OPEN`  | 启动 openTimer（delay）   |
| `PENDING_OPEN`   | trigger leave       | `IDLE`          | 取消 openTimer            |
| `PENDING_OPEN`   | openTimer 到期      | `OPEN`          | 计算 layout、显示         |
| `OPEN`           | trigger/panel leave | `PENDING_CLOSE` | 启动 closeTimer           |
| `PENDING_CLOSE`  | trigger/panel enter | `OPEN`          | 取消 closeTimer           |
| `PENDING_CLOSE`  | closeTimer 到期     | `IDLE`          | 隐藏，清空 layout         |

实现建议：用 `useReducer` 或显式 `useState<PanelState>`。

## 实现要点

1. **定时器**：用 `useRef<ReturnType<typeof setTimeout> | null>(null)` 存，绝不存 state
2. **mousemove 节流**：用 `requestAnimationFrame` 包裹 setState
3. **layout 计算**：用 `useMemo`，依赖 `[mouseX, mouseY, viewportWidth, viewportHeight, options...]`
4. **resize 监听**：去抖 150ms
5. **卸载清理**：`useEffect` 返回函数清掉所有定时器、`removeEventListener`

## triggerProps / panelProps 应包含

```ts
triggerProps = {
  onMouseEnter: ...,
  onMouseLeave: ...,
  onMouseMove: ...,  // 用于持续更新 mouseX/Y
}

panelProps = {
  onMouseEnter: ...,  // PENDING_CLOSE → OPEN
  onMouseLeave: ...,  // OPEN → PENDING_CLOSE
  style: layout ? { position: 'fixed', left, top, width, height } : undefined,
}
```

## 默认值

- `delay = 400`
- `closeDelay = 150`
- `offset = 8`、`margin = 12`
- `minWidth = 240`、`minHeight = 160`
- `disabled = false`

## 约束

- `disabled === true` 时所有事件直接 return，不进入状态机
- `open()` / `close()` 需立即生效，不走 delay
- mousemove 不应触发 re-render 风暴（用 rAF 节流验证）

## 验收标准

```bash
pnpm --filter @adaptive-hover/react typecheck
```

通过即可。运行时行为由 T10 的集成测试验证。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T07 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加偏离决定

## 完成记录

<!-- 完成后在此追加 -->
