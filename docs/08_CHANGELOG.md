# 08 变更记录

所有重要的项目、工作流、架构、发布、Bridge、主题和 API 变更都记录在这里。

## 格式

```markdown
## YYYY-MM-DD - <标题>

### 新增

### 变更

### 废弃

### 移除

### 修复

### 安全

### 验证
```

## Unreleased

### 新增

- 初始化 Hybrid App H5 AI 工程化工作流文档结构。
- 添加项目级 Codex Skills：任务创建、规划、实现、测试、审查、归档、发布准备和回滚。
- 添加 `scripts/ai/` 下的最小可运行 AI 辅助脚本，以及 `package.json` 的 `ai:*` 命令。
- 添加 AI 工作流自检、任务计划、任务验证、任务审查和发布准备编排脚本。
- 初始化 Next.js App Router、React、TypeScript、Tailwind CSS 和 Vitest 基础工程骨架。
- 添加 `src/app`、`src/lib/*`、`src/styles` 等首版源码边界。
- 添加 CSS Variables 默认主题 token 和 Tailwind token 映射。
- 添加 Root Manifest 类型、灰度规则类型和 `resolveH5Version(ctx, manifest)` 版本解析函数。
- 添加类型化 Native Bridge adapter、Web mock、首批 Bridge 方法和统一错误结构。
- 添加 manifest、app-config、theme-config 类型和本地 schema 校验函数。
- 添加 light/dark 主题 token、主题 allowlist 和运行时应用 API。
- 添加 API Client 类型、request wrapper、Bridge token 来源、requestId 注入、超时和错误归一化。
- 添加 telemetry 事件类型、noop reporter、白屏检测策略和首屏性能事件构造。
- 添加电商模拟页面、静态缺省 HTML 和 OSS 配置模板。
- 添加 commitlint 和 husky，接入 Git 提交信息规范检查。

### 变更

- 将面向协作的项目文档、AI 状态文档、任务文件和 Skill 文档转换为中文。
- 将 `task-create` Skill 升级为对话式任务创建流程，支持自然语言输入、多轮澄清、草案确认后落盘。
- 增强 `archive-task`，要求验证和审查通过后才能归档任务。
- 使用 `pnpm` 作为应用工程包管理器。
- 使用 Vitest 作为首版测试运行器。
- 补充本地 manifest resolver 的优先级和 fallback 发布规则。
- 补充 Native Bridge 首版 H5 adapter 协议、默认 namespace、Web mock 和方法契约。
- 补充 H5/App/config 三类版本、不可变资源目录、`latest` 指针和客户端非敏感配置边界。
- 补充 light/dark 主题 runtime、fallback 和 allowlist 规则。
- 补充 API client 首版请求规则、错误码、鉴权 token 来源和可注入请求边界决策。
- 补充 telemetry 模块边界、白屏检测基础策略、首屏性能指标和 noop reporter 决策。
- 补充模拟电商路由、静态 fallback 资源和 OSS 配置模板说明。
- 补充 Conventional Commits 提交格式、中文描述规则和本地检查命令。

### 废弃

- 无。

### 移除

- 无。

### 修复

- 无。

### 安全

- 无。

### 验证

- 已确认项目级 Codex Skills 存在并包含必需工作流章节。
- 已确认 AI 辅助脚本支持 help、参数校验、本地烟测和非法参数非 0 退出。
- 本轮使用 AI 工作流自动化完善任务完成一次完整闭环演练。
- 已通过 `pnpm install --frozen-lockfile`、`pnpm build`、`pnpm typecheck`、`pnpm lint`、`pnpm test` 和 `pnpm run ai:check-workflow --strict`。
- 已通过 `pnpm test -- src/config/manifest.test.ts`、`pnpm test`、`pnpm typecheck` 和 `pnpm lint`。
- 已通过 Bridge adapter 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过远程配置 schema 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 theme runtime 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 API client 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过 telemetry 单测、全量测试、类型检查、lint 和 AI 工作流检查。
- 已通过电商 mock 数据和 OSS 配置模板单测。
- 已通过模拟电商页面全量测试、类型检查、lint、生产构建、AI 工作流检查和浏览器抽查。
- 已通过 commitlint 正反向样例、husky commit-msg hook、全量测试、类型检查、lint、生产构建和 AI 工作流检查。
## 2026-05-15 - 归档任务

### 变更

- 完善 AI 工作流自动化并完成完整任务闭环演练

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过
## 2026-05-15 - 归档任务

### 变更

- 初始化 H5 基础工程架构

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Root Manifest 类型和 resolveH5Version(ctx, manifest)

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Native Bridge 协议与 Web Mock

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Manifest Schema 与远程配置中心类型

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 Theme Runtime 与 Light/Dark 切换

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现 API Client、鉴权与请求追踪基础

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现监控、白屏检测与性能埋点基础

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
## 2026-05-15 - 归档任务

### 变更

- 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过
