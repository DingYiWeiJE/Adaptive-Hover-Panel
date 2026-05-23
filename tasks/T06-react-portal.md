# T06 — React：Portal 组件

## 目标

实现 SSR 安全的 Portal 组件，将浮窗挂载到 `document.body`，避免祖先节点的 `overflow/transform/z-index` 干扰。

## 前置依赖

T02 已完成（`@adaptive-hover/react` 包结构已建好）。

## 需要阅读的文档章节

- [Adaptive Hover Panel 开发文档（React 版）.md](../Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md) 第 7.4、12 节

## 交付物

1. **[packages/react/src/Portal.tsx](../packages/react/src/Portal.tsx)**
   - 默认导出 `Portal` 组件
   - 接受 `{ children: ReactNode }` props
   - 客户端：通过 `createPortal` 挂载到 `document.body`
   - 服务端：返回 `null`，不抛错
   - 用 `useEffect + useState` 延迟挂载（避免 hydration 不匹配）

2. **`packages/react/package.json` devDependencies**
   - `react`、`react-dom`、`@types/react`、`@types/react-dom`（满足 peerDeps）

3. **类型严格**
   - 不得使用 `any`
   - 显式标注 props 类型

## 参考实现框架

```tsx
import { createPortal } from 'react-dom'
import { useEffect, useState, type ReactNode } from 'react'

interface PortalProps {
  children: ReactNode
}

export function Portal({ children }: PortalProps) {
  const [container, setContainer] = useState<HTMLElement | null>(null)

  useEffect(() => {
    setContainer(document.body)
  }, [])

  return container ? createPortal(children, container) : null
}
```

## 约束

- 不要直接在渲染期访问 `document`（SSR 会炸）
- 不要支持自定义挂载点（第一阶段不做，YAGNI）
- 不要做 `key` 处理或多 portal 并存的优化（非本任务范围）

## 验收标准

```bash
pnpm --filter @adaptive-hover/react typecheck
```

通过即可（集成测试会在 T10 覆盖运行时行为）。

手动验证：
- 在 [packages/react/src/Portal.tsx](../packages/react/src/Portal.tsx) 中临时加一个 `renderToString(<Portal><div>x</div></Portal>)` 试调用，应返回空字符串而不抛错（验证后删除临时代码）

## 完成后

1. 更新根目录 [TASKS.md](../TASKS.md)：T06 标记 `[x]` 并填日期
2. 本文件末尾"完成记录"追加偏离决定

## 完成记录

<!-- 完成后在此追加 -->
