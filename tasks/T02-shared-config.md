# T02 — 公共配置（tsconfig / lint / format）

## 目标

建立统一的 TypeScript、ESLint、Prettier 配置，让所有 package 共享。

## 前置依赖

T01 已完成。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 3 节：技术栈

## 交付物

1. **`tsconfig.base.json`**（根目录）
   - `strict: true`
   - `target: "ES2020"`
   - `module: "ESNext"`
   - `moduleResolution: "bundler"`
   - `jsx: "react-jsx"`
   - `esModuleInterop: true`
   - `skipLibCheck: true`
   - `noUncheckedIndexedAccess: true`
   - `declaration: true`、`declarationMap: true`

2. **各 package 的 `tsconfig.json`**
   - `packages/core/tsconfig.json`：extends base，`include: ["src"]`
   - `packages/react/tsconfig.json`：extends base，`include: ["src"]`，加 `lib: ["ES2020", "DOM"]`
   - `playground/tsconfig.json`：extends base，`include: ["src"]`

3. **ESLint 扁平配置 `eslint.config.js`**（根目录）
   - 使用 `@typescript-eslint`、`eslint-plugin-react-hooks`、`eslint-plugin-react`
   - 启用 `react-hooks/rules-of-hooks` 和 `react-hooks/exhaustive-deps`
   - 忽略 `dist/`、`node_modules/`、`coverage/`

4. **Prettier 配置 `.prettierrc`**
   ```json
   {
     "semi": false,
     "singleQuote": true,
     "trailingComma": "all",
     "printWidth": 100
   }
   ```

5. **根 `package.json` 脚本**
   ```json
   {
     "scripts": {
       "typecheck": "pnpm -r typecheck",
       "lint": "eslint .",
       "format": "prettier --write .",
       "format:check": "prettier --check ."
     }
   }
   ```

6. **每个 package 的 `package.json` 加 `typecheck`**
   ```json
   "typecheck": "tsc --noEmit"
   ```

7. **`.vscode/settings.json`**（推荐配置）
   ```json
   {
     "editor.formatOnSave": true,
     "editor.defaultFormatter": "esbenp.prettier-vscode",
     "eslint.experimental.useFlatConfig": true
   }
   ```

## 验收标准

```bash
pnpm typecheck
pnpm lint
pnpm format:check
```

期望全部通过（空仓库情况下应无错误）。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T02 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加偏离决定

## 完成记录

<!-- 完成后在此追加 -->
