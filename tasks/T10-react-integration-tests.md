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
