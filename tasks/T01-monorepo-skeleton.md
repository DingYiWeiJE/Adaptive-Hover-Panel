# T01 — Monorepo 骨架

## 目标

搭建 pnpm workspace 项目骨架，建立后续所有任务的目录基础。

## 前置依赖

无（这是第一个任务）。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 4 节：Monorepo 结构

## 交付物

1. **根目录 `package.json`**
   - `private: true`
   - `packageManager` 字段固定 pnpm 版本
   - 脚本占位：`dev`、`build`、`test`、`lint`、`typecheck`、`format`（可先用 `pnpm -r run xxx` 转发）

2. **`pnpm-workspace.yaml`**
   ```yaml
   packages:
     - 'packages/*'
     - 'playground'
     - 'docs'
   ```

3. **目录结构**
   ```
   adaptive-hover-panel/
   ├── packages/
   │   ├── core/
   │   │   ├── src/
   │   │   └── package.json
   │   └── react/
   │       ├── src/
   │       └── package.json
   ├── playground/
   │   └── package.json
   ├── docs/
   │   └── .gitkeep
   ├── package.json
   ├── pnpm-workspace.yaml
   └── .gitignore
   ```

4. **`packages/core/package.json`**
   - `name`: `@adaptive-hover/core`
   - `version`: `0.0.0`
   - `type`: `module`
   - `main` / `module` / `types` 字段先指向 `./src/index.ts`（后续 T13 改为 dist）

5. **`packages/react/package.json`**
   - `name`: `@adaptive-hover/react`
   - `version`: `0.0.0`
   - `type`: `module`
   - `dependencies`: `"@adaptive-hover/core": "workspace:*"`
   - `peerDependencies`: `react >=18`、`react-dom >=18`

6. **`playground/package.json`**
   - `name`: `playground`
   - `private: true`

7. **`.gitignore`**
   - `node_modules/`
   - `dist/`
   - `coverage/`
   - `.turbo/`
   - `*.log`
   - `.DS_Store`

## 验收标准

执行以下命令并贴出输出：

```bash
pnpm install
pnpm -r exec node -e "console.log(process.cwd())"
```

期望：
- `pnpm install` 无报错
- 列出的工作目录包含 `packages/core`、`packages/react`、`playground`
- `packages/react` 能识别到 `@adaptive-hover/core` 的 workspace 引用（查 `pnpm why @adaptive-hover/core --filter @adaptive-hover/react`）

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：把 T01 的 `[ ]` 改为 `[x]` 并填入今天日期
2. 在本文件末尾追加"完成记录"段落，记录任何偏离交付物清单的决定

## 完成记录

- 2026-05-23 完成。
- 偏离说明：
  - 根 `package.json` 的 `packageManager` 字段固定为当前环境的 `pnpm@10.10.0`（非任务文件硬性要求的版本，按"固定 pnpm 版本"原则取当前实测值）。
  - `packages/core`、`packages/react`、`playground` 的 `package.json` 都加了 `private: true`（除 playground 外属交付物未明确要求；考虑到当前阶段不发布且 `main/module/types` 暂指向 `src/*.ts`，加 private 防止误发布，T13 构建发布配置阶段再调整）。
  - 在 `packages/core/src/`、`packages/react/src/` 下放了空 `.gitkeep`，确保空 `src/` 目录纳入版本控制（交付物只要求目录存在，未限制实现方式）。
