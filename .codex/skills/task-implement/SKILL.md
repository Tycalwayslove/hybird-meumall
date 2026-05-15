---
name: task-implement
description: Use when executing an approved task plan in this Hybrid App H5 project, after scope, files, and verification steps are already documented.
---

# Task Implement

## 何时使用

仅在任务已有明确范围和计划后使用。

不要用于猜测式开发。除非任务明确要求，不实现业务页面或业务行为。

## 输入

- `.ai/tasks/` 下的已批准任务文件。
- 任务文件中的计划章节。
- `AGENTS.md`。
- `.ai/AI_CONTEXT.md`、`.ai/PROJECT_STATE.md`。
- 相关 `docs/*.md`。

## 步骤

1. 重新读取任务、计划和受影响文档。
2. 确认任务范围和不包含范围。
3. 如果实现改变行为，遵循测试优先：
   - 添加或更新最小有意义测试。
   - 运行测试并确认按预期失败。
   - 实现最小改动。
   - 重新运行验证。
4. 如果任务只改文档或工作流，只编辑请求范围内文件。
5. 保持变更范围和任务一致。
6. 修改 release、bridge、theme 或 API 行为时，同步更新对应文档。
7. 发现后续事项时写入 `.ai/TODO.md`，不要扩大当前任务范围。

## 输出

- 与任务计划匹配的文件变更。
- 必要时更新任务说明。
- 契约或工作流变化时更新相关文档。
- 可交给 `task-test` 的验证结果。

## 约束

- 未明确要求时不写业务代码。
- 非发布准备任务不执行 release build。
- 非回滚任务不修改 rollback。
- 不添加未文档化的 Native Bridge 方法。
- 不硬编码应由 token 控制的主题值。
