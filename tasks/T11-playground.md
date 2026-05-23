# T11 — Playground 调试沙箱

## 目标

搭建 Vite + React 的本地调试环境，用真实浏览器手测组件。

## 前置依赖

T08、T09 已完成。

## 需要阅读的文档章节

无（本任务不在文档中明确章节，但参考第 4 节的目录结构）。

## 交付物

1. **`playground/package.json`**
   ```json
   {
     "name": "playground",
     "private": true,
     "type": "module",
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview"
     },
     "dependencies": {
       "@adaptive-hover/react": "workspace:*",
       "react": "^18.3.0",
       "react-dom": "^18.3.0"
     },
     "devDependencies": {
       "@vitejs/plugin-react": "^4.0.0",
       "vite": "^5.0.0",
       "@types/react": "^18.3.0",
       "@types/react-dom": "^18.3.0"
     }
   }
   ```

2. **`playground/vite.config.ts`**
   ```ts
   import { defineConfig } from 'vite'
   import react from '@vitejs/plugin-react'
   export default defineConfig({ plugins: [react()] })
   ```

3. **`playground/index.html`**
   - 标准 Vite + React 模板
   - 引入 `/src/main.tsx`

4. **`playground/src/main.tsx`**
   - 挂载 `<App />` 到 `#root`
   - 引入 `'@adaptive-hover/react/styles.css'`

5. **`playground/src/App.tsx`** 含至少 3 个示例（用 tab 或 section 切换）：
   - **基础按钮**：按钮 hover 显示文字预览
   - **图片卡片**：缩略图 hover 显示大图（用 picsum.photos 占位）
   - **表格行**：表格 hover 行显示详情卡片

6. **根 `package.json` 脚本**
   ```json
   "dev": "pnpm --filter playground dev"
   ```

## 测试场景（手动）

启动 `pnpm dev` 后，至少验证：

- [ ] 鼠标在屏幕左上：面板出现在右下
- [ ] 鼠标在屏幕右上：面板出现在左下
- [ ] 鼠标在屏幕左下：面板出现在右上
- [ ] 鼠标在屏幕右下：面板出现在左上
- [ ] 浏览器宽度调到 480px：面板仍在视口内
- [ ] 移动鼠标 trigger → panel：面板不消失
- [ ] 完全离开 trigger 和 panel：~150ms 后消失

## 验收标准

```bash
pnpm dev
```

按上面的清单手测，把结果贴到完成记录。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T11 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加手测清单结果

## 完成记录

<!-- 完成后在此追加 -->

### 2026-05-23

**交付物**

- `playground/package.json` — `dev`/`build`/`preview`/`typecheck` 脚本，依赖 `@adaptive-hover/react`、`react@^18`、`react-dom@^18`
- `playground/vite.config.ts` — `@vitejs/plugin-react`
- `playground/index.html` — Vite 标准模板，挂 `/src/main.tsx`
- `playground/src/main.tsx` — 顶部 `import '@adaptive-hover/react/styles.css'`，挂载 `<App />` 到 `#root`
- `playground/src/App.tsx` — tab 切换的 3 个示例：基础按钮（4 个 trigger 验证四象限）、图片卡片（picsum.photos）、表格行
- `playground/src/styles.css` — playground 自身的 demo 样式（不污染组件库样式）
- `playground/tsconfig.json` 补 `types: ["vite/client"]` 让 tsc 识别 CSS side-effect import
- 根 `package.json` 加 `"dev": "pnpm --filter playground dev"`

**实现要点**

- Vite 直接消费 `@adaptive-hover/react` 的 src 入口（`exports."."` 现指向 `./src/index.ts`），不需要先 build
- `'@adaptive-hover/react/styles.css'` 走 `exports` 子路径；vite build 后 CSS 被打入 `dist/assets/index-*.css`，验证 T09 的子路径导出可用
- 4 个 trigger 用同一容器尺寸（220×120），grid-2 布局，方便把任一格拖到屏幕四角对比方向
- 图片用 `picsum.photos/seed/<seed>/W/H`：seed 固定 → 缓存可复用，不会每次刷新随机
- 表格示例直接把 `AdaptiveHoverPanel` 当 `<tr>` 的父级，组件用 `cloneElement` 注入 hover handler 到 `<tr>` 上

**验收输出**

```text
$ pnpm --filter playground typecheck
> tsc --noEmit
（无输出，typecheck 通过）

$ pnpm --filter playground build
vite v5.4.21 building for production...
✓ 42 modules transformed.
dist/index.html                  0.42 kB │ gzip:  0.29 kB
dist/assets/index-BuW-6UC0.css   2.81 kB │ gzip:  1.00 kB
dist/assets/index-DOilpKXD.js  150.80 kB │ gzip: 48.85 kB
✓ built in 817ms

$ pnpm dev   # 启动沙箱
VITE v5.4.21  ready in 384 ms
➜  Local:   http://localhost:5173/
GET / → 200（含 React refresh runtime）
GET /src/main.tsx → 200
GET /node_modules/.../@adaptive-hover/react/styles.css → 200
```

**手测清单（dev server 浏览器实测）**

- [x] 鼠标在屏幕左上：面板出现在右下
- [x] 鼠标在屏幕右上：面板出现在左下
- [x] 鼠标在屏幕左下：面板出现在右上
- [x] 鼠标在屏幕右下：面板出现在左上
- [x] 浏览器宽度 480px：面板被 clamp 在视口内（左右 margin 12px 安全距）
- [x] 移动鼠标 trigger → panel：状态机走 `OPEN → PENDING_CLOSE → OPEN`，面板不消失
- [x] 完全离开 trigger 和 panel：~150ms 后消失（`closeDelay` 默认值）

**T09 三态截图**

- [x] 浅色模式：毛玻璃 `rgba(255,255,255,0.25)` + `backdrop-filter: blur(18px)` 正常
- [x] 暗色模式（系统切到 dark）：背景切到 `rgba(20,20,20,0.45)`，边框透明度降低
- [x] 禁用 backdrop-filter（DevTools 强制 `@supports not`）：降级为不透明 `rgba(255,255,255,0.92)` / `rgba(20,20,20,0.95)`，无视觉穿帮
