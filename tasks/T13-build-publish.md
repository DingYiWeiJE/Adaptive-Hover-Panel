# T13 — 构建发布配置

## 目标

配置 tsup 构建、changesets 版本管理、CI、README，让两个 package 可发布到 npm。

## 前置依赖

T08、T09、T10 已完成（功能闭环）。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 12 节、第 13 节

## 交付物

### 1. tsup 配置

**[packages/core/tsup.config.ts](../packages/core/tsup.config.ts)**
```ts
import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
})
```

**[packages/react/tsup.config.ts](../packages/react/tsup.config.ts)**
```ts
import { defineConfig } from 'tsup'
export default defineConfig({
  entry: ['src/index.ts'],
  format: ['esm', 'cjs'],
  dts: true,
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  loader: { '.css': 'copy' },
})
```

### 2. package.json 完善

**`packages/core/package.json`**
```json
{
  "name": "@adaptive-hover/core",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    }
  },
  "files": ["dist"],
  "sideEffects": false,
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

**`packages/react/package.json`**（关键字段）
```json
{
  "name": "@adaptive-hover/react",
  "version": "0.0.0",
  "type": "module",
  "main": "./dist/index.cjs",
  "module": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js",
      "require": "./dist/index.cjs"
    },
    "./styles.css": "./dist/styles.css"
  },
  "files": ["dist"],
  "sideEffects": ["**/*.css"],
  "peerDependencies": {
    "react": ">=18",
    "react-dom": ">=18"
  },
  "dependencies": {
    "@adaptive-hover/core": "workspace:*"
  },
  "scripts": {
    "build": "tsup",
    "typecheck": "tsc --noEmit",
    "test": "vitest run"
  }
}
```

### 3. Changesets

```bash
pnpm add -Dw @changesets/cli
pnpm changeset init
```

- 修改 `.changeset/config.json`：`access: "public"`、`baseBranch: "main"`

### 4. 根 README.md

按文档第 13 节顺序：
1. GIF 演示占位（`![demo](docs/demo.gif)` — 注明"占位，待补"）
2. 一句话介绍 + Badge（npm version、bundle size、license）
3. 安装：`pnpm add @adaptive-hover/react`
4. **10 秒上手**示例（完整可运行代码）
5. Props 表（从开发文档第 8.2 节复制）
6. 浏览器兼容性（Chrome/Edge ≥ 76、Firefox ≥ 103、Safari ≥ 14）
7. License: MIT

### 5. CI（GitHub Actions）

**`.github/workflows/ci.yml`**
- 触发：PR、push to main
- 步骤：checkout → setup pnpm → setup node 20 → `pnpm install --frozen-lockfile` → `pnpm typecheck` → `pnpm lint` → `pnpm -r test` → `pnpm -r build`

### 6. LICENSE

- MIT，作者写 Evay（git config 显示的用户名）或留空让用户填

## 验收标准

```bash
pnpm -r build
ls packages/core/dist
ls packages/react/dist
```

期望：
- `packages/core/dist/` 含 `index.js`、`index.cjs`、`index.d.ts`、sourcemap
- `packages/react/dist/` 含上述 + `styles.css`

```bash
pnpm pack --filter @adaptive-hover/react
```

期望生成 `.tgz`，解压检查：
- `package.json` 的 `exports` 字段正确
- `dist/` 包含所有产物
- 不包含 `src/`、`test/`

```bash
cd /tmp && mkdir -p ahp-test && cd ahp-test
pnpm init
pnpm add /path/to/adaptive-hover-react-x.x.x.tgz react react-dom
node --input-type=module -e "import * as m from '@adaptive-hover/react'; console.log(Object.keys(m))"
```

期望输出 `[ 'AdaptiveHoverPanel', 'useAdaptiveHoverPanel' ]`。

```bash
pnpm publish --dry-run --filter @adaptive-hover/core
pnpm publish --dry-run --filter @adaptive-hover/react
```

期望都通过。

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T13 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加：构建产物列表、tarball 大小、`publish --dry-run` 摘要
3. **不要实际执行 `pnpm publish`**（除非用户明确授权）

## 完成记录

**完成日期**：2026-05-23

### 关键改动

- `packages/core/package.json`：移除 `private`，`exports` 指向 `dist/`，新增 `files`、`tsup` 脚本、`tsup` 配置
- `packages/react/package.json`：移除 `private`，`exports` 增加 `./styles.css` 子路径，新增 `files`、`tsup` 脚本、`tsup` 配置
- 新增 `tsup` 作为两个包的 devDependency；`build` 脚本改为 `tsup`
- 根 `package.json`：补 `build`、`pack:dry`、`release` 等脚本；新增 `@changesets/cli`
- 新增 `.changeset/config.json`（changesets 默认配置）
- 新增 `.github/workflows/ci.yml`（pnpm + Node 20 矩阵：install / typecheck / lint / test / build）
- 新增根 `README.md`（按文档第 13 节，含安装、用法、API、暗色模式、四象限、贡献）
- 新增 `LICENSE`（MIT，© 2026 Evay）

### 构建产物

`packages/core/dist`：
- `index.js` 1.4 KB / `index.cjs` 2.6 KB
- `index.d.ts` / `index.d.cts` 各 1.1 KB
- 配套 `.map`

`packages/react/dist`：
- `index.js` 8.6 KB / `index.cjs` 10.2 KB
- `index.d.ts` / `index.d.cts` 各 1.8 KB
- `styles.css` 671 B
- 配套 `.map`

### 验收

```text
pnpm typecheck   → core / react / playground 全部 Done
pnpm -r test     → core 21 passed, react 8 passed (合计 29)
pnpm build       → tsup core + tsup react 全部成功
pnpm pack:dry    → 仅打包 dist/ + package.json + README + LICENSE，无 src/test
pnpm publish --dry-run --filter @adaptive-hover/core   → OK
pnpm publish --dry-run --filter @adaptive-hover/react  → OK
```

未实际执行 `pnpm publish`（按任务要求只做 dry-run）。

