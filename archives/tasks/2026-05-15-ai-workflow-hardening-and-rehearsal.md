# 任务：完善 AI 工作流自动化并完成一次实战演练

## 目标

补齐 AI 工作流中缺失的自动化校验、任务计划/验证/审查辅助脚本、发布准备编排脚本，并用本任务完整跑通 `task-create → task-plan → task-implement → task-test → task-review → task-archive` 闭环。

## 标签

- infra
- docs
- release

## 范围

### 包含

- 新增 `scripts/ai/check-workflow.ts`。
- 新增 `scripts/ai/plan-task.ts`。
- 新增 `scripts/ai/test-task.ts`。
- 新增 `scripts/ai/review-task.ts`。
- 新增 `scripts/ai/release-prepare.ts`。
- 增强 `scripts/ai/archive-task.ts`，归档前要求验证和审查通过。
- 更新 `package.json` 的 `ai:*` 命令。
- 更新 `docs/07_AI_WORKFLOW.md`，补充完整流程和脚本入口。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md`、`.ai/CHANGE_SUMMARY.md`、`docs/08_CHANGELOG.md`。
- 创建 `.ai/test-reports/` 验证记录。
- 任务完成后归档本任务文件，作为实战演练记录。

### 不包含

- 业务页面或业务逻辑。
- 真实 CDN、真实发布或真实回滚。
- Next.js 应用初始化。
- 正式业务测试框架选型。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/07_AI_WORKFLOW.md`
  - `docs/03_RELEASE_SPEC.md`
  - `.codex/skills/task-create/SKILL.md`
  - `.codex/skills/task-plan/SKILL.md`
  - `.codex/skills/task-implement/SKILL.md`
  - `.codex/skills/task-test/SKILL.md`
  - `.codex/skills/task-review/SKILL.md`
  - `.codex/skills/task-archive/SKILL.md`
  - `.codex/skills/release-prepare/SKILL.md`
- 相关文件：
  - `scripts/ai/*.ts`
  - `package.json`
  - `.ai/*.md`
  - `docs/07_AI_WORKFLOW.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] `ai:check-workflow` 可运行，并检查文档、Skills、活跃任务、package scripts 和脚本文件。
- [x] `ai:plan-task` 可为任务文件补充计划章节。
- [x] `ai:test-task` 可生成验证记录。
- [x] `ai:review-task` 可生成审查记录。
- [x] `ai:release-prepare` 可一次性生成 `build.json`、`release-note.md`、`manifest.draft.json`。
- [x] `ai:archive-task` 在验证或审查未通过时会非 0 退出。
- [x] `package.json` 暴露新增 `ai:*` 命令。
- [x] `docs/07_AI_WORKFLOW.md` 已描述完整任务闭环。
- [x] 本任务已完成验证、审查并归档。

## 验证

- 命令或人工检查：
  - `npm run ai:check-docs-sync -- --strict`
  - `npm run ai:check-workflow -- --strict`
  - `npm run ai:release-prepare -- --version 0.1.0 --channel qa --rollback-version 0.0.1 --routes /home,/offline --static-routes /offline --artifact dist/h5.zip`
  - `npm run ai:archive-task` 的失败路径和成功路径
  - 所有 `scripts/ai/*.ts` 源码语法解析检查
- 预期结果：
  - 所有正向命令成功。
  - 失败路径非 0 退出。
  - 生成的验证记录和归档记录存在。

## 风险和假设

- 这些脚本仍是本地辅助脚本，不连接真实 CDN。
- `task-plan/test/review` 脚本只做文档辅助，不替代 AI 判断。
- 正式业务测试运行器仍需后续结合 Next.js 项目初始化选择。

## 计划

### 文件影响

- 新增：`scripts/ai/check-workflow.ts`
- 新增：`scripts/ai/plan-task.ts`
- 新增：`scripts/ai/test-task.ts`
- 新增：`scripts/ai/review-task.ts`
- 新增：`scripts/ai/release-prepare.ts`
- 修改：`scripts/ai/archive-task.ts`
- 修改：`package.json`
- 修改：`docs/07_AI_WORKFLOW.md`
- 修改：`.ai/PROJECT_STATE.md`
- 修改：`.ai/TODO.md`
- 修改：`.ai/CHANGE_SUMMARY.md`
- 修改：`docs/08_CHANGELOG.md`

### 步骤

1. 创建本任务文件并写入计划，作为 task-create 和 task-plan 的演练产物。
2. 新增 workflow 自检脚本，覆盖文档、Skills、任务和 package scripts。
3. 新增 task-plan、task-test、task-review 辅助脚本。
4. 新增 release-prepare 编排脚本。
5. 增强 archive-task 的归档前校验。
6. 更新 `package.json` 命令。
7. 更新工作流文档和 AI 状态文件。
8. 运行验证命令并生成测试报告。
9. 进行自查审查，记录审查结果。
10. 满足验收标准后归档本任务。
## 验证记录

- 状态：passed
- 摘要：语法检查、docs sync、workflow check、release-prepare 烟测和 archive-task 失败路径均通过
- 报告：.ai/test-reports/2026-05-15-2026-05-15-ai-workflow-hardening-and-rehearsal-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围符合任务计划；未写业务代码；新增脚本均为本地辅助能力；文档和状态文件已同步
- 报告：.ai/test-reports/2026-05-15-2026-05-15-ai-workflow-hardening-and-rehearsal-review.md

## 归档说明

### 已完成

- 完善 AI 工作流自动化并完成完整任务闭环演练

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过
