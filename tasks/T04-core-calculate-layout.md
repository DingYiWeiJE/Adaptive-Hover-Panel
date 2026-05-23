# T04 — Core：calculateLayout 算法

## 目标

实现核心布局算法 `calculateLayout`，根据鼠标位置计算面板方向、坐标和尺寸。

## 前置依赖

T03 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 6.4 节（含完整参考实现）

## 交付物

1. **[packages/core/src/calculateLayout.ts](../packages/core/src/calculateLayout.ts)**
   - 严格按开发文档第 6.4 节实现
   - 函数签名：`export function calculateLayout(opts: LayoutOptions): LayoutResult`

2. **在 [packages/core/src/index.ts](../packages/core/src/index.ts) 中导出**
   ```ts
   export * from './calculateLayout'
   ```

## 算法步骤（严格遵守）

1. **方向判定**
   - `horizontal = mouseX > viewportWidth / 2 ? 'left' : 'right'`
   - `vertical = mouseY > viewportHeight / 2 ? 'top' : 'bottom'`

2. **可用尺寸**
   - `horizontal === 'left'`: `rawWidth = mouseX - margin - offset`
   - `horizontal === 'right'`: `rawWidth = viewportWidth - mouseX - margin - offset`
   - `vertical === 'top'`: `rawHeight = mouseY - margin - offset`
   - `vertical === 'bottom'`: `rawHeight = viewportHeight - mouseY - margin - offset`

3. **clamp 限制**
   - `width = clamp(rawWidth, minWidth, maxWidth)`
   - `height = clamp(rawHeight, minHeight, maxHeight)`

4. **定位（含兜底）**
   - `left = horizontal === 'left' ? Math.max(margin, mouseX - offset - width) : mouseX + offset`
   - `top = vertical === 'top' ? Math.max(margin, mouseY - offset - height) : mouseY + offset`

5. **默认值**（用解构默认参数）
   - `offset = DEFAULT_OFFSET`、`margin = DEFAULT_MARGIN`
   - `minWidth = DEFAULT_MIN_WIDTH`、`minHeight = DEFAULT_MIN_HEIGHT`
   - `maxWidth = viewportWidth`、`maxHeight = viewportHeight`

## 约束

- **纯函数**：相同输入永远返回相同输出
- **不依赖** DOM、React、`window`、`document`
- 不得使用 `Math.random`、`Date.now` 等非确定性 API

## 验收标准

```bash
pnpm --filter @adaptive-hover/core typecheck
```

手动验算（写在临时脚本或 REPL 里，验证后删除）：
```ts
calculateLayout({
  mouseX: 100, mouseY: 100,
  viewportWidth: 1024, viewportHeight: 768,
})
// horizontal: 'right', vertical: 'bottom'
// left: 108, top: 108
// width <= 1024 - 100 - 12 - 8 = 904
// height <= 768 - 100 - 12 - 8 = 648
```

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T04 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加偏离决定

## 完成记录

<!-- 完成后在此追加 -->
