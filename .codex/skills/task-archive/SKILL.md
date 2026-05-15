---
name: task-archive
description: Use when a completed and verified task in this Hybrid App H5 project should be closed, recorded, and moved from active task tracking into archives.
---

# Task Archive

## 何时使用

仅在任务已实现、已审查、已验证后使用。

验证失败、范围问题未解决或状态文件未更新时，不归档。

## 输入

- `.ai/tasks/` 下的已完成任务文件。
- `task-test` 的验证结果。
- `task-review` 的审查结果。
- 变更文件列表。
- `.ai/PROJECT_STATE.md`。
- `.ai/CHANGE_SUMMARY.md`。
- `.ai/TODO.md`。
- `docs/08_CHANGELOG.md`。

## 步骤

1. 确认任务可归档：
   - 验收标准已满足。
   - 验证结果已记录。
   - 审查无阻塞问题。
2. 更新 `docs/08_CHANGELOG.md`。
3. 更新 `.ai/PROJECT_STATE.md`。
4. 更新 `.ai/CHANGE_SUMMARY.md`。
5. 更新 `.ai/TODO.md`。
6. 将任务文件移动或复制到 `archives/tasks/YYYY-MM-DD-short-title.md`。
7. `.ai/tasks/` 中只保留活跃任务和 `.gitkeep`。

## 输出

- 更新后的 `docs/08_CHANGELOG.md`。
- 更新后的 `.ai/PROJECT_STATE.md`。
- 更新后的 `.ai/CHANGE_SUMMARY.md`。
- 更新后的 `.ai/TODO.md`。
- `archives/tasks/` 下的归档任务文件。
- 简短归档摘要。

## 归档说明模板

```markdown
## 归档说明

### 已完成

- 

### 验证

- 

### 变更文件

- 

### 后续

- 
```
