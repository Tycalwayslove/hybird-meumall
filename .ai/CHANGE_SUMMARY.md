# 变更摘要

## 2026-05-15 - 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 变更

- 新增本地电商 mock 数据和测试。
- 新增首页、分类页、商品详情页、购物车页和我的页。
- 新增电商共享组件：页面壳、底部导航、商品卡片和色块 icon 占位。
- 新增 `public/static/fallback/` 下的 offline、not-found、error、maintenance 静态 HTML。
- 新增 `config/oss.config.example.json` 和 `.env.example`。
- 更新发布、架构、编码规则和决策文档。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已通过浏览器抽查 `/`、`/category`、`/product/p-1001`、`/cart`、`/profile` 和 `/static/fallback/offline.html`。

### 后续

- 后续可接入真实 icon、真实业务接口和 OSS 上传脚本。

## 2026-05-15 - 创建模拟电商页面与静态资源任务

### 变更

- 新增 `.ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md`。
- 更新 `.ai/TODO.md`，将模拟电商页面、静态缺省页与 OSS 配置模板加入 Active。

### 验证

- 任务创建阶段未修改业务实现。

### 后续

- 按任务计划实现模拟页面、静态缺省资源和 OSS 配置模板。

## 2026-05-15 - 实现监控、白屏检测与性能埋点基础

### 变更

- 新增 `src/lib/telemetry/types.ts`，定义错误、性能、白屏和通用埋点事件类型。
- 新增 `src/lib/telemetry/reporter.ts`，实现 `TelemetryReporter` interface、noop reporter 和 telemetry client。
- 新增 `src/lib/telemetry/white-screen.ts`，实现白屏采样评估纯函数。
- 新增 `src/lib/telemetry/performance.ts`，实现首屏性能事件构造。
- 新增 `src/lib/telemetry/index.ts`，统一导出 telemetry 模块边界。
- 新增 `src/lib/telemetry/telemetry.test.ts`，覆盖事件类型、noop reporter、client 上报、错误归一化、白屏阈值和首屏性能事件。
- 更新 `docs/01_ARCHITECTURE.md`、`docs/06_CODING_RULES.md` 和 `docs/09_DECISIONS.md`，记录 telemetry 边界、白屏策略和首版 noop reporter 决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/telemetry/telemetry.test.ts` 并确认测试因 `./index` 缺失失败。
- 已通过 `pnpm test -- src/lib/telemetry/telemetry.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 Sentry/埋点平台、白屏采样点、采样率和隐私脱敏策略。

## 2026-05-15 - 实现 API Client、鉴权与请求追踪

### 变更

- 新增 `src/lib/api/types.ts`，定义 `ApiResult<T>`、`ApiError`、`RequestMeta`、client 配置和请求选项。
- 新增 `src/lib/api/errors.ts`，实现统一 API 错误构造。
- 新增 `src/lib/api/client.ts`，实现 base URL 拼接、requestId/header 注入、Bridge token 来源、JSON 请求、超时和错误归一化。
- 更新 `src/lib/api/index.ts`，统一导出 API client、错误和类型。
- 新增 `src/lib/api/client.test.ts`，覆盖成功、base URL、requestId、Bridge token、token 缺失、鉴权失败、网络失败和超时。
- 更新 `docs/05_API_SPEC.md` 和 `docs/09_DECISIONS.md`，记录首版 API client 行为和架构决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/api/client.test.ts` 并确认测试因 `./client` 缺失失败。
- 已通过 `pnpm test -- src/lib/api/client.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 base URL、token 刷新、重新登录和原生代理策略。

## 2026-05-15 - 实现 Theme Runtime 与 Light/Dark 切换

### 变更

- 更新 `src/lib/theme/tokens.ts`，新增 light/dark 主题变量和变量 allowlist。
- 新增 `src/lib/theme/runtime.ts`，实现 `getThemeConfig`、`sanitizeThemeVariables` 和 `applyTheme`。
- 更新 `src/lib/theme/index.ts`，统一导出主题 runtime API。
- 更新 `src/styles/globals.css`，补充 `[data-theme="dark"]` CSS fallback。
- 新增 `src/lib/theme/runtime.test.ts`，覆盖 light、dark、fallback、allowlist 和变量应用。
- 更新 `docs/04_THEME_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/theme/runtime.test.ts` 并确认测试因 runtime API 缺失失败。
- 已通过 `pnpm test -- src/lib/theme/runtime.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 后续可补充品牌主题、远程主题拉取、用户偏好持久化和对比度检查。

## 2026-05-15 - 实现 Manifest Schema 与远程配置中心

### 变更

- 新增 `src/config/remote-config.ts`，定义 `ManifestFile`、`AppConfigFile`、`ThemeConfigFile` 和本地校验函数。
- 新增 `src/config/remote-config.test.ts`，覆盖合法 manifest、缺字段、版本黑名单、灰度配置、路由交付、敏感配置拒绝和 theme config。
- 更新 `docs/03_RELEASE_SPEC.md`，记录 manifest/app-config/theme-config 结构、三类版本、不可变资源目录、`latest` 指针和客户端非敏感配置边界。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/remote-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/remote-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 确认 manifest 托管、缓存、灰度归属，以及由 H5 还是原生负责拉取 manifest。

## 2026-05-15 - 实现 Native Bridge 协议与 Web Mock

### 变更

- 新增 `src/lib/bridge/types.ts`，定义首批 Bridge 方法、请求/响应类型、`BridgeResult<T>` 和 `BridgeError`。
- 新增 `src/lib/bridge/errors.ts`，统一 Bridge 错误构造。
- 新增 `src/lib/bridge/web-mock.ts`，提供 Web mock adapter。
- 新增 `src/lib/bridge/native-adapter.ts`，封装 `window.MeumallNativeBridge.call`。
- 更新 `src/lib/bridge/index.ts`，导出 `nativeBridge`、adapter factory、类型和默认边界信息。
- 新增 `src/lib/bridge/bridge.test.ts`，覆盖 Web mock、方法不存在、Bridge 不可用、超时、原生异常和 window adapter。
- 更新 `docs/02_NATIVE_BRIDGE_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/bridge/bridge.test.ts` 并确认测试因能力缺失失败。
- 已通过 `pnpm test -- src/lib/bridge/bridge.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 与原生团队确认最终 namespace、通信协议和首批方法最低 App 版本。

## 2026-05-15 - 创建第一批运行时基础能力任务

### 变更

- 新增 `.ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md`。
- 新增 `.ai/tasks/2026-05-15-manifest-schema-and-remote-config.md`。
- 新增 `.ai/tasks/2026-05-15-theme-runtime-light-dark.md`。
- 新增 `.ai/tasks/2026-05-15-api-client-auth-tracing.md`。
- 新增 `.ai/tasks/2026-05-15-telemetry-white-screen-performance.md`。
- 更新 `.ai/TODO.md`，将第一批基础能力任务加入 Active，并将静态包、离线兜底、业务目录和 UI 组件库事项放入 Backlog。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 逐个使用 `task-plan` 为第一批任务制定实现计划。

## 2026-05-15 - 实现 Root Manifest Resolver

### 变更

- 新增 `src/config/manifest.ts`，导出 `RootManifest`、`GrayRules`、`ResolveH5VersionContext` 和 `resolveH5Version(ctx, manifest)`。
- 新增 `src/config/manifest.test.ts`，覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
- 更新 `docs/03_RELEASE_SPEC.md`，记录本地版本解析优先级和 fallback 规则。
- 更新 `docs/09_DECISIONS.md`，记录 Root Manifest 本地版本解析优先级决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/manifest.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/manifest.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 补充 manifest schema 校验任务，统一字段名和发布平台结构。

## 2026-05-15 - 实现 H5 基础工程架构

### 变更

- 初始化 Next.js App Router、React、TypeScript、Tailwind CSS、pnpm 和 Vitest 工程骨架。
- 新增 `src/app` 最小 App Shell、`src/styles/globals.css` 默认主题变量和 `src/lib/*` 运行时模块边界。
- 新增 Tailwind、PostCSS、Vitest、ESLint、TypeScript 和 Next.js 配置。
- 新增 `.gitignore` 和 `pnpm-lock.yaml`。
- 更新架构、主题、编码规则、AI 工作流、变更记录、决策记录和项目状态。

### 验证

- 已通过 `pnpm install --frozen-lockfile`。
- 已通过 `pnpm build`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm test`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已启动 `pnpm dev`，并通过 `curl -I http://localhost:3000` 确认返回 200。

### 后续

- 使用 `task-test` 和 `task-review` 完成任务验证与审查记录后归档。

## 2026-05-15 - 规划 H5 基础工程架构任务

### 变更

- 更新 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`，补充 `## 计划` 章节。
- 明确基础工程架构任务的影响范围、文件影响、实施步骤、验证计划、风险和待确认问题。

### 验证

- 计划阶段未修改业务代码或工程实现。

### 后续

- 使用 `task-implement` 按计划初始化 Next.js App Router、pnpm、Tailwind 和 Vitest 工程骨架。

## 2026-05-15 - 创建 H5 基础工程架构任务

### 变更

- 新增 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`。
- 将 H5 基础工程架构任务加入 `.ai/TODO.md`。
- 记录已确认技术选型：Next.js App Router、pnpm、Vitest。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 使用 `task-plan` 为 H5 基础工程架构任务制定实现计划。

## 2026-05-15 - 完善 AI 工作流自动化

### 变更

- 新增 `scripts/ai/check-workflow.ts`。
- 新增 `scripts/ai/plan-task.ts`、`scripts/ai/test-task.ts`、`scripts/ai/review-task.ts`。
- 新增 `scripts/ai/release-prepare.ts`，可一次性生成发布草案三件套。
- 增强 `scripts/ai/archive-task.ts`，要求验证和审查通过且验收项完成后才能归档。
- 更新 `package.json`，补充新增 `ai:*` 命令。
- 更新 `docs/07_AI_WORKFLOW.md`，补充完整任务闭环和辅助脚本说明。
- 更新 `.ai/PROJECT_STATE.md` 和 `.ai/TODO.md`。

### 验证

- 已通过 `node` 源码语法解析检查所有 `scripts/ai/*.ts`。
- 已通过 `npm run ai:check-docs-sync -- --strict`。
- 已通过 `npm run ai:check-workflow -- --strict`。
- 已通过新增脚本 help 检查。
- 已通过 `ai:release-prepare` 本地烟测，生成 `build.json`、`release-note.md`、`manifest.draft.json`。
- 已验证 `ai:archive-task` 在验证状态非 passed 时非 0 退出。
- 已通过 `ai:test-task` 和 `ai:review-task` 生成本任务验证/审查记录。

### 后续

- 选择正式业务测试运行器，并在 Next.js 项目初始化后接入。

## 2026-05-15 - 创建 AI 工作流完善与演练任务

### 变更

- 新增 `.ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md`。
- 将 AI 工作流自动化完善任务加入 `.ai/TODO.md`。

### 验证

- 作为本轮完整工作流演练的起点，后续会在任务内记录验证和归档结果。

### 后续

- 按任务计划实现并归档本任务。

## 2026-05-15 - 升级 task-create 为对话式任务创建

### 变更

- 更新 `.codex/skills/task-create/SKILL.md`。
- 明确自然语言输入时先多轮澄清，不立即落盘。
- 增加任务草案确认流程。
- 增加“可以落盘 / 不能落盘”的判断规则。
- 增加对话式示例。

### 验证

- 已检查 `task-create` Skill 包含对话式流程、确认后落盘规则和示例。
- 已运行 `npm run ai:check-docs-sync -- --strict`。

### 后续

- 后续使用 `task-create` 时，应先汇总草案并等待用户确认。

## 2026-05-15 - 中文化协作文档

### 变更

- 将 `AGENTS.md` 和 `docs/*.md` 转换为中文。
- 将 `.ai/*.md` 和当前任务文件转换为中文。
- 将项目级 Codex Skills 转换为中文。
- 保留代码标识符、文件名、命令名、类型名和 JSON 字段英文。

### 验证

- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已运行代表性脚本 `--help` 检查，确认输出中文用法。
- 已完成所有 `scripts/ai/*.ts` 源码语法解析检查。
- 已验证 `generate-diff-summary` 生成中文模板。
- 已验证 `create-task` 缺参时非 0 退出并输出中文错误。

### 后续

- 后续新增协作文档默认使用中文。

## 2026-05-15 - 创建 Root Manifest Resolver 任务

### 变更

- 添加 `.ai/tasks/2026-05-15-root-manifest-version-resolver.md`，用于后续实现 Root Manifest 类型和版本解析函数。
- 将 manifest resolver 任务加入 `.ai/TODO.md`。

### 验证

- 仅创建任务文档，未修改业务代码或实现文件。

### 后续

- 实现前先运行 `task-plan`。

## 2026-05-15 - 添加 AI 辅助脚本骨架

### 变更

- 添加 `scripts/ai/` 下的最小可运行 CLI 脚本。
- 添加共享工具文件 `scripts/ai/_utils.ts`。
- 添加包含 `ai:*` 命令的 `package.json`。

### 验证

- 已运行所有 8 个脚本的 `--help`。
- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已在 `/tmp` 目录完成 diff summary、build JSON、manifest draft、rollback draft 烟测。
- 已确认非法参数会非 0 退出。

### 后续

- 选择测试运行器后添加正式测试。

## 2026-05-15 - 添加项目级 Codex Skills

### 变更

- 添加 `.codex/skills/` 下的任务生命周期、发布准备和回滚 Skills。
- 定义每个 Skill 的输入、步骤和输出。

### 验证

- 已确认 8 个 `SKILL.md` 存在。
- 已确认每个 Skill 包含必需工作流章节。

### 后续

- 用一个示例任务验证 Skills。

## 2026-05-15 - 初始化 AI 工作流文档

### 变更

- 添加项目级 `AGENTS.md`。
- 添加 Hybrid App H5 架构、Bridge、发布、主题、API、编码、AI 工作流、变更记录和决策文档。
- 添加 AI 状态文件和归档目录。

### 验证

- 文档脚手架创建完成。

### 后续

- 确认 Bridge、manifest、主题和静态打包细节。
## 2026-05-15 - 归档任务 2026-05-15-ai-workflow-hardening-and-rehearsal.md

### 变更

- 已将 .ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md 归档到 archives/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md。

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-h5-foundation-architecture.md

### 变更

- 已将 .ai/tasks/2026-05-15-h5-foundation-architecture.md 归档到 archives/tasks/2026-05-15-h5-foundation-architecture.md。

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-root-manifest-version-resolver.md

### 变更

- 已将 .ai/tasks/2026-05-15-root-manifest-version-resolver.md 归档到 archives/tasks/2026-05-15-root-manifest-version-resolver.md。

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-native-bridge-adapter-and-web-mock.md

### 变更

- 已将 .ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md 归档到 archives/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md。

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-manifest-schema-and-remote-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-manifest-schema-and-remote-config.md 归档到 archives/tasks/2026-05-15-manifest-schema-and-remote-config.md。

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-theme-runtime-light-dark.md

### 变更

- 已将 .ai/tasks/2026-05-15-theme-runtime-light-dark.md 归档到 archives/tasks/2026-05-15-theme-runtime-light-dark.md。

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-api-client-auth-tracing.md

### 变更

- 已将 .ai/tasks/2026-05-15-api-client-auth-tracing.md 归档到 archives/tasks/2026-05-15-api-client-auth-tracing.md。

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-telemetry-white-screen-performance.md

### 变更

- 已将 .ai/tasks/2026-05-15-telemetry-white-screen-performance.md 归档到 archives/tasks/2026-05-15-telemetry-white-screen-performance.md。

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-commerce-mock-pages-static-fallback-oss-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md 归档到 archives/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md。

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过

### 后续

- 暂无。
