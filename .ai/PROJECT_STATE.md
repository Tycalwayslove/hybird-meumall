# 项目状态

## 当前阶段

AI 工程化工作流初始化和基础工具建设。

## 已实现

- Hybrid App H5 架构文档脚手架。
- AI 工作流状态文件。
- 已完成任务和发布记录归档目录。
- AI 脚本和测试报告占位目录。
- 项目级 Codex Skills：任务创建、规划、实现、测试、审查、归档、发布准备和回滚。
- `scripts/ai/` 下的最小可运行 AI 辅助脚本。
- 包含 `ai:*` 命令的最小 `package.json`。
- 面向协作的文档、任务和 Skill 已转换为中文。
- `task-create` Skill 已升级为对话式任务创建流程：自然语言输入、多轮澄清、草案确认后落盘。
- AI 工作流自动化已补充 `check-workflow`、`plan-task`、`test-task`、`review-task`、`release-prepare` 等脚本。
- `archive-task` 已增强为验证和审查通过后才能归档。

## 尚未实现

- 业务页面。
- Native Bridge runtime adapter。
- manifest parser 或 release runtime。
- theme runtime module。
- API client。
- 静态导出和原生打包流水线。
- 正式测试体系。
- 真实 CDN 集成。

## 当前约束

- 业务实现必须通过任务流推进。
- 修改 release、bridge、theme、api 时必须同步更新对应文档。
- 回滚流程只能修改 manifest 草案，不重新构建资源。
- 发布准备流程必须生成 `build.json`、`release-note.md` 和 `manifest.draft.json` 草案。
- AI 辅助脚本当前只做本地骨架，不连接真实 CDN。
- 协作文档使用中文；代码标识符、文件名、命令名保留英文。
- 使用 `task-create` 时，用户可先用自然语言描述需求；AI 必须先澄清并输出草案，用户确认后才创建任务文件。
- 发布准备和回滚脚本仅生成或修改本地草案，不发布真实资源。

## 已知风险

- Native Bridge 契约尚未与 iOS 和 Android 团队确认。
- manifest 托管和灰度归属尚未确定。
- 静态打包路由列表尚未确定。
- 主题 token 来源和归属尚未确定。
- 正式业务测试运行器尚未确定；AI 工作流脚本使用本地命令和记录文件验证。

## 下一步建议

1. 使用 `task-plan` 为 Root Manifest 版本解析任务制定实现计划。
2. 确认 Native Bridge namespace、通信方式和首批方法。
3. 定义 manifest schema 归属、托管位置和缓存策略。
4. 确认首批需要静态打包的路由。
5. 定义主题 token 集合和 Tailwind 映射。
6. 在业务实现前确定源码目录结构。
7. 选择正式业务测试运行器，并在 Next.js 项目初始化后接入。
## 2026-05-15 任务归档

- 归档任务：2026-05-15-ai-workflow-hardening-and-rehearsal.md
- 摘要：完善 AI 工作流自动化并完成完整任务闭环演练
