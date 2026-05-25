# 技术栈学习手册（仅自用）

> 这份文档面向你自己，不进 npm 包，也不发布。目标是把 AI 帮你装好的工具一个个解释清楚，让你下次开新项目时能不靠 AI 也搭出同样的工程化骨架。
>
> 阅读建议：从上往下读，每节先看「**它到底是什么**」和「**为什么要用**」，再看「**最小可用配置**」，最后做「**自检练习**」。每节配了项目里的真实例子。

---

## 目录

1. [总览：这套技术栈在解决什么问题](#1-总览这套技术栈在解决什么问题)
2. [pnpm 和 workspace](#2-pnpm-和-workspace)
3. [TypeScript 配置](#3-typescript-配置)
4. [ESLint 9](#4-eslint-9)
5. [Prettier](#5-prettier)
6. [Vitest](#6-vitest)
7. [Testing Library + jsdom](#7-testing-library--jsdom)
8. [tsup 打包](#8-tsup-打包)
9. [package.json 的 exports / main / types / sideEffects](#9-packagejson-的-exports--main--types--sideeffects)
10. [Storybook](#10-storybook)
11. [changesets](#11-changesets)
12. [GitHub Actions CI](#12-github-actions-ci)
13. [从 0 到 1 自己搭一个同款项目](#13-从-0-到-1-自己搭一个同款项目)
14. [遇到问题怎么自救](#14-遇到问题怎么自救)

---

## 1. 总览：这套技术栈在解决什么问题

一个开源 npm 库要交付给陌生人，单靠 React + Vite 不够。还要回答这些问题：

| 问题                                     | 解决方案             |
| ---------------------------------------- | -------------------- |
| 一个仓库怎么管多个互相依赖的包？         | pnpm workspace       |
| 怎么写出别人 import 后能拿到类型提示的库？ | TypeScript + tsup    |
| 怎么保证团队风格一致？                   | ESLint + Prettier    |
| 怎么证明代码没坏？                       | Vitest + RTL + jsdom |
| 怎么让用户在浏览器里把组件玩一遍？       | Storybook            |
| 怎么管版本号和 changelog？               | changesets           |
| 怎么保证每次提交都不破坏主分支？         | GitHub Actions       |

每节会单独讲一个工具，但记住它们是一个整体：删掉任何一个，质量都会塌一截。

---

## 2. pnpm 和 workspace

### 它到底是什么

pnpm 是 npm 的替代品，跟 npm/yarn 同类。三个核心差异：

1. **磁盘共享**：所有项目的 `node_modules` 是符号链接，指向全局缓存。装 100 个 React 项目只占一份 React 的空间。
2. **严格的依赖隔离**：你 `package.json` 没声明的依赖，代码里 import 不到。npm 默认能 import，会让你写出"幽灵依赖"。
3. **原生 workspace**：一个仓库管多个包，包之间能直接互相 import，不用 `npm link`。

### 为什么要用

本项目有 4 个 package：

```
packages/core           ← 算法包，要发布
packages/react          ← React 组件包，要发布，依赖 core
playground              ← Vite 沙箱，不发布
docs                    ← 文档资源
```

`packages/react` 的 `package.json` 里写：

```json
"dependencies": {
  "@adaptive-hover/core": "workspace:*"
}
```

`workspace:*` 是 pnpm 的语法，意思是"在本仓库找名字叫 `@adaptive-hover/core` 的 package，链过来用"。改 core 的代码，react 立刻看到，不需要 publish。

发布时 pnpm 会自动把 `workspace:*` 替换成实际版本号。

### 最小可用配置

仓库根创建两个文件：

`pnpm-workspace.yaml`：

```yaml
packages:
  - 'packages/*'
  - 'playground'
```

根 `package.json` 里加 `packageManager`，锁定 pnpm 版本：

```json
{
  "packageManager": "pnpm@10.10.0",
  "private": true
}
```

`private: true` 是防呆——根目录不发布，避免 `pnpm publish` 误推。

每个子包的 `package.json` 里写自己的 `name` 和 `version` 即可。

### 常用命令

```bash
pnpm install                                    # 装所有 workspace 的依赖
pnpm add lodash --filter @adaptive-hover/react  # 给指定子包装依赖
pnpm add -D vitest -w                           # 给根（workspace root）装 dev 依赖
pnpm --filter @adaptive-hover/core test         # 只在 core 跑 test
pnpm -r build                                   # 在所有子包递归跑 build
pnpm dev                                        # 跑根 package.json 里 scripts.dev
```

`-r` 表示 recursive，`--filter` 表示挑一个，`-w` 表示装到 workspace root。

### 自检练习

1. 不看本文档，写出"在 packages/react 里给项目装 zod"的命令。
2. 解释为什么根 `package.json` 一定要 `private: true`。
3. `workspace:*` 在 publish 后会变成什么？

---

## 3. TypeScript 配置

### 它到底是什么

TypeScript = JavaScript + 类型。`.ts` / `.tsx` 文件由 `tsc` 编译成 `.js` 才能跑（也可以由 tsup / vite 编译，下面会讲）。

### 为什么 monorepo 要分两层 tsconfig

每个子包的需求不同（react 包要 jsx，core 包不要），但很多设置又都一样（strict、target）。所以拆：

- `tsconfig.base.json`（仓库根）：写所有共享的 `compilerOptions`
- `packages/<x>/tsconfig.json`：`extends` 上面那个，再写自己的

本项目的 `tsconfig.base.json`：

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "jsx": "react-jsx",
    "esModuleInterop": true,
    "skipLibCheck": true,
    "noUncheckedIndexedAccess": true,
    "declaration": true,
    "declarationMap": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,
    "resolveJsonModule": true
  }
}
```

挑几个关键说：

| 选项                        | 作用                                                        |
| --------------------------- | ----------------------------------------------------------- |
| `strict: true`              | 一键开启所有严格模式，最重要的一项                          |
| `target: "ES2020"`          | 编译产物的 JS 版本。ES2020 兼容性已经够好                   |
| `module: "ESNext"`          | 输出 ES module（`import/export`）                           |
| `moduleResolution: "bundler"` | 让 TS 用打包器的方式找模块，能识别 `package.json` 的 exports |
| `jsx: "react-jsx"`          | React 17+ 的新 JSX runtime，写组件不用手动 `import React`   |
| `noUncheckedIndexedAccess`  | `arr[0]` 的类型自动变成 `T \| undefined`，强迫你判 undefined |
| `isolatedModules`           | 保证每个文件能被单独编译。tsup / vite 都要求这个            |
| `declaration`               | 输出 `.d.ts` 类型声明文件（库必须开）                       |

子包的 `tsconfig.json` 通常就一两行：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
```

### tsc 在本项目的角色

注意：本项目里 `tsc` 只用来**类型检查**（`tsc --noEmit`），**不用来打包**。打包交给 tsup（见第 8 节）。

为什么这么分？因为 tsc 编译速度慢，且不会处理 css。tsup 用 esbuild 编译，快 10 倍，css 也能复制过去。tsc 只负责"代码类型有没有错"。

### 自检练习

1. `noEmit` 是什么意思？为什么要单独跑一遍 `tsc --noEmit`？
2. 为什么发布的库必须开 `declaration: true`？
3. 如果一个项目没开 `strict`，最常踩的坑是什么？

---

## 4. ESLint 9

### 它到底是什么

ESLint 检查代码"质量"问题：未使用变量、错误的 hook 用法、可能的 bug。和 Prettier 不同，**ESLint 关心代码逻辑，Prettier 关心代码外观**。

### 为什么要用

- React Hook 规则：`useState` 不能放 if 里——这是 ESLint 检查的
- 未使用的变量提示
- TypeScript 特有的规则：`any` 警告、未使用的类型参数

### 扁平配置 vs 旧配置

ESLint 9 用了新的 "flat config" 格式，是一个 `eslint.config.js`，导出一个数组。每个数组元素是一段配置，按顺序合并。

对比旧的 `.eslintrc.json` + `extends: ["plugin:react/recommended"]`，flat config 更直白，但教程很多还停留在旧格式，看的时候要对照版本。

### 本项目的真实配置

`eslint.config.js`：

```js
import js from '@eslint/js'
import tseslint from 'typescript-eslint'
import reactPlugin from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'

export default [
  // 1. 全局忽略
  {
    ignores: ['dist/', 'node_modules/', 'coverage/', '**/dist/**'],
  },
  // 2. JS 推荐规则
  js.configs.recommended,
  // 3. TS 推荐规则（spread 因为它是数组）
  ...tseslint.configs.recommended,
  // 4. 仅对 ts/tsx 启用 React 规则
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooks,
    },
    languageOptions: {
      parserOptions: { ecmaFeatures: { jsx: true } },
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',
    },
  },
]
```

读法：从上到下叠加，靠后的覆盖靠前的。

### 命令

```bash
pnpm lint                # 检查
npx eslint . --fix       # 检查并自动修复（能修的）
```

### 自检练习

1. ESLint 和 Prettier 的职责边界在哪？
2. `ignores` 为什么必须单独成一个对象，不能写在其他对象里？（提示：flat config 规则）
3. `'react-hooks/exhaustive-deps': 'warn'` 报警时，正确的处理是改代码还是 ignore？

---

## 5. Prettier

### 它到底是什么

格式化工具。只管缩进、引号、分号、行宽这种纯外观问题。**没有逻辑判断**。

### 为什么要用

省下所有关于"用单引号还是双引号"的争论。配置一次，全队（包括未来的你）写代码都长一个样。

### 本项目的配置

`.prettierrc`：

```json
{
  "semi": false,
  "singleQuote": true,
  "trailingComma": "all",
  "printWidth": 100
}
```

逐条解释：

| 选项                    | 含义                                           |
| ----------------------- | ---------------------------------------------- |
| `semi: false`           | 行尾不加分号                                   |
| `singleQuote: true`     | 用单引号 `'foo'`，不用双引号                   |
| `trailingComma: "all"`  | 多行的最后一项也加逗号（diff 更干净）          |
| `printWidth: 100`       | 一行超过 100 字符就尝试换行                    |

`.prettierignore`：

```
node_modules/
dist/
coverage/
.turbo/
pnpm-lock.yaml
**/*.md
```

最后一行 `**/*.md` 是关键——本项目的 markdown 文档都是手写的，不让 Prettier 重排表格。这是"由项目特性决定的偏离"，不是默认。

### 命令

```bash
pnpm format         # 格式化所有文件（写入）
pnpm format:check   # 只检查不写入（CI 用）
```

### 和 ESLint 怎么共存

简单粗暴：**让 Prettier 管外观，让 ESLint 管逻辑**。如果 ESLint 也开了"分号必须有"这种规则，会和 Prettier 打架。本项目的 ESLint 配置没开这类规则，所以不需要 `eslint-config-prettier` 来"关闭冲突项"。

### 自检练习

1. 为什么 `pnpm-lock.yaml` 要加进 `.prettierignore`？
2. 如果你想让 Prettier 也管 markdown，要做什么？
3. `trailingComma: "all"` 为什么对 git diff 友好？

---

## 6. Vitest

### 它到底是什么

测试框架。你可以理解为 "Jest 的现代替代品"。API 几乎一样（`describe / it / expect`），但底层用 Vite，启动快、原生支持 ESM 和 TS。

### 为什么不用 Jest

- Jest 在 ESM + TS 项目里要装 `ts-jest` 或 `babel-jest`，配置烦
- Vitest 复用 vite.config.ts 的 resolve / alias，零配置
- 速度更快（用 esbuild 编译测试文件）

### 最小用法

新建 `packages/core/src/clamp.test.ts`：

```ts
import { describe, it, expect } from 'vitest'
import { clamp } from './clamp'

describe('clamp', () => {
  it('clamps to min', () => {
    expect(clamp(-5, 0, 10)).toBe(0)
  })
  it('clamps to max', () => {
    expect(clamp(15, 0, 10)).toBe(10)
  })
  it('passes through when in range', () => {
    expect(clamp(5, 0, 10)).toBe(5)
  })
})
```

跑：

```bash
pnpm --filter @adaptive-hover/core test
```

### 几个核心 API

| API              | 作用                                 |
| ---------------- | ------------------------------------ |
| `describe`       | 分组（嵌套也行）                     |
| `it` / `test`    | 一个测试用例                         |
| `expect(x).toBe` | 严格相等（`===`）                    |
| `expect(x).toEqual` | 深度相等（对象/数组用这个）       |
| `beforeEach`     | 每个用例前跑                         |
| `afterEach`      | 每个用例后跑                         |
| `vi.fn()`        | 创建 mock 函数                       |
| `vi.useFakeTimers()` | 把 setTimeout 等替换成可控版本   |

### 覆盖率

```bash
pnpm --filter @adaptive-hover/core test:coverage
```

底层用 `@vitest/coverage-v8`，跑完会生成 `coverage/index.html`，浏览器打开能看每行的命中情况。

四个指标：

- **Statements**：语句覆盖
- **Branches**：分支覆盖（if/else 两边都走过）
- **Functions**：函数被调用过
- **Lines**：行覆盖

本项目 core 要求 **100% line + 100% branch**。

### React 测试需要的额外配置

如果是测 React 组件，要跑在 jsdom 里（模拟浏览器 DOM），看下一节。core 是纯函数，不需要。

### 自检练习

1. `toBe` 和 `toEqual` 的区别？什么时候用哪个？
2. 为什么 100% 行覆盖不等于代码完全正确？
3. 写一个 `vi.fn()` 的例子，验证某个函数被调用了 2 次。

---

## 7. Testing Library + jsdom

### 它到底是什么

- **jsdom**：用 JS 模拟浏览器环境（document、window、DOM API），让测试在 Node 里也能渲染 React 组件
- **@testing-library/react (RTL)**：在 jsdom 上面包一层，提供"模拟用户行为"的 API
- **@testing-library/jest-dom**：扩展 expect，加 `toBeInTheDocument()` 这类 DOM 断言
- **@testing-library/user-event**：模拟更真实的用户操作（hover、type、click）

### RTL 的核心理念

> Test the way users use your app.

不要测组件内部的 state 字段，测"用户能看到什么、能点什么"。所以查询元素不用 ref / className，用 `getByRole('button', { name: '提交' })` 这种「人类视角」的 query。

### 配置一遍

`packages/react/vitest.config.ts`：

```ts
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environment: 'jsdom',           // 关键：用 jsdom 而不是 node
    globals: true,                  // 让 describe/it/expect 不用 import
    setupFiles: ['./vitest.setup.ts'],
  },
})
```

`packages/react/vitest.setup.ts`：

```ts
import '@testing-library/jest-dom/vitest'
```

这一行就把 `toBeInTheDocument()` / `toHaveClass()` 这些 matcher 注入了 vitest。

`tsconfig.json` 还要加：

```json
{
  "compilerOptions": {
    "types": ["vitest/globals", "@testing-library/jest-dom/vitest"]
  }
}
```

否则 TS 不认识全局的 `describe` 和扩展的 matcher。

### 一个完整例子

```tsx
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { AdaptiveHoverPanel } from './AdaptiveHoverPanel'

describe('AdaptiveHoverPanel', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })
  })
  afterEach(() => {
    vi.clearAllTimers()
    vi.useRealTimers()
  })

  it('delay 控制打开', () => {
    render(
      <AdaptiveHoverPanel delay={400} panel={<div>面板</div>}>
        <button>触发</button>
      </AdaptiveHoverPanel>
    )

    const trigger = screen.getByRole('button', { name: '触发' })
    fireEvent.mouseEnter(trigger)
    fireEvent.mouseMove(trigger, { clientX: 100, clientY: 100 })

    expect(screen.queryByText('面板')).not.toBeInTheDocument()

    act(() => { vi.advanceTimersByTime(400) })

    expect(screen.getByText('面板')).toBeInTheDocument()
  })
})
```

### 几个本项目踩过的坑

| 坑                                                            | 解决                                                                                  |
| ------------------------------------------------------------- | ------------------------------------------------------------------------------------- |
| `userEvent.hover()` 在 fake timers + React 19 + jsdom 下卡住 | 用 `fireEvent.mouseEnter / mouseMove / mouseLeave` 替代                              |
| 用了 rAF 节流，但 layout 总是 null                            | `useFakeTimers` 的 `toFake` 必须包含 `requestAnimationFrame`                          |
| 计算 layout 需要鼠标坐标                                      | `mouseEnter` 不带 clientX/Y，要再 `mouseMove(trigger, { clientX, clientY })` 一次    |
| 用例之间互相影响                                              | `afterEach` 里 `clearAllTimers` + `useRealTimers`                                     |

### 自检练习

1. 为什么 RTL 不推荐用 `getByTestId`？什么时候才允许用？
2. `getByRole('button')` 和 `getByText('点击')` 的区别？
3. 为什么 fake timers 必须连 rAF 一起 fake？

---

## 8. tsup 打包

### 它到底是什么

打包工具。把 `src/index.ts` 编译成可发布的 `dist/index.js` + `dist/index.cjs` + `dist/index.d.ts`。

### 为什么不用 Vite / Rollup

发布给"未知用户"的库，要同时支持：

- ESM（现代项目用 `import`）
- CJS（老项目和 Node 用 `require`）
- 完整的 `.d.ts`（IDE 类型提示）

tsup = esbuild + 自动生成 d.ts。配置极简，专治"我要发布一个库"这件事。Vite 偏向应用打包（bundle 整个 SPA），Rollup 配置太繁琐。

### 本项目的真实配置

`packages/core/tsup.config.ts`：

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

`packages/react/tsup.config.ts`：

```ts
import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts', 'src/styles.css'],
  format: ['esm', 'cjs'],
  dts: { entry: 'src/index.ts' },
  clean: true,
  sourcemap: true,
  external: ['react', 'react-dom'],
  loader: { '.css': 'copy' },
})
```

字段解释：

| 字段             | 作用                                                                       |
| ---------------- | -------------------------------------------------------------------------- |
| `entry`          | 入口文件。可以多个                                                         |
| `format`         | 产出格式。`esm` = `.js`, `cjs` = `.cjs`                                    |
| `dts`            | 是否生成类型声明。`true` = 全部 entry 都生成；object = 指定哪个 entry      |
| `clean`          | 打包前清空 dist                                                            |
| `sourcemap`      | 生成 `.js.map`，浏览器 DevTools 能看到原始 TS                              |
| `external`       | 不打包进 dist 的依赖。React 必须 external，否则一个组件库里塞两个 React    |
| `loader`         | 文件类型处理器。`.css: copy` = CSS 不编译，原样复制                        |

### 跑一下

```bash
pnpm --filter @adaptive-hover/react build
```

产物：

```
packages/react/dist/
├── index.js          # ESM
├── index.js.map
├── index.cjs         # CJS
├── index.cjs.map
├── index.d.ts        # 类型声明
└── styles.css        # 复制过来的
```

### external 和 peerDependencies 的关系

两者要对应：

```json
// package.json
"peerDependencies": {
  "react": ">=18",
  "react-dom": ">=18"
}
```

```ts
// tsup.config.ts
external: ['react', 'react-dom']
```

意思都是"我不带 React，宿主项目自己有"。如果 external 没列但 peer 列了，会把 React 打进 dist；如果 peer 没列但 external 列了，用户安装时不会自动装 React，import 时报错。

### 自检练习

1. 为什么 `react` 必须 external？
2. 同一个包同时给 ESM 和 CJS 的好处是什么？
3. sourcemap 在生产环境会泄漏源码吗？要不要发布？

---

## 9. package.json 的 exports / main / types / sideEffects

### 它到底是什么

`package.json` 是 npm 包的"门面"。用户 `pnpm add <你的包>` 之后，能 import 到什么文件、IDE 能不能跳类型，全靠这几个字段。

### 完整字段对照

本项目 `packages/react/package.json`（节选）：

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
  "publishConfig": { "access": "public" }
}
```

逐个字段：

#### `type: "module"`

声明本包默认是 ES module。`.js` 文件按 ESM 解析。CJS 文件要用 `.cjs` 后缀。

#### `main` / `module` / `types`（旧字段）

- `main`：CJS 入口（老项目）
- `module`：ESM 入口（部分老打包器看这个）
- `types`：`.d.ts` 入口

新工具应该看 `exports`，但保留这几个字段是为了兼容。

#### `exports`（新字段，权威）

`.` 表示主入口。值是 conditional exports：

- `types` 必须放第一位，给 IDE 用
- `import`：用户 `import` 时用 ESM
- `require`：用户 `require` 时用 CJS

`./styles.css` 子路径让用户能 `import '@adaptive-hover/react/styles.css'`。**子路径必须显式列出**，否则 npm 不允许 import。

#### `files`

发布到 npm 时只打包这些。`["dist"]` 表示只把 dist 推上去，src / 测试 / 配置全不发。

不写这个字段会把整个 repo 推上去，几十 MB 起步。

#### `sideEffects`

告诉打包器（webpack / vite）哪些文件有副作用，不能 tree-shake。

- `false`：所有文件纯函数，可以激进 tree-shake
- `["**/*.css"]`：CSS 文件有副作用（注入样式），其他可以 tree-shake

react 包必须列 CSS，否则用户 `import '...styles.css'` 会被 tree-shake 掉，样式丢失。

#### `publishConfig.access: "public"`

scoped 包（`@xxx/yyy`）默认是私有的，要显式声明 public 才能免费发布。

### 验证 exports 没坏

发布前可以用 [`@arethetypeswrong/cli`](https://github.com/arethetypeswrong/arethetypeswrong.github.io)：

```bash
npx @arethetypeswrong/cli --pack
```

它会模拟用户用 ESM / CJS / TypeScript / Bun / Deno 各种姿势 import，给你打分。

### 自检练习

1. `exports` 里 `types` 为什么必须放第一个？
2. 不写 `files` 字段会发生什么？
3. `sideEffects: false` 用错了会有什么后果？

---

## 10. Storybook

### 它到底是什么

组件预览 + 文档工具。每个组件写若干 "story"（演示场景），Storybook 把它们渲染成可交互页面。

效果：你打开 `http://localhost:6006`，左边是 story 列表，右边是组件实时渲染，下面是 Controls 面板能调 props。

### 为什么要用

- 开发组件时不用启动整个应用
- 给设计师看组件状态：默认 / 悬停 / 加载 / 错误
- 给文档站当 demo
- CI 跑 visual regression 测试（截图对比）

### 最小用法

`packages/react/.storybook/main.ts`：

```ts
import type { StorybookConfig } from '@storybook/react-vite'

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx)'],
  addons: ['@storybook/addon-essentials', '@storybook/addon-themes'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
}
export default config
```

`packages/react/.storybook/preview.ts`：

```ts
import '../src/styles.css'

export const parameters = {
  layout: 'centered',
}
```

写一个 story `src/stories/Basic.stories.tsx`：

```tsx
import type { Meta, StoryObj } from '@storybook/react'
import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'

const meta: Meta<typeof AdaptiveHoverPanel> = {
  title: 'Basic',
  component: AdaptiveHoverPanel,
}
export default meta

export const Default: StoryObj<typeof AdaptiveHoverPanel> = {
  args: {
    delay: 400,
    panel: <div>悬停面板</div>,
    children: <button>悬停我</button>,
  },
}
```

跑：

```bash
pnpm storybook
```

### 几个关键概念

| 概念       | 含义                                         |
| ---------- | -------------------------------------------- |
| Story      | 一个组件的一种状态                           |
| Meta       | 一组 story 的共享配置（标题、组件、默认 args） |
| Args       | 渲染 story 用的 props                        |
| Decorator  | 包裹所有 story 的高阶组件（提供主题、路由）  |
| Addon      | 插件。essentials = controls/actions/viewport 等常用 |

### 本项目的版本踩坑

Storybook 8 + Vite 6 + Vitest 4 是版本交集，三者的 vite peer 必须对齐到 `^6.3.5`，否则 `pnpm install` 会装出冲突的多副本。如果你升级了 Storybook 9，要同时检查 Vite 和 Vitest。

### 自检练习

1. story 和单元测试的职责差异？
2. Controls 是怎么从 args 自动生成的？
3. 为什么 `.storybook/preview.ts` 要 import css？

---

## 11. changesets

### 它到底是什么

版本号 + CHANGELOG 管理工具。专为 monorepo 设计。

### 为什么要用

monorepo 下，core 和 react 是两个独立版本号，但它们互相依赖。手动维护：

- 改了 core，react 的依赖版本要不要升？
- 这次改是 patch 还是 minor？
- CHANGELOG 怎么写？

太烦。changesets 的解决方案：每次改完代码，写一个 `.changeset/xxx.md` 描述改了什么、影响哪些包、是 patch/minor/major。攒到一定时候批量发版。

### 用法（完整流程）

#### 一次性初始化

```bash
pnpm add -D -w @changesets/cli
pnpm changeset init
```

生成 `.changeset/config.json`：

```json
{
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": []
}
```

字段意思：

| 字段                          | 含义                                                            |
| ----------------------------- | --------------------------------------------------------------- |
| `access: "public"`            | scoped 包发公开                                                 |
| `baseBranch: "main"`          | 主分支名                                                        |
| `updateInternalDependencies`  | core 升级时，依赖它的 react 自动升 patch                        |
| `fixed`                       | 列出"必须同版本号一起发"的包（本项目两个独立，留空）            |
| `linked`                      | 列出"必须一起升 minor/major"的包                                |

#### 日常：写 changeset

```bash
pnpm changeset
```

进入交互式：

1. 选哪些包受影响（空格选中）
2. 每个包是 major / minor / patch
3. 写一段摘要

生成 `.changeset/<random-name>.md`：

```md
---
'@adaptive-hover/react': minor
---

支持 panel 自定义动画
```

跟代码一起 commit。

#### 发版：apply changeset

```bash
pnpm changeset version
```

它会：

- 读所有 `.changeset/*.md`
- 更新每个包的 `package.json` 版本号
- 写入 `CHANGELOG.md`
- 替换 `workspace:*` 为实际版本号
- 删除已应用的 `.changeset/*.md`

```bash
git commit -am "chore: release"
pnpm -r build
pnpm changeset publish
```

最后那条会 `npm publish` 每个有变更的包。

### major / minor / patch 怎么选

[Semver](https://semver.org/)：

- **major**（1.x.x → 2.0.0）：破坏性变更。删 props、改默认行为、改 peer 范围
- **minor**（1.0.x → 1.1.0）：新功能，向后兼容。新增 props、新增 export
- **patch**（1.0.0 → 1.0.1）：bug fix、性能优化、文档

判断标准：**用户原来的代码升级后还能跑吗？** 能 = patch / minor，不能 = major。

### 自检练习

1. 为什么不直接手动改 `package.json` 的 `version`？
2. `fixed` 和 `linked` 的区别？
3. 发版前忘了 `pnpm -r build` 会发生什么？

---

## 12. GitHub Actions CI

### 它到底是什么

代码推到 GitHub 后自动跑的脚本。用来保证：

- 没人推了类型错误的代码
- 没人推了测试不过的代码
- 主分支永远是绿的

### 本项目的真实配置

`.github/workflows/ci.yml`：

```yaml
name: CI

on:
  pull_request:
  push:
    branches:
      - main

jobs:
  verify:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - uses: pnpm/action-setup@v4
        with:
          version: 10.10.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm

      - run: pnpm install --frozen-lockfile
      - run: pnpm typecheck
      - run: pnpm lint
      - run: pnpm -r test
      - run: pnpm -r build
```

逐段读：

| 段落                            | 作用                                                              |
| ------------------------------- | ----------------------------------------------------------------- |
| `on: pull_request / push.main`  | 触发条件：开 PR 时跑、推 main 时跑                                |
| `runs-on: ubuntu-latest`        | 用 GitHub 提供的 Ubuntu 虚拟机                                    |
| `actions/checkout@v4`           | 把代码拉下来                                                      |
| `pnpm/action-setup`             | 安装 pnpm（版本必须和本地锁的一致）                               |
| `actions/setup-node`            | 安装 Node 20，启用 pnpm 缓存                                      |
| `pnpm install --frozen-lockfile` | 严格按 lockfile 装，不允许更新                                    |
| 后面四条                        | 类型 → 风格 → 测试 → 构建                                         |

任何一条非 0 退出，整个 CI 红，PR 不允许合并（如果开了 branch protection）。

### 关键概念

- **Workflow**：一个 yml 文件，一组任务
- **Job**：workflow 里的一个任务，独立运行环境
- **Step**：job 里的一步，要么 `uses`（用别人写的 action），要么 `run`（执行 shell）
- **Runner**：执行 job 的虚拟机

### 自检练习

1. `--frozen-lockfile` 为什么 CI 必须加？
2. 怎么让 CI 跑 Windows + macOS + Linux 三个环境？
3. 怎么在 PR 通过 CI 才能 merge？（提示：不在 yml 里）

---

## 13. 从 0 到 1 自己搭一个同款项目

下面这个清单按依赖顺序排，照着做能搭出本项目的骨架。

### Step 1 - 仓库 + pnpm

```bash
mkdir my-lib && cd my-lib
git init
pnpm init                    # 生成 package.json
```

编辑根 `package.json`：

```json
{
  "name": "my-lib-monorepo",
  "private": true,
  "type": "module",
  "packageManager": "pnpm@10.10.0",
  "scripts": {
    "typecheck": "pnpm -r typecheck",
    "lint": "eslint .",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

`pnpm-workspace.yaml`：

```yaml
packages:
  - 'packages/*'
```

### Step 2 - TypeScript

```bash
pnpm add -D -w typescript
```

写 `tsconfig.base.json`（复制本项目的）。

### Step 3 - 第一个子包

```bash
mkdir -p packages/core/src
cd packages/core
pnpm init
```

`packages/core/package.json`：

```json
{
  "name": "@your-scope/core",
  "version": "0.0.0",
  "type": "module",
  "private": true,
  "scripts": {
    "typecheck": "tsc --noEmit"
  }
}
```

`packages/core/tsconfig.json`：

```json
{
  "extends": "../../tsconfig.base.json",
  "compilerOptions": { "outDir": "dist" },
  "include": ["src"]
}
```

`packages/core/src/index.ts`：

```ts
export const hello = (name: string) => `hello ${name}`
```

### Step 4 - ESLint + Prettier

```bash
pnpm add -D -w eslint @eslint/js typescript-eslint eslint-plugin-react eslint-plugin-react-hooks prettier
```

复制本项目的 `eslint.config.js` 和 `.prettierrc` / `.prettierignore`。

### Step 5 - Vitest

```bash
pnpm add -D --filter @your-scope/core vitest @vitest/coverage-v8
```

加 scripts：

```json
"test": "vitest run",
"test:coverage": "vitest run --coverage"
```

写一个 `src/index.test.ts` 测一下。

### Step 6 - tsup

```bash
pnpm add -D --filter @your-scope/core tsup
```

`packages/core/tsup.config.ts` 复制本项目的。

`package.json` 加：

```json
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
  "build": "tsup"
}
```

去掉 `private: true`（要发布的话）。

### Step 7 - 第二个子包（React）

重复 Step 3~6，但 tsconfig 加 `jsx: "react-jsx"`，安装 `react react-dom @types/react @types/react-dom`，`peerDependencies` 写 React。

### Step 8 - playground

```bash
mkdir playground && cd playground
pnpm create vite . --template react-ts
```

把生成的 `package.json` 里的 `dependencies` 加上 `"@your-scope/react": "workspace:*"`。

### Step 9 - Storybook（可选）

```bash
cd packages/react
pnpm dlx storybook@latest init
```

按提示选 vite + react。

### Step 10 - changesets

```bash
cd ../..  # 回根目录
pnpm add -D -w @changesets/cli
pnpm changeset init
```

### Step 11 - GitHub Actions

`.github/workflows/ci.yml` 复制本项目的。

### Step 12 - 验证

全跑一遍，全绿就成功了：

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm format:check
pnpm -r test
pnpm -r build
```

---

## 14. 遇到问题怎么自救

### 排查顺序

1. **看错误信息原文**——80% 的错误第一行就给了答案
2. **复制错误关键字搜索**——优先 GitHub Issue，其次 Stack Overflow
3. **看官方文档**——pnpm / vitest / tsup 的官网都很短
4. **二分定位**——把代码注释掉一半，看错误还在不在

### 常见错误对照

| 错误现象                                                              | 可能原因                                        | 排查方向                                              |
| --------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------- |
| `Cannot find module '@xxx/yyy'`                                       | workspace 没装 / 名字写错                       | `pnpm install`，检查 `package.json` 里的 `dependencies` |
| `ERR_MODULE_NOT_FOUND` import 时报错                                  | ESM 路径必须带 `.js` 后缀                       | tsup 编译后 import 路径要写 `./foo.js` 不是 `./foo`   |
| `Cannot use import statement outside a module`                        | `package.json` 没写 `"type": "module"`          | 加上                                                  |
| Storybook 启动报 vite peer 冲突                                       | 依赖里有多个 vite 版本                          | `pnpm why vite` 看谁带进来的                          |
| `tsc --noEmit` 通过但 tsup 报错                                       | tsup 用 esbuild，对部分类型语法支持比 tsc 宽松/严格 | 看 tsup 错误原文，多半是 import type 问题             |
| 测试里 `setTimeout` 不触发                                            | 没用 fake timers，或 fake 范围不全                | `vi.useFakeTimers({ toFake: [...] })`                 |
| 发布后用户 `import` 不到样式                                          | `sideEffects` 没列 css，被 tree-shake           | `"sideEffects": ["**/*.css"]`                         |
| 改了 core 但 react 拿不到新代码                                       | tsup 是预编译的，改 src 不会自动 rebuild         | 给 core 跑一次 `tsup --watch`，或让 react 直接 import src |
| `pnpm install` 报 `ERR_PNPM_OUTDATED_LOCKFILE`                        | lockfile 跟 package.json 对不上                 | 删 lockfile + node_modules，重装                      |

### 学习资源

- pnpm：<https://pnpm.io/zh/>
- TypeScript：<https://www.typescriptlang.org/zh/docs/>
- Vitest：<https://vitest.dev/>
- Testing Library：<https://testing-library.com/docs/react-testing-library/intro/>
- tsup：<https://tsup.egoist.dev/>
- Storybook：<https://storybook.js.org/docs>
- changesets：<https://github.com/changesets/changesets/blob/main/docs/intro-to-using-changesets.md>
- Semver：<https://semver.org/lang/zh-CN/>

### 心法

1. **配置文件不要复制粘贴，每个字段都要能口头解释一遍**——这份文档存在的意义就是这个
2. **遇到不懂的工具，先查它解决什么问题，再看怎么配**——倒过来学是地狱
3. **能用工具默认配置就别改**——本项目偏离默认的地方都在前面文档里有解释，没解释的就是默认
4. **报错先读完整再问 AI**——很多时候答案就在第三行

---

## 附：本项目用到的全部工具一览表

| 工具                     | 类型           | 解决问题                |
| ------------------------ | -------------- | ----------------------- |
| pnpm                     | 包管理器       | 装依赖、workspace       |
| TypeScript               | 语言           | 类型系统                |
| ESLint                   | 静态分析       | 代码质量                |
| Prettier                 | 格式化         | 代码外观                |
| Vitest                   | 测试框架       | 跑测试                  |
| @vitest/coverage-v8      | 覆盖率         | 测试覆盖率              |
| jsdom                    | DOM 模拟       | 在 Node 跑 React 测试   |
| @testing-library/react   | 测试工具       | 渲染组件 + 查询元素     |
| @testing-library/jest-dom| 断言扩展       | DOM 相关断言            |
| @testing-library/user-event | 用户行为模拟 | 模拟点击/输入           |
| tsup                     | 打包工具       | 编译库                  |
| Vite                     | 开发服务器     | playground 热更新       |
| Storybook                | 组件预览       | 可视化文档              |
| changesets               | 版本管理       | 多包版本号 + changelog  |
| GitHub Actions           | CI             | 自动化检查              |

每一个都有不可替代的位置。理解为什么用它们，比记 API 重要 10 倍。
