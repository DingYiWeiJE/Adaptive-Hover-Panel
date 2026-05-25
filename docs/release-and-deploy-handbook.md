# 发布与运维手册

> 这份文档把「改完代码 → 看效果 → 走查 → 出版本 → 上 npm → 部署」这一整条链路按顺序串起来。每节都给出具体命令和「踩坑提示」，方便对照执行。

适用对象：本项目的维护者、第一次接手发版的人。只想用这个库的读者请看 [README](../README.md)。

---

## 0. 总览：一次完整的发布要走多远

```
改代码
  ├── (本地实时看效果) Storybook / Playground / 单测 watch
  │
  └── 提交前自检
        ├── pnpm typecheck
        ├── pnpm lint
        ├── pnpm format:check
        └── pnpm -r test
              │
              └── pnpm changeset   ← 记录这次改了什么、属于哪个 semver 等级
                    │
                    └── git commit / push / PR / merge to main
                          │
                          └── pnpm changeset version  ← 生成新版本号 + CHANGELOG
                                │
                                └── pnpm -r build      ← 产出 dist
                                      │
                                      └── pnpm changeset publish  ← 推送到 npm
                                            │
                                            └── git push --follow-tags
                                                  │
                                                  └── 部署 Storybook / Playground（可选）
```

新人最常迷糊的两个点：

1. **build vs publish 是两步**。`pnpm -r build` 只生成 `dist/`，不会推到 npm；`pnpm changeset publish` 才是真正发布。
2. **changeset 不是写完代码顺手填的注释**。它决定了下一次 `pnpm changeset version` 给包升 patch / minor / major，缺了它发版会直接卡住。详见 [§5](#5-用-changeset-记录变更)。

---

## 1. 环境准备（只需做一次）

| 工具 | 版本 | 说明 |
| --- | --- | --- |
| Node.js | ≥ 20（LTS） | 用 nvm 或 fnm 管理 |
| pnpm | 10.10.0 | 根 `package.json` 的 `packageManager` 锁定 |
| Git | 任意现代版本 | — |
| npm 账号 | — | 用于 `npm publish`，需开启 2FA |

推荐用 Corepack 启 pnpm，避免全局版本和锁定版本不一致：

```bash
corepack enable
corepack prepare pnpm@10.10.0 --activate
```

clone 后初始化一次：

```bash
pnpm install
```

发版前最好先全绿过一遍：

```bash
pnpm typecheck && pnpm lint && pnpm -r test && pnpm -r build
```

---

## 2. 改完代码怎么实时看效果

有 4 种方式，按「与真实使用场景的接近度」从高到低排：

### 2.1 Storybook（推荐用于组件迭代）

```bash
pnpm storybook
```

打开 `http://localhost:6006`。

- **走的是源码**：`packages/react/src/stories/*.stories.tsx` 用相对路径 `import { AdaptiveHoverPanel } from '../AdaptiveHoverPanel'`，所以 Vite HMR 直接吃源码改动，**不用先 build**。
- 6 个 story 覆盖：基础按钮、暗色模式、图片预览、表格、视口边界、大内容。
- 想新加场景，直接在 `packages/react/src/stories/` 下加 `*.stories.tsx`。

### 2.2 Playground（推荐用于联调真实使用方式）

playground 模拟「外部用户安装这个 npm 包后的使用方式」，但通过 `vite.config.ts` 的 alias 把 `@adaptive-hover/react` / `@adaptive-hover/core` 直接指向源码：

```bash
pnpm dev
```

打开 Vite 提示的地址（默认 `http://localhost:5173/`），改 `packages/*/src` 下任何文件都会立刻 HMR，**不需要先 build**。

> 如果你想用真实的 dist 产物验证发布前形态，临时把 `playground/vite.config.ts` 里的 alias 注释掉，先 `pnpm --filter @adaptive-hover/react build`，再 `pnpm dev`。这样走的就是 `package.json` 的 `exports`，等价于外部用户的体验。CI 在 `pnpm -r build` 这步也会校验真实产物。

### 2.3 单测 watch 模式（推荐用于纯算法迭代）

```bash
pnpm --filter @adaptive-hover/core test:watch
pnpm --filter @adaptive-hover/react test:watch
```

改 `calculateLayout.ts` 这类纯逻辑，看测试断言比看 UI 快得多。

### 2.4 直接在浏览器调

```bash
pnpm dev
```

进 Vite 页面后，DevTools 里改 React 组件状态 / 模拟视口尺寸 / 用 Rendering 面板模拟暗色模式。这一步是 PR 前的人工走查。手测清单见 CONTRIBUTING.md 的「手测清单」一节。

---

## 3. 提交前自检

最简版（每次提交前必跑）：

```bash
pnpm typecheck && pnpm lint && pnpm -r test
```

涉及构建产物 / package.json `exports` / 新增 entry 的改动，加上：

```bash
pnpm -r build
```

涉及 react 组件 / 样式 / 状态机 的改动，再跑一次 playground 和 Storybook 走查（见 CONTRIBUTING.md 的「手测清单」）。

格式化（CI 跑 `format:check`，本地最好提前 `format` 一遍）：

```bash
pnpm format        # Prettier 写入
pnpm format:check  # 仅检查
```

---

## 4. 本地验证构建产物

发版前肉眼检查一次 `dist`，避免出门带 bug：

```bash
pnpm -r build
ls packages/react/dist
ls packages/core/dist
```

应当看到：

```
packages/core/dist/
  index.cjs        index.cjs.map
  index.js         index.js.map
  index.d.ts       index.d.cts

packages/react/dist/
  index.cjs        index.cjs.map
  index.js         index.js.map
  index.d.ts       index.d.cts
  styles.css
```

参考体积（变化超过 50% 多半是误打包了 react / 多余 polyfill）：

| 包 | esm | cjs |
| --- | --- | --- |
| core | ~1.4 KB | ~2.6 KB |
| react | ~8.6 KB | ~10.2 KB |

可选：用 `npm pack` 模拟发布产物，看 tarball 里到底打包了什么：

```bash
cd packages/react
npm pack --dry-run
```

`files` 字段只允许 `dist`，如果 dry-run 里出现了 `src` 或 `node_modules`，说明 `.npmignore` 或 `files` 配错了。

---

## 5. 用 changeset 记录变更

每次 user-facing 改动（影响 `core` 或 `react` 的公开 API、行为、默认值）都要附 changeset。只改 playground / docs / CI / 测试不需要。

```bash
pnpm changeset
```

交互式提示：

1. **选受影响的包**（空格选中，回车确认）：`@adaptive-hover/core` / `@adaptive-hover/react`。
2. **选 semver 等级**：
   - `patch`：bug fix、内部重构、不影响 API 的依赖升级。
   - `minor`：新增 props / 新增 export / 不破坏现有用法的功能。
   - `major`：删 props / 改默认行为 / 改 peerDependencies 范围。
3. **写摘要**：一两句中文或英文，会进 CHANGELOG，第三方用户会读到——写「修复 X 在 Y 场景下 Z」而不是「fix bug」。

生成的 `.changeset/<random>.md` 跟代码一起 commit。

**联动规则：** `@adaptive-hover/react` 依赖 `@adaptive-hover/core`，core 升 patch 时 react 会被自动 bump patch（由 `.changeset/config.json` 的 `updateInternalDependencies: "patch"` 控制）。

**core 和 react 版本号独立**，不联动。

---

## 6. 发版（仅 maintainer）

整套流程在本地完成（CI 还没自动化发布）。

### 6.1 一次性准备：npm 账号

第一次发版的人需要：

```bash
npm login                  # 浏览器走 OAuth 或输入凭据
npm whoami                 # 确认登录身份
```

确认账号有 `@adaptive-hover` scope 的发布权限。如果是个人 scope，跳过；如果是组织 scope，找 owner 把你加进去。

强烈建议开启 npm 账号的 2FA（在 npmjs.com 账号设置里），并设置成 `auth-and-writes` 级别——这样每次 `publish` 都会要 OTP。

### 6.2 出版本号 + 更新 CHANGELOG

在 `main` 分支拉到最新：

```bash
git switch main
git pull
```

应用所有积攒的 changeset，生成新版本号和 CHANGELOG：

```bash
pnpm changeset version
```

这条命令会：

- 读 `.changeset/*.md` 里的所有声明，计算每个包的新版本号
- 改 `packages/*/package.json` 的 `version`
- 写 / 更新每个包的 `CHANGELOG.md`
- 删掉已消费的 `.changeset/*.md`（保留 `README.md` 和 `config.json`）

肉眼检查 diff 一遍：

```bash
git diff
```

确认版本号、CHANGELOG 条目、依赖联动都符合预期，再提交：

```bash
git add .
git commit -m "chore: release"
```

### 6.3 构建并推送到 npm

```bash
pnpm -r build              # 重新构建，确保 dist 是最新的
pnpm changeset publish     # 推送到 npm
```

`pnpm changeset publish` 做的事：

- 对每个有 version bump 的包跑 `npm publish`
- 自动加 `--access public`（changeset config 里设了 `"access": "public"`）
- 给每个发布的版本打 git tag（如 `@adaptive-hover/react@0.1.0`）
- **不会** push tag 到 remote，需要你手动推

中途会提示输入 npm OTP（如果开了 2FA）。

### 6.4 推送 commit 和 tag

```bash
git push --follow-tags
```

`--follow-tags` 只推送跟 commit 关联的 annotated tag，比 `--tags` 更安全。

### 6.5 验证发布

```bash
npm view @adaptive-hover/core versions --json
npm view @adaptive-hover/react versions --json
```

应当看到刚发的版本。也可以在 [npmjs.com/package/@adaptive-hover/react](https://www.npmjs.com/package/@adaptive-hover/react) 页面看 README 是否正确渲染。

冒烟测试：在一个临时目录里装一下，跑一段最小示例确认 import 路径和类型都对。

```bash
mkdir /tmp/smoke && cd /tmp/smoke
npm init -y
npm install @adaptive-hover/react react react-dom
node -e "console.log(Object.keys(require('@adaptive-hover/react')))"
```

应当输出 `[ 'AdaptiveHoverPanel', 'useAdaptiveHoverPanel' ]`（具体看 `src/index.ts` 的 export 列表）。

### 6.6 发预览版 / beta 版

不想直接放到 `latest` tag，可以走 changeset 的 pre 模式：

```bash
pnpm changeset pre enter beta    # 进入 pre 模式
pnpm changeset                   # 加 changeset
pnpm changeset version           # 生成 0.1.0-beta.0
pnpm -r build
pnpm changeset publish           # 自动发到 beta tag
# 继续迭代 ...
pnpm changeset pre exit          # 退出 pre 模式
```

发到非默认 tag 后，用户得显式 `npm i @adaptive-hover/react@beta` 才能装到，不会污染 `latest`。

### 6.7 紧急回滚

npm **72 小时内**可以 `unpublish` 单个版本（之后只能 deprecate）：

```bash
npm unpublish @adaptive-hover/react@<bad-version>
```

如果超过 72 小时，标记 deprecate 提示用户升级：

```bash
npm deprecate @adaptive-hover/react@<bad-version> "Has bug X, upgrade to <good-version>"
```

实操中通常更简单的是直接发一个 patch 版本修掉问题。

---

## 7. CI（GitHub Actions）

现状：`.github/workflows/ci.yml` 在每个 PR 和 push 到 main 时跑：

```
checkout → setup pnpm@10.10.0 → setup node@20 → install →
typecheck → lint → test → build
```

CI 全绿才允许 merge。**发布动作目前是手动的**——CI 跑完不会自动 `changeset publish`。

### 7.1 把发布也自动化（可选改进）

[changesets/action](https://github.com/changesets/action) 的标准用法：

```yaml
# .github/workflows/release.yml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    permissions:
      contents: write
      pull-requests: write
      id-token: write   # 给 npm provenance 用
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: pnpm/action-setup@v4
        with:
          version: 10.10.0

      - uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: pnpm
          registry-url: 'https://registry.npmjs.org'

      - run: pnpm install --frozen-lockfile
      - run: pnpm -r build

      - uses: changesets/action@v1
        with:
          publish: pnpm changeset publish
          version: pnpm changeset version
          commit: 'chore: release'
          title: 'chore: release'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: 'true'
```

需要在仓库 Settings → Secrets 添加 `NPM_TOKEN`（在 npmjs.com 生成 Automation 类型的 token，自动跳过 2FA）。

流程：

- 有 changeset 时，Action 自动开一个 PR「Version Packages」收集所有 changeset。
- merge 这个 PR 后，Action 检测到版本号变化，自动 `changeset publish`。
- 加 `id-token: write` 权限 + `NPM_CONFIG_PROVENANCE=true` 让发布带上 npm provenance（用户可以查到这个版本是从哪个 commit、哪个 workflow 发出的，安全性更高）。

---

## 8. 部署：Storybook 静态站

Storybook 适合作为「在线 demo / 文档站」对外公开。

构建：

```bash
pnpm storybook:build       # 产物在 packages/react/storybook-static/
```

部署到 GitHub Pages（最便宜）：

```yaml
# .github/workflows/deploy-storybook.yml
name: Deploy Storybook
on:
  push:
    branches: [main]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with: { version: 10.10.0 }
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
      - run: pnpm storybook:build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: packages/react/storybook-static

  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
```

在仓库 Settings → Pages → Source 选 `GitHub Actions` 即可。

部署到 Vercel / Netlify：

- Build command: `pnpm storybook:build`
- Output directory: `packages/react/storybook-static`
- Install command: `pnpm install --frozen-lockfile`
- Node 版本：20

---

## 9. 部署：Playground 静态站（可选）

playground 比 Storybook 更像「最终用户视角」，适合作为 landing demo。

构建：

```bash
pnpm --filter @adaptive-hover/react build   # 先有 dist
pnpm --filter playground build
```

产物在 `playground/dist/`。部署方式同上，Vercel / Netlify 把 build command 改成上面两条、output 改成 `playground/dist`。

---

## 10. 易遗漏的检查项

发版前过一遍这个 checklist，能避开大多数「事后才发现」的问题：

- [ ] `packages/*/package.json` 的 `version` 是不是预期的（changeset version 后必看）
- [ ] `packages/*/CHANGELOG.md` 条目读起来通顺、面向用户
- [ ] `packages/*/package.json` 的 `files` 字段只包含 `dist`（别打包源码）
- [ ] `packages/*/package.json` 的 `exports` 路径都存在（`pnpm -r build` 后 `ls dist`）
- [ ] `packages/react/package.json` 的 `peerDependencies` 是否仍然合理（react ≥ 18 是否还成立）
- [ ] `packages/react/package.json` 的 `sideEffects` 标了 `**/*.css`（保证 tree-shaking 不误删样式）
- [ ] 新加的 props 在 README 同步更新
- [ ] 新加的行为有对应的 Storybook story
- [ ] breaking change 在 CHANGELOG 顶部用「BREAKING CHANGE:」前缀醒目标注
- [ ] `LICENSE` 文件存在（npm 页面会读；`license` 字段也已在两个包里声明为 MIT）
- [ ] `repository` / `homepage` / `bugs` 字段都已在两个包里设置好（指向 [DingYiWeiJE/Adaptive-Hover-Panel](https://github.com/DingYiWeiJE/Adaptive-Hover-Panel)），换仓库时记得同步

---

## 11. 常见坑

| 现象 | 原因 | 解法 |
| --- | --- | --- |
| `pnpm dev` 改源码没反应 | playground 的 alias 被注释 / 删除了，又退回 dist 模式 | 检查 `playground/vite.config.ts` 的 `resolve.alias` 是否还指向 `packages/*/src` |
| `pnpm changeset publish` 报 401 | 未登录 npm 或 token 过期 | `npm login`，CI 检查 `NPM_TOKEN` |
| `pnpm changeset publish` 报 403 forbidden | scope 包没加 `--access public` 或没权限 | 确认 `.changeset/config.json` 的 `"access": "public"`；确认账号在 scope 下有 publish 权限 |
| 装依赖卡住 | pnpm registry 慢 | 临时换 `pnpm install --registry=https://registry.npmmirror.com`，不要写进 `.npmrc` 避免污染 lock |
| typecheck 红但代码看起来没问题 | `tsbuildinfo` 缓存脏 | `find . -name '*.tsbuildinfo' -delete` 再跑 |
| Storybook 启动报 vite peer 冲突 | vite 必须锁在 `^6.3.5`（vitest 4 和 Storybook 8 的交集） | 别升级 vite |
| `npm publish` 报 `You cannot publish over the previously published versions` | 这个版本号已经存在 | bump 版本号；版本号一旦发出就永远不能复用，即使 unpublish 也不行 |
| jsdom 测试 `userEvent.hover` 卡 5 秒超时 | React 19 + fake timers 下 user-event 微任务死锁 | 改用 `fireEvent.mouseEnter/Leave/Move` |
| Windows 下路径含中文导致工具崩 | 部分工具对非 ASCII 路径不友好 | 把仓库放到纯英文路径下，或在 WSL 里操作 |

---

## 12. 一句话流程速查

```bash
# 开发
pnpm storybook                                            # 改组件，看 src HMR
# 或：
pnpm dev                                                  # 看 playground（也直接 HMR 源码）

# 提交前
pnpm typecheck && pnpm lint && pnpm -r test && pnpm -r build

# 记录改动
pnpm changeset                                            # 选包、选等级、写摘要
git add . && git commit -m "feat(...): ..." && git push   # 走 PR 流程

# 发版（merge 到 main 后）
git switch main && git pull
pnpm changeset version
git add . && git commit -m "chore: release"
pnpm -r build
pnpm changeset publish
git push --follow-tags
```
