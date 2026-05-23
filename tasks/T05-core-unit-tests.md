# T05 — Core：单元测试

## 目标

为 `calculateLayout` 和 `clamp` 编写完整的单元测试，覆盖所有边界情况。

## 前置依赖

T04 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 11.1 节

## 交付物

1. **`packages/core/vitest.config.ts`**
   ```ts
   import { defineConfig } from 'vitest/config'
   export default defineConfig({
     test: {
       environment: 'node',
       coverage: { provider: 'v8', reporter: ['text', 'html'] },
     },
   })
   ```

2. **`packages/core/package.json` 加脚本**
   ```json
   "test": "vitest run",
   "test:watch": "vitest",
   "test:coverage": "vitest run --coverage"
   ```

3. **`packages/core/package.json` devDependencies**
   - `vitest`
   - `@vitest/coverage-v8`

4. **[packages/core/src/clamp.test.ts](../packages/core/src/clamp.test.ts)**
   覆盖：
   - 值在范围内：原样返回
   - 值小于 min：返回 min
   - 值大于 max：返回 max
   - 边界值：等于 min、等于 max
   - min === max：返回 min
   - 负数范围

5. **[packages/core/src/calculateLayout.test.ts](../packages/core/src/calculateLayout.test.ts)**
   必须覆盖以下场景（每个一个 `it`）：

   **方向判定（4 个）**
   - 鼠标在左上 → `horizontal: 'right'`, `vertical: 'bottom'`
   - 鼠标在右上 → `horizontal: 'left'`, `vertical: 'bottom'`
   - 鼠标在左下 → `horizontal: 'right'`, `vertical: 'top'`
   - 鼠标在右下 → `horizontal: 'left'`, `vertical: 'top'`

   **中线（3 个）**
   - 水平中线（`mouseX === viewportWidth / 2`）：根据 `>` 实现走 `'right'`
   - 垂直中线（`mouseY === viewportHeight / 2`）：走 `'bottom'`
   - 正中心：`'right' + 'bottom'`

   **尺寸 clamp（3 个）**
   - `rawWidth < minWidth`（鼠标紧贴边缘）：返回 `minWidth`
   - `rawWidth > maxWidth`：返回 `maxWidth`
   - 自定义 `min/max` 生效

   **位置兜底（2 个）**
   - 极小视口（320×240）下 `left >= margin`、`top >= margin`
   - 鼠标接近左/上边缘时 `left/top` 不为负

   **参数（2 个）**
   - 自定义 `offset` 影响 `left/top` 和宽高
   - 自定义 `margin` 影响 `left/top` 和宽高

## 验收标准

```bash
pnpm --filter @adaptive-hover/core test
pnpm --filter @adaptive-hover/core test:coverage
```

期望：
- 所有测试通过
- `calculateLayout.ts` 和 `clamp.ts` 覆盖率 ≥ 90%（line + branch）

把覆盖率摘要贴到完成记录里。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T05 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加覆盖率数字和任何偏离决定

## 完成记录

### 2026-05-23

- 测试文件：`packages/core/src/clamp.test.ts`（7 个）+ `packages/core/src/calculateLayout.test.ts`（14 个）= **21 个测试全部通过**
- 覆盖率（v8，`pnpm --filter @adaptive-hover/core test:coverage`）：
  - Statements: 100% (16/16)
  - Branches:   100% (18/18)
  - Functions:  100% (2/2)
  - Lines:      100% (16/16)
- 偏离/备注：
  - 中线测试严格按 T04 实现的 `>`（非 `>=`）语义断言：`mouseX === viewportWidth/2` 走 `'right'` 分支、`mouseY === viewportHeight/2` 走 `'bottom'` 分支
  - 极小视口兜底用 `viewport: 320×240 + mouseX/Y: 200/130`，进入 `'left'/'top'` 分支后 raw 值远小于 min，验证 `Math.max(margin, …)` 兜底将 `left/top` 钳到 `margin = 12`
  - vitest 选用最新稳定版 `^4.1.7`（`vitest` + `@vitest/coverage-v8`），与文档要求一致
