# AGENTS.md

本文件定义 AI Agent 在本 Hybrid App H5 项目中的工作约定。

## 项目背景

- 运行环境：H5 页面运行在原生 App WebView 中。
- 技术栈：Next.js、React、TypeScript、Tailwind CSS。
- 交付模式：
  - 远程 WebView 加载。
  - 部分静态页面随原生 App 打包。
- 核心能力：
  - 通过 manifest 控制版本、灰度、回滚和页面资源路由。
  - 通过 Tailwind CSS + CSS Variables 支持动态换肤。
  - 支持 Native Bridge。
  - 支持 Codex 通过任务流持续开发。

## 不可违反的规则

1. 除非当前任务明确要求，不实现业务功能。
2. 修改发布、Bridge、主题或路由行为时，必须同步更新相关文档。
3. 不覆盖用户已有修改。编辑前先读取当前文件状态。
4. 变更要小、可审查，并尽量绑定到任务文件。
5. 优先遵循项目已有约定，不随意引入新模式。
6. 架构决策记录到 `docs/09_DECISIONS.md`。

## 每次任务开始前必须读取

按顺序读取：

1. `.ai/AI_CONTEXT.md` - AI 持久上下文。
2. `.ai/PROJECT_STATE.md` - 当前实现状态和约束。
3. `.ai/TODO.md` - 当前待办和优先级。
4. `docs/00_PROJECT_OVERVIEW.md` - 项目和运行时概览。
5. `docs/01_ARCHITECTURE.md` - 架构边界和交付模型。
6. `.ai/tasks/` 下的相关任务文件。

如果任务涉及以下领域，还必须读取：

- Native Bridge：`docs/02_NATIVE_BRIDGE_SPEC.md`
- manifest、灰度、回滚、打包：`docs/03_RELEASE_SPEC.md`
- 主题、Tailwind、CSS Variables：`docs/04_THEME_SPEC.md`
- API 契约或请求行为：`docs/05_API_SPEC.md`
- 代码风格、目录结构、测试：`docs/06_CODING_RULES.md`
- AI 工作流、任务格式、交接：`docs/07_AI_WORKFLOW.md`

## 每次任务完成后必须更新

根据任务影响范围更新：

1. `.ai/PROJECT_STATE.md`
   - 更新当前状态、已实现模块、已知缺口和约束。
2. `.ai/CHANGE_SUMMARY.md`
   - 记录变更摘要、涉及文件和验证结果。
3. `.ai/TODO.md`
   - 标记完成项，补充新发现的后续任务。
4. `docs/08_CHANGELOG.md`
   - 记录对项目可见的工作流、架构或功能变更。
5. `docs/09_DECISIONS.md`
   - 记录架构或流程决策，以及被拒绝的备选方案。
6. `.ai/test-reports/`
   - 记录测试、构建、截图或人工验证结果。

如果任务来自 `.ai/tasks/`，完成后将任务记录移动或复制到 `archives/tasks/`，并补充完成说明。

## 标准任务流程

1. 理解任务。
   - 读取上下文文件。
   - 判断影响范围：release、bridge、theme、api、ui、static packaging 或 workflow。
2. 制定计划。
   - 控制范围。
   - 明确需要一起修改的文档和源码文件。
3. 只实现任务要求的内容。
   - 避免猜测式抽象。
   - 未明确要求时，不创建业务页面。
4. 验证。
   - 运行最小但有意义的验证命令。
   - 无自动化测试时记录人工验证。
5. 更新 AI 状态。
   - 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md`。
6. 汇报。
   - 总结变更文件、验证结果和建议的下一步。

## 任务文件模板

`.ai/tasks/` 下的任务文件使用以下格式：

```markdown
# 任务：<短标题>

## 目标

<本任务要完成什么。>

## 范围

- 包含：
- 不包含：

## 上下文

- 相关文档：
- 相关文件：

## 验收标准

- [ ] 标准 1
- [ ] 标准 2

## 验证

- 命令：
- 预期结果：

## 备注

<风险、假设和后续事项。>
```

## 发布约束

- manifest 变更必须说明版本、渠道、灰度、回滚和资源兼容性。
- 静态打包页面必须声明所需原生 App 版本或能力。
- 依赖 Bridge 的能力必须说明原生方法不可用时的 fallback 行为。

## 主题约束

- 主题变更必须定义 CSS Variable 名称、默认值、fallback 和 Tailwind 使用方式。
- 不硬编码应由主题 token 控制的颜色。
- 涉及主题时验证 light、dark 和品牌主题。

## Native Bridge 约束

- 每个 Bridge API 必须定义方法名、参数、响应、错误、超时、平台支持和 fallback。
- H5 调用 Bridge 前必须做能力检测。
- Native Bridge 变更必须向后兼容，或提供迁移方案。

## 文档归属

文档是产品契约的一部分。当实现和文档不一致时，将其视为缺陷，并尽量在同一任务中修正。
