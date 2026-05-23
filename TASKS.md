# TASKS — Adaptive Hover Panel 总任务索引

> 配套文档：[Adaptive Hover Panel 开发文档（React 版）.md](Adaptive%20Hover%20Panel%20%E5%BC%80%E5%8F%91%E6%96%87%E6%A1%A3%EF%BC%88React%20%E7%89%88%EF%BC%89.md)
>
> **使用方式**：
> 1. 每个子任务对应 `tasks/` 下一个独立 md 文件
> 2. 每次开新对话时，让 Claude 读取对应的子任务文件去执行
> 3. 任务完成后，更新本文件的 `[ ]` 为 `[x]` 并填入完成日期
> 4. 严格按依赖顺序执行，跳跃需注意依赖关系

## 进度总览

| 状态 | 编号 | 任务                                | 依赖             | 完成日期 |
| ---- | ---- | ----------------------------------- | ---------------- | -------- |
| [x]  | T01  | [Monorepo 骨架](tasks/T01-monorepo-skeleton.md)                          | —                | 2026-05-23 |
| [x]  | T02  | [公共配置（tsconfig/lint/format）](tasks/T02-shared-config.md)            | T01              | 2026-05-23 |
| [x]  | T03  | [Core：类型 + 常量 + clamp](tasks/T03-core-types-utils.md)                | T02              | 2026-05-23 |
| [x]  | T04  | [Core：calculateLayout 算法](tasks/T04-core-calculate-layout.md)          | T03              | 2026-05-23 |
| [x]  | T05  | [Core：单元测试](tasks/T05-core-unit-tests.md)                            | T04              | 2026-05-23 |
| [x]  | T06  | [React：Portal 组件](tasks/T06-react-portal.md)                           | T02              | 2026-05-23 |
| [x]  | T07  | [React：状态机 + Hook](tasks/T07-react-hook.md)                           | T03, T04, T06    | 2026-05-23 |
| [x]  | T08  | [React：AdaptiveHoverPanel 组件](tasks/T08-react-component.md)            | T06, T07         | 2026-05-23 |
| [x]  | T09  | [React：样式系统](tasks/T09-react-styles.md)                              | T08              | 2026-05-23 |
| [x]  | T10  | [React：集成测试](tasks/T10-react-integration-tests.md)                   | T08              | 2026-05-23 |
| [x]  | T11  | [Playground 调试沙箱](tasks/T11-playground.md)                            | T08, T09         | 2026-05-23 |
| [x]  | T12  | [Storybook 场景](tasks/T12-storybook.md)                                  | T11              | 2026-05-23 |
| [x]  | T13  | [构建发布配置](tasks/T13-build-publish.md)                                | T08, T09, T10    | 2026-05-23 |

## 依赖关系图

```
T01 ─► T02 ─┬─► T03 ─► T04 ─► T05
            │
            ├─► T06 ─┐
            │        ├─► T07 ─► T08 ─┬─► T09 ─┐
            │        │               │        ├─► T11 ─► T12
            │        │               │        │
            │        │               ├─► T10 ─┤
            │        │               │        │
            │        │               └────────┴─► T13
```

## 新对话起手模板

每开一个新对话执行子任务时，建议这样起头：

```
请阅读以下文件后开始工作：
1. tasks/T0X-xxx.md（当前任务定义）
2. Adaptive Hover Panel 开发文档（React 版）.md（任务定义中标注的对应章节）

要求：
- 严格按子任务文件中的"交付物"清单实现
- 不要超出任务范围做其他事
- 完成后按"验收标准"自检并把命令输出贴出来
- 完成后更新 TASKS.md：把对应任务的 [ ] 改为 [x] 并填上今天日期
```

## 完成标记说明

- `[ ]` 未开始
- `[~]` 进行中（多次会话才能完成的大任务）
- `[x]` 已完成并验收通过
- `[!]` 已完成但有遗留问题（在任务 md 末尾记录）
