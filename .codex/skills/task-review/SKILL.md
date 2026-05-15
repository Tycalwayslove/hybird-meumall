---
name: task-review
description: Use when reviewing task changes for this Hybrid App H5 project before completion, especially to catch scope creep, contract drift, missing docs, or missing verification.
---

# Task Review

## 何时使用

在任务归档前，或用户要求审查已完成变更时使用。

审查重点是正确性、范围控制、文档一致性和验证结果，不添加业务功能。

## 输入

- `.ai/tasks/` 下的任务文件。
- 变更文件。
- 验证结果。
- 相关 `docs/*.md`。
- `.ai/PROJECT_STATE.md` 和 `.ai/CHANGE_SUMMARY.md`。

## 步骤

1. 读取任务目标、范围和验收标准。
2. 将变更文件与计划对比。
3. 检查是否存在范围膨胀：
   - 未请求的业务页面。
   - 未请求的发布行为。
   - 未请求的 Bridge 行为。
   - 未请求的主题行为。
   - 未请求的 API 行为。
4. 检查文档一致性：
   - Bridge 变化更新 `docs/02_NATIVE_BRIDGE_SPEC.md`。
   - Release 变化更新 `docs/03_RELEASE_SPEC.md`。
   - Theme 变化更新 `docs/04_THEME_SPEC.md`。
   - API 变化更新 `docs/05_API_SPEC.md`。
   - Workflow 变化更新 `docs/07_AI_WORKFLOW.md` 或相关 AI 文件。
5. 检查验证证据。
6. 按严重程度列出问题。
7. 无问题时说明剩余风险或测试缺口。

## 输出

- 带文件引用的审查发现。
- 归档前必须修复的问题。
- 明确建议：
  - 可以归档。
  - 需要修复。
  - 需要澄清。

## 审查清单

- [ ] 变更范围匹配任务。
- [ ] 相关文档已更新。
- [ ] 验证结果已记录。
- [ ] AI 状态文件已准备好归档。
- [ ] 未明确要求时没有添加业务代码。
