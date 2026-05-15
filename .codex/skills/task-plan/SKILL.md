---
name: task-plan
description: Use when converting an approved task file into an implementation plan for this Hybrid App H5 project before any code or documentation changes are made.
---

# Task Plan

## 何时使用

当任务已创建，下一步需要在实现前制定计划时使用。

本 skill 只做计划，不写业务代码。

## 输入

- `.ai/tasks/` 下的任务文件。
- `AGENTS.md`。
- `.ai/AI_CONTEXT.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md`。
- 相关 `docs/*.md`。

## 步骤

1. 读取任务文件和必要上下文。
2. 判断影响范围：
   - Native Bridge
   - Manifest 和发布
   - Theme
   - API
   - Static Bundle
   - UI
   - AI Workflow
3. 列出预计创建或修改的文件。
4. 将计划拆成有序小步骤。
5. 涉及行为变更时，计划中必须包含测试优先或验证优先步骤。
6. 明确不在范围内的事项。
7. 不确定的决策写入计划，不要猜测。
8. 在任务文件中补充 `## 计划` 章节。

## 输出

- 更新后的任务文件，包含：
  - 文件影响列表
  - 有序计划
  - 验证命令
  - 风险
  - 待确认问题
- 不产生业务代码变更。

## 检查清单

- [ ] 计划引用了相关文档。
- [ ] 计划有明确验证路径。
- [ ] 原生兼容风险已说明。
- [ ] 发布和回滚影响已说明。
- [ ] 主题 token 影响已说明。
- [ ] API 契约影响已说明。
- [ ] 未明确要求时排除业务实现。
