# 任务：Manifest Schema 与远程配置中心

## 目标

在已有 `resolveH5Version(ctx, manifest)` 基础上，补充 manifest schema 校验和远程配置中心基础类型，明确 H5 版本、App 版本、配置版本、灰度、回滚、远程配置和主题配置的契约。

## 标签

- release
- infra

## 范围

### 包含

- 定义 manifest schema 类型和校验函数。
- 对齐并记录 `stableVersion`、`grayVersion`、`forceVersion`、`rollbackVersion`、`blacklistVersions` 与现有 release 文档模板的关系。
- 定义三类版本：
  - App 原生版本
  - H5 版本
  - 配置版本
- 定义远程配置文件类型：
  - `manifest.json`
  - `app-config.json`
  - `theme.json`
- 记录不可变 H5 版本目录、`latest` 指针、灰度和回滚约束。
- 定义浏览器可见配置与敏感配置边界。
- 增加 schema 校验单元测试。
- 更新 `docs/03_RELEASE_SPEC.md`。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不接入真实 CDN。
- 不实现真实网络拉取。
- 不修改发布脚本为真实发布。
- 不实现静态包构建流水线。
- 不实现后台配置平台。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/03_RELEASE_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `src/config/manifest.ts`
  - 待创建：`src/config/*.ts`
  - 待创建：`src/config/**/*.test.ts`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] manifest schema 类型已定义。
- [x] schema 校验函数已实现。
- [x] H5/App/config 三类版本字段已定义。
- [x] `manifest.json`、`app-config.json`、`theme.json` 类型已定义。
- [x] 非敏感客户端配置边界已记录。
- [x] schema 单元测试覆盖合法、缺字段、版本黑名单、灰度配置和 fallback 场景。
- [x] `docs/03_RELEASE_SPEC.md` 已同步 schema 和远程配置约束。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 测试、类型检查、lint 和工作流检查通过。

## 风险和假设

- manifest 字段命名需要在本任务中与现有 resolver 和 release 文档统一。
- 配置中心只定义前端可消费的非敏感配置；敏感信息不得进入客户端 bundle。
- 真实托管地址、CDN 缓存和发布归属仍需后续确认。

## 计划

### 影响范围

- Manifest 和发布：新增 manifest schema 类型、远程配置类型和本地校验函数。
- Native Bridge：不涉及真实 Bridge 调用，仅在配置类型中允许声明所需 Bridge capability 名称。
- Theme：只定义 `theme.json` 类型，不实现主题 runtime 或远程拉取。
- API：只定义 app config 中的公开 API base URL，不实现 API client。
- Static Bundle：只定义 routes delivery 类型，不实现 `output: "export"` 或构建流水线。
- UI：不涉及。
- AI Workflow：更新任务状态、变更摘要、changelog、验证记录和归档记录。

### 行为约定

- `RootManifest` 继续沿用 resolver 字段：`stableVersion`、`grayVersion`、`forceVersion`、`rollbackVersion`、`blacklistVersions`、`grayRules`。
- schema 层新增元信息：`schemaVersion`、`appId`、`configVersion`、`environment`、`assets`、`routes`、`remoteConfig`。
- `ManifestFile` 表示可发布的 `manifest.json`，并兼容 `resolveH5Version(ctx, manifest)`。
- `AppConfigFile` 仅允许客户端可见非敏感配置，例如 feature flags、public API base URL、最低 App/H5 版本。
- `ThemeConfigFile` 只定义远程主题 JSON 结构，不应用主题。
- 本任务实现本地结构校验，不引入第三方 schema 库。

### 文件影响

- 新增或修改源码：
  - `src/config/manifest.ts`
  - `src/config/remote-config.ts`
  - `src/config/remote-config.test.ts`
- 更新文档和 AI 状态：
  - `docs/03_RELEASE_SPEC.md`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `.ai/test-reports/2026-05-15-manifest-schema-and-remote-config.md`
  - `docs/08_CHANGELOG.md`

### 实施步骤

1. 先写 `src/config/remote-config.test.ts`，覆盖合法 manifest、缺字段、版本黑名单、灰度配置、routes delivery、敏感配置拒绝和 theme config 校验。
2. 运行测试，确认因模块缺失或校验函数缺失失败。
3. 实现 `src/config/remote-config.ts`，定义 `ManifestFile`、`AppConfigFile`、`ThemeConfigFile`、`validateManifestFile`、`validateAppConfigFile`、`validateThemeConfigFile`。
4. 如有必要更新 `src/config/manifest.ts` 的类型导出，保持 resolver 行为不变。
5. 运行 targeted test、全量测试、类型检查、lint 和工作流检查。
6. 更新 `docs/03_RELEASE_SPEC.md`，记录 manifest/config/theme 文件结构、版本字段和客户端敏感信息边界。
7. 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
8. 生成 `.ai/test-reports/2026-05-15-manifest-schema-and-remote-config.md`。

### 验证计划

- `pnpm test -- src/config/remote-config.test.ts`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm run ai:check-workflow --strict`

### 风险

- 远程配置中心真实字段和托管方式尚未确认；本任务先定义 H5 可消费的本地契约。
- 不使用第三方 schema 库会让校验能力保持轻量，但复杂 schema 表达需要后续扩展。
- `manifest.json` 与发布平台最终字段若不一致，后续需要迁移任务统一。

### 待确认问题

- `manifest.json` 最终由 H5 拉取、原生拉取，还是二者都拉取。
- 远程配置文件最终托管域名、缓存策略和发布责任人。
## 验证记录

- 状态：passed
- 摘要：TDD 红绿流程完成；remote config schema 单测、全量测试、类型检查、lint 和工作流检查均通过。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-manifest-schema-and-remote-config-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围匹配任务计划；只定义 manifest/app-config/theme-config 类型和本地校验，未接真实 CDN、网络拉取或发布流水线；发布文档和 AI 状态已同步，可以归档。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-manifest-schema-and-remote-config-review.md

## 归档说明

### 已完成

- 实现 Manifest Schema 与远程配置中心类型

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
