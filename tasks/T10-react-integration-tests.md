# T10 — React：集成测试

## 目标

为 `AdaptiveHoverPanel` 编写集成测试，覆盖 hover 时序、Portal 行为、卸载清理。

## 前置依赖

T08 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 11.2 节

## 交付物

1. **`packages/react/vitest.config.ts`**
   ```ts
   import { defineConfig } from 'vitest/config'
   export default defineConfig({
     test: {
       environment: 'jsdom',
       globals: true,
       setupFiles: ['./vitest.setup.ts'],
     },
   })
   ```

2. **`packages/react/vitest.setup.ts`**
   ```ts
   import '@testing-library/jest-dom/vitest'
   ```

3. **`packages/react/package.json` 加脚本和 devDeps**
   - 脚本：`"test": "vitest run"`、`"test:watch": "vitest"`
   - devDeps：`vitest`、`jsdom`、`@testing-library/react`、`@testing-library/user-event`、`@testing-library/jest-dom`

4. **[packages/react/src/AdaptiveHoverPanel.test.tsx](../packages/react/src/AdaptiveHoverPanel.test.tsx)**

## 测试用例（每个一个 `it`）

1. **delay 控制打开**
   - 渲染组件，hover trigger
   - `delay` 时间未到：panel 不在 DOM 中
   - `delay` 时间到：panel 出现

2. **closeDelay 控制关闭**
   - 打开后 mouseleave trigger
   - `closeDelay` 时间未到：panel 仍在
   - `closeDelay` 时间到：panel 消失

3. **trigger → panel 平滑过渡**
   - 打开后 mouseleave trigger，立即 mouseenter panel
   - 等待超过 `closeDelay`：panel 仍在（验证 `PENDING_CLOSE` → `OPEN` 转换）

4. **panel mouseleave 关闭**
   - 在 panel 内 mouseleave，等待 `closeDelay`：关闭

5. **disabled 阻断**
   - `disabled={true}`，hover trigger，等待 `delay * 2`：panel 不出现

6. **Portal 挂载位置**
   - 渲染后查询 panel 出现在 `document.body` 直属子节点（不在组件容器内）

7. **卸载清理**
   - hover trigger 进入 `PENDING_OPEN`（未到 delay）
   - unmount 组件
   - 等待 `delay * 2`：不应有 act 警告或定时器回调被触发（用 spy 验证）

8. **`disabled` 动态切换**
   - 初始 `disabled={false}`，hover 后 panel 显示
   - 切换为 `disabled={true}`：panel 立即消失

## 测试技巧

- 用 `vi.useFakeTimers()` 控制时间
- 鼠标事件用 `@testing-library/user-event` 的 `userEvent.setup({ advanceTimers: vi.advanceTimersByTime })`
- 不要用真实 setTimeout（测试不稳定）

## 验收标准

```bash
pnpm --filter @adaptive-hover/react test
```

期望：
- 所有用例通过
- 无 act 警告
- 无定时器泄漏（控制台无 unhandled timer 报错）

把测试结果摘要贴到完成记录。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T10 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加测试输出

## 完成记录

<!-- 完成后在此追加 -->

### 2026-05-23

**交付物**

- `packages/react/vitest.config.ts`（jsdom + globals + setup）
- `packages/react/vitest.setup.ts`（引入 jest-dom 匹配器）
- `packages/react/package.json` 加 `test`/`test:watch` 脚本与 devDeps（`vitest`、`jsdom`、`@testing-library/{react,user-event,jest-dom}`）
- `packages/react/src/AdaptiveHoverPanel.test.tsx`（8 个 `it` 用例）
- `packages/react/tsconfig.json` 补充 `types: ["vitest/globals", "@testing-library/jest-dom/vitest"]` 让 tsc 能识别 `toBeInTheDocument` 增强类型

**实现要点**

- 用 `vi.useFakeTimers({ toFake: ['setTimeout','clearTimeout','requestAnimationFrame','cancelAnimationFrame'] })`，确保 `useAdaptiveHoverPanel` 内 rAF 节流的 `mousemove` 也被假掉，否则 layout 永远 null
- `beforeEach` 启用 fake timers，`afterEach` 调 `vi.clearAllTimers()` + `vi.useRealTimers()` 防用例间污染
- 由于 `userEvent.hover` 在 fake timers + React 19 + jsdom 组合下会卡住（即使传 `advanceTimers`），改用 `fireEvent.mouseEnter/mouseLeave/mouseMove` + `act(() => vi.advanceTimersByTime(...))`，更可控
- 计算 layout 需要 `mousemove` 事件提供 `clientX/clientY`；每个用例 hover 后都补一次 `mouseMove`
- `closeDelay` 边界断言用 `advance(closeDelay - 1)` + `inDocument` → `advance(1)` + `not inDocument`，分两次推进更精确
- Portal 断言：`panelContent.parentElement.parentElement === document.body`（`role="tooltip"` 的 div 在 `FloatingPanel` 包裹内，`FloatingPanel` 才是 body 直属子节点）
- 卸载清理：`vi.spyOn(globalThis, 'clearTimeout')`，比对 `unmount` 前后调用次数；同时跑 `advance(delay * 2)` 验证 panel 不再出现

**验收命令输出**

```text
$ pnpm --filter @adaptive-hover/react test --reporter=verbose

 RUN  v4.1.7 D:/学无止境/Adaptive-Hover-Panel/packages/react

 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > delay 控制打开 81ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > closeDelay 控制关闭 16ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > trigger → panel 平滑过渡不关闭 13ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > panel mouseleave 后 closeDelay 关闭 8ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > disabled=true 时 hover 不打开 5ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > Portal 挂载到 document.body 直属子节点 6ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > 卸载时清理定时器 4ms
 ✓ src/AdaptiveHoverPanel.test.tsx > AdaptiveHoverPanel > disabled 动态切换为 true 时立即关闭面板 7ms

 Test Files  1 passed (1)
      Tests  8 passed (8)
   Duration  2.09s
```

无 act 警告，无定时器泄漏。

```text
$ pnpm --filter @adaptive-hover/react typecheck
> tsc --noEmit
（无输出，typecheck 通过）
```
