# 贡献指南

感谢你愿意为 Adaptive Hover Panel 出一份力。这份文档面向想本地跑起来、改代码、提 PR 的人。先读完整篇再动手，能帮你避开几个 monorepo 常见的小坑。

如果只是想用这个库，看 [README](./README.md) 就够了。

## 项目定位

视口感知的 React 悬停面板。core 层是框架无关的纯算法，react 层是 hook + 组件 + Portal + 默认样式。两个包独立发布到 npm，源码在 monorepo 里联调。

设计文档在 [Adaptive Hover Panel 开发文档（React 版）.md](./Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md)，所有架构决策、状态机、算法推导都写在那里。任务拆分进度看 [TASKS.md](./TASKS.md)，单个任务的细节在 `tasks/T*.md`。

## 环境要求

| 工具    | 版本       | 备注                                              |
| ------- | ---------- | ------------------------------------------------- |
| Node.js | ≥ 20       | 用 LTS 即可                                       |
| pnpm    | 10.10.0    | 根 `package.json` 的 `packageManager` 已锁定      |
| Git     | 任意现代版 | —                                                 |

强烈建议用 [Corepack](https://nodejs.org/api/corepack.html) 启用 pnpm，避免全局版本和锁定版本不一致：

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
```

不要用 npm 或 yarn 装依赖，会破坏 lockfile。

## 仓库结构

```
.
├── packages/
│   ├── core/              # @adaptive-hover/core，纯算法，无 react / dom 依赖
│   │   ├── src/
│   │   │   ├── calculateLayout.ts
│   │   │   ├── clamp.ts
│   │   │   ├── constants.ts
│   │   │   ├── types.ts
│   │   │   └── index.ts
│   │   └── *.test.ts      # 单元测试
│   └── react/             # @adaptive-hover/react，hook + 组件 + 样式
│       ├── src/
│       │   ├── AdaptiveHoverPanel.tsx
│       │   ├── FloatingPanel.tsx
│       │   ├── Portal.tsx
│       │   ├── useAdaptiveHoverPanel.ts
│       │   ├── styles.css
│       │   ├── stories/   # Storybook 场景
│       │   └── *.test.tsx # 集成测试（jsdom + RTL）
│       └── .storybook/
├── playground/            # Vite 沙箱，不发布
├── tasks/                 # 子任务拆分文档
├── docs/                  # 设计文档资源
├── .changeset/            # changesets 版本管理
├── .github/workflows/     # CI
├── eslint.config.js
├── tsconfig.base.json
├── pnpm-workspace.yaml
└── TASKS.md
```

## 一次性初始化

```bash
git clone <repo-url>
cd Adaptive-Hover-Panel
pnpm install
```

`pnpm install` 会同时拉所有 workspace 包的依赖。装完之后建议跑一次完整校验确认环境 OK：

```bash
pnpm typecheck
pnpm lint
pnpm -r test
pnpm -r build
```

四条全绿就可以开干。

## 日常开发命令

所有命令在仓库根目录执行。

### 跑沙箱

```bash
pnpm dev
```

启动 playground 的 Vite，默认 `http://localhost:5173/`。Vite 直接消费 `@adaptive-hover/react` 的 src 入口，改组件源码会热更新，不用先 build。

### 跑 Storybook

```bash
pnpm storybook
```

启动在 `http://localhost:6006/`。6 个 story 覆盖基础用法、大内容、图片预览、表格预览、视口边界、暗色模式。

### 类型检查

```bash
pnpm typecheck     # 一次跑全部 workspace 的 tsc --noEmit
```

提交前必须全绿。

### 代码风格

```bash
pnpm lint          # ESLint
pnpm format        # Prettier 写入
pnpm format:check  # Prettier 仅检查
```

CI 会跑 `lint` + `format:check`，本地不必每次手动 `format`，但 PR 前过一遍能省一轮 review。

### 单测和集成测试

```bash
pnpm -r test                                   # 跑 core + react 全部测试
pnpm --filter @adaptive-hover/core test        # 只跑 core
pnpm --filter @adaptive-hover/react test       # 只跑 react
pnpm --filter @adaptive-hover/core test:coverage   # core 覆盖率
pnpm --filter @adaptive-hover/react test:watch     # react watch 模式
```

core 必须保持 100% line + 100% branch 覆盖率，react 集成测试目前 8 个用例全部要绿。

### 构建

```bash
pnpm -r build      # tsup 产出 dist/，core ~1.4/2.6 KB，react ~8.6/10.2 KB + styles.css
```

dist 不进 git，发版前由 changesets 流水线产出。

## 开发流程

### 分支

```bash
git switch -c feat/<short-name>
git switch -c fix/<short-name>
git switch -c docs/<short-name>
```

不要直接往 `main` 推。

### 提交信息

遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

```
feat(react): 支持自定义 panel 进入动画
fix(core): clamp 在视口尺寸为 0 时返回 NaN
docs: 补充 SSR 注意事项
test(core): 覆盖中线分支的 >= 边界
chore(deps): 升级 vitest 到 4.2
```

`type` 用 `feat / fix / docs / test / chore / refactor / perf / build / ci`，`scope` 推荐用包名 `core / react` 或 `playground / storybook / repo`。

### 提交前自检

最简版：

```bash
pnpm typecheck && pnpm lint && pnpm -r test
```

涉及构建产物或 exports 的改动加上：

```bash
pnpm -r build
```

涉及 react 组件渲染或样式的改动手动跑一次 playground 和 Storybook，对照下面的清单看一遍。

## 修改类型对应的额外要求

### 改 core 算法

- 必须先读 [开发文档第 6 节](./Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 理解原算法
- 改完跑 `pnpm --filter @adaptive-hover/core test:coverage`，覆盖率不能下降
- 新增分支必须配套新增用例
- core 不允许引入任何运行时副作用，不允许 import react / dom api

### 改 react hook 或组件

- 不要把状态机相关的 setTimeout / setInterval 直接放进组件 render，会在严格模式下重复调度。所有定时器走 `useRef` 持有 + `useEffect` 清理
- 改 `useAdaptiveHoverPanel` 的状态机，先看 `tasks/T07-react-hook.md` 里的状态转换表
- 改 `AdaptiveHoverPanel` 的 children 注入逻辑，`tasks/T08-react-component.md` 完成记录里的 `cloneElement` + `display: contents` 兜底是已知方案，不要随手改成包一层 div

### 加新 props

- README 的 props 表必须同步
- 写 Storybook story 演示新行为，至少一个 Controls 可调
- 加单测或集成测试
- 默认值改动按 breaking change 处理，走 minor/major

### 改样式

- 默认皮肤只改 `packages/react/src/styles.css`
- 暗色规则放在 `@media (prefers-color-scheme: dark)` 内
- 降级规则放在 `@supports not (backdrop-filter: blur(1px))` 内，并在 `@supports` 内嵌套 `@media` 处理暗色降级（参考开发文档第 9.2 节）
- 类名前缀统一 `ahp-`

### 加测试

core 用纯 vitest，无任何 dom mock。react 用 vitest + jsdom + RTL：

- `vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'requestAnimationFrame', 'cancelAnimationFrame'] })`，rAF 必须 fake，否则 mousemove 节流 layout 算不出来
- 用 `fireEvent.mouseEnter / mouseLeave / mouseMove`，不要用 `userEvent.hover()`。React 19 + fake timers 下 user-event 内部微任务会卡住
- `beforeEach` 启 fake timers，`afterEach` `clearAllTimers` + `useRealTimers`
- 时序边界用 `advance(delay - 1)` + `advance(1)` 两步推进，比一次跳完更精确

## 手测清单

涉及 react 组件渲染的改动，PR 前在 playground 和 Storybook 走一遍：

- 鼠标在视口左上 / 右上 / 左下 / 右下：面板分别出现在右下 / 左下 / 右上 / 左上
- 浏览器宽度缩到 480px：面板被 clamp 在视口内，左右各留 12px
- 鼠标 trigger → panel 平滑过渡：面板不消失
- 完全离开 trigger 和 panel：约 150ms 后消失
- 系统切到暗色：面板背景切到深色
- DevTools → Rendering 模拟禁用 `backdrop-filter`：降级到不透明背景

## changesets 和发布

非 maintainer 不需要发布，但所有 user-facing 改动都要附 changeset。

### 加 changeset

```bash
pnpm changeset
```

按提示选受影响的包（core / react），选 patch / minor / major，写一段中文或英文摘要（会进 CHANGELOG）。生成的 `.changeset/<random>.md` 跟代码一起提交。

只改 playground / 文档 / CI / 测试不需要 changeset。

### 选哪个等级

- patch：bug fix、不影响 API 的内部重构、依赖升级补丁
- minor：新增 props、新增 export、不破坏现有用法的功能
- major：删除 props、修改默认行为、改 peerDependencies 范围

core 和 react 各自独立版本号，不联动。core 改了通常意味着 react 也要 patch（react 依赖 core），changesets 会自动处理。

### 发布（仅 maintainer）

```bash
pnpm changeset version    # 应用所有 .changeset/*.md，更新版本号和 CHANGELOG
git commit -am "chore: release"
git push
pnpm -r build
pnpm changeset publish    # 推到 npm
```

CI 配了 `.github/workflows/ci.yml`，但发布动作目前是手动触发。

## PR 流程

1. fork 或新分支
2. 实现 + 测试 + 自检
3. `pnpm changeset`（如适用）
4. `git push -u origin <branch>`
5. 开 PR，标题用 conventional commit 格式

PR 描述建议包含：

- 改动摘要（一两句话）
- 动机（解决什么问题 / 关联哪个 issue）
- 测试方式（跑了哪些命令、手测做了什么）
- 截图或 GIF（涉及视觉的改动）
- breaking change 说明（如有）

CI 会跑 typecheck、lint、format:check、test、build。全绿才会 review。

## 已知边界和不接受的 PR

下面这些是有意为之，不要 PR 改：

- core 不会引入 react peer：保持框架无关
- AdaptiveHoverPanel 用 `cloneElement` 而非 wrapper：保持 children 的 box 模型不变。如果 children 是不转发事件 props 到真实 DOM 的函数组件，注入会失效，这是已知限制
- 默认皮肤只提供 `.ahp-panel` 一个类：用户要深度定制走 `panelClassName`，不接受 CSS 变量 / theme provider 的 PR（第二阶段再考虑）
- 不引入 floating-ui / popper：自带的 calculateLayout 已经覆盖 MVP 场景，加依赖得不偿失

## 遇到问题

- 装依赖卡住：删掉 `node_modules` 和根 `pnpm-lock.yaml` 重装风险高，优先 `pnpm install --frozen-lockfile=false` 重试
- typecheck 红但代码看起来没问题：`tsc --build --clean` 清增量缓存后重跑
- Storybook 启动报 vite peer 冲突：vite 必须锁在 `^6.3.5`，是 vitest 4 和 Storybook 8 的交集
- jsdom 测试 `userEvent.hover` 卡 5 秒超时：换 `fireEvent`，原因见上文「加测试」一节

仍卡住，开一个 issue 把 `pnpm -v` `node -v` 和报错完整贴出来。

## License

提交即视为同意以 [MIT](./LICENSE) 协议授权代码。
