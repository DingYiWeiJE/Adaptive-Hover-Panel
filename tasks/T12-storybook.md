# T12 — Storybook 场景

## 目标

接入 Storybook，编写可发布的组件示例。

## 前置依赖

T11 已完成（playground 验证组件可用）。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 14 节

## 交付物

1. **在 `packages/react` 接入 Storybook 8 + Vite builder**
   - 跑 `pnpm --filter @adaptive-hover/react dlx storybook@latest init --type react`
   - 选 Vite builder
   - 完成后整理 `.storybook/main.ts`、`.storybook/preview.ts`

2. **`.storybook/preview.ts`**
   - 导入 `'../src/styles.css'`
   - 配置 `parameters.layout: 'centered'`（基础场景） 或 `'fullscreen'`（自适应场景）

3. **Stories 文件**（在 `packages/react/src/stories/` 下）

   - `Basic.stories.tsx`：单按钮 + 简单文字 panel
   - `LargeContent.stories.tsx`：富文本卡片（标题 + 多段落 + 列表）
   - `ImagePreview.stories.tsx`：缩略图 hover 显示大图
   - `TablePreview.stories.tsx`：表格行 hover 显示详情
   - `EdgeCases.stories.tsx`：四角的 trigger，验证方向自适应
   - `DarkMode.stories.tsx`：暗色背景容器，用 controls 切换 `prefers-color-scheme`

4. **根 `package.json` 脚本**
   ```json
   "storybook": "pnpm --filter @adaptive-hover/react storybook",
   "storybook:build": "pnpm --filter @adaptive-hover/react build-storybook"
   ```

## 约束

- 不要在 Storybook 中绕过组件 API（用 props 不要改源码）
- DarkMode story 用 css 容器或 `data-theme` 属性切换，不要 hack 样式
- 不在 Storybook 项目里重新实现示例代码，从 `playground/src/App.tsx` 抽离共享 demo 组件到 `packages/react/src/stories/_shared/`（可选）

## 验收标准

```bash
pnpm storybook
pnpm storybook:build
```

期望：
- 6 个 story 全部能正常渲染
- `storybook:build` 产出 `storybook-static/` 目录无报错
- DarkMode 切换响应正确

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T12 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加 story 列表和构建产物路径

## 完成记录

<!-- 完成后在此追加 -->
