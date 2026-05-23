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

### 2026-05-23

**交付物落地**

- `packages/react/src/styles.css`：按文档第 9 节样例 + 任务样例落地。
  - 基础规则：`position: fixed` + 圆角 12px + 半透明白底 (alpha 0.25) + `backdrop-filter: blur(18px)`（含 `-webkit-` 前缀）+ 边框 + 阴影 + `overflow: hidden` + `box-sizing: border-box`。
  - `@media (prefers-color-scheme: dark)`：背景切换为半透明深色 `rgba(20,20,20,0.45)`，边框降透明度。
  - `@supports not (backdrop-filter: blur(1px))`：兜底背景提到 alpha 0.92（亮）/ 0.95（暗）；`@supports` 内嵌 `@media`，与文档第 9.2 节 / 任务模板的层级一致（`@supports` 在外、`@media` 在内）。
- `packages/react/package.json`：
  - 新增 `exports`：`"."` 暂指向 `./src/index.ts`（T13 改为 dist），`"./styles.css"` 指向 `./src/styles.css`（源码阶段必须指向 src，否则 playground 引入会找不到）。
  - 新增 `sideEffects: ["**/*.css"]`，避免打包工具把 css import 当无副作用 tree-shake 掉。
- `README.md`：追加临时备注，提示使用方手动 `import '@adaptive-hover/react/styles.css'`（T13 整理）。

**约束自检**

- 未引入任何 CSS-in-JS 运行时；纯静态 CSS 文件。
- 未使用 CSS Modules；类名直接为 `.ahp-panel`，便于用户覆盖。
- 类名前缀统一 `ahp-`。

**typecheck 输出（pnpm -r typecheck）**

```
Scope: 3 of 4 workspace projects
playground typecheck$ tsc --noEmit
packages/core typecheck$ tsc --noEmit
playground typecheck: Done
packages/core typecheck: Done
packages/react typecheck$ tsc --noEmit
packages/react typecheck: Done
```

**手测验证（待 T11 playground 搭好后由用户在浏览器执行）**

T11 尚未完成，playground 目前只有空的 `src/index.ts` 占位，无法在本任务内启动 Vite + 真实 DOM 验证三种状态。本任务仅交付样式文件与 package 配置，建议在 T11 完成后按以下步骤补一次手测并把截图回填到这里：

1. 在 playground 入口 `import '@adaptive-hover/react/styles.css'`，渲染一个 `.ahp-panel`。
2. 默认浅色：DevTools 看 Computed，`background-color` 应为 `rgba(255,255,255,0.25)`，`backdrop-filter` 为 `blur(18px)`。
3. 切系统暗色（或 DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme: dark"）：`background-color` 应变为 `rgba(20,20,20,0.45)`。
4. 验证降级：DevTools → 三个点菜单 → More tools → Rendering → 找到 "Emulate CSS media feature" 区下方的 "Disable CSS property"，添加 `backdrop-filter: none`（或在 Sources 里临时改 UA stylesheet）；亦可直接用一个不支持 `backdrop-filter` 的环境（旧 Firefox / 关闭硬件加速的 Edge 兜底通道）。此时浅色应回退到 `rgba(255,255,255,0.92)`，暗色应回退到 `rgba(20,20,20,0.95)`。

> 备注：T11 完成后请把三张截图（浅色 / 暗色 / 降级）粘到本节末尾完成存证。
