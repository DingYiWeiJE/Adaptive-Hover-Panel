# T09 — React：样式系统

## 目标

实现默认毛玻璃样式，含暗色模式和不支持 `backdrop-filter` 的降级。

## 前置依赖

T08 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 9 节

## 交付物

1. **[packages/react/src/styles.css](../packages/react/src/styles.css)**

   ```css
   .ahp-panel {
     position: fixed;
     border-radius: 12px;
     background: rgba(255, 255, 255, 0.25);
     backdrop-filter: blur(18px);
     -webkit-backdrop-filter: blur(18px);
     border: 1px solid rgba(255, 255, 255, 0.3);
     box-shadow: 0 10px 40px rgba(0, 0, 0, 0.15);
     overflow: hidden;
     box-sizing: border-box;
   }

   @media (prefers-color-scheme: dark) {
     .ahp-panel {
       background: rgba(20, 20, 20, 0.45);
       border-color: rgba(255, 255, 255, 0.08);
     }
   }

   @supports not (backdrop-filter: blur(1px)) {
     .ahp-panel {
       background: rgba(255, 255, 255, 0.92);
     }
     @media (prefers-color-scheme: dark) {
       .ahp-panel {
         background: rgba(20, 20, 20, 0.95);
       }
     }
   }
   ```

2. **`packages/react/package.json` 配置 css 导出**
   ```json
   {
     "exports": {
       ".": {
         "types": "./src/index.ts",
         "import": "./src/index.ts"
       },
       "./styles.css": "./src/styles.css"
     },
     "sideEffects": ["**/*.css"]
   }
   ```
   注：`exports."."` 暂时指向 src，T13 改为 dist。

3. **README 临时备注**（可在根 README.md 草稿中先记一笔，T13 整理）
   ```
   使用方需手动引入样式：
   import '@adaptive-hover/react/styles.css'
   ```

## 约束

- 不引入 CSS-in-JS（保持零运行时样式，让用户可覆盖）
- 不使用 CSS Modules（保持类名稳定，便于用户定制）
- 类名前缀统一 `ahp-`（避免冲突）

## 验收标准

1. 在 playground 或临时 demo 中引入 `'@adaptive-hover/react/styles.css'`
2. 浏览器 DevTools 验证：
   - 默认浅色模式：面板半透明白色 + 模糊
   - 切换系统暗色模式：面板半透明深色
   - 在 DevTools 的 Rendering 面板中模拟「禁用 backdrop-filter」（或换 Firefox 旧版本）：背景应回退为不透明色

把验证截图或步骤记录贴到完成记录。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T09 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加验证结果

## 完成记录

<!-- 完成后在此追加 -->
