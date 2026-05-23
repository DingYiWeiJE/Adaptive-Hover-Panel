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
