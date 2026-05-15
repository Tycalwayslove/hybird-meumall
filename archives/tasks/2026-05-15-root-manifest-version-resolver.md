# 任务：实现 Root Manifest 类型和版本解析函数

## 目标

实现 Root Manifest 类型定义和 `resolveH5Version(ctx, manifest)` 函数，用于根据 stable、gray、force、blacklist 和 rollback 字段解析最终生效的 H5 版本。

## 标签

- release
- infra

## 范围

### 包含

- 新增 `src/config/manifest.ts`。
- 定义并导出 `RootManifest` 类型。
- 定义并导出 `GrayRules` 类型。
- 为 `resolveH5Version(ctx, manifest)` 定义类型化上下文。
- 实现并导出 `resolveH5Version(ctx, manifest)`。
- 支持以下 manifest 字段：
  - `stableVersion`
  - `grayVersion`
  - `forceVersion`
  - `blacklistVersions`
  - `rollbackVersion`
- 增加版本解析函数的单元测试。
- 更新 `docs/08_CHANGELOG.md`。
- 更新 `.ai/CHANGE_SUMMARY.md`。

### 不包含

- 业务页面或业务 UI。
- 真实 CDN 集成。
- manifest 拉取、缓存或发布。
- 原生 App 集成。
- 静态包构建流水线。
- 灰度服务集成。
- 运行时埋点。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/03_RELEASE_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - 待创建：`src/config/manifest.ts`
  - 待创建：单元测试文件，具体路径按后续选定测试运行器和目录约定决定
  - `docs/08_CHANGELOG.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/PROJECT_STATE.md`，如果实现改变项目状态
  - `.ai/TODO.md`，如果发现后续任务

## 验收标准

- [x] `src/config/manifest.ts` 存在。
- [x] `RootManifest` 类型已导出。
- [x] `GrayRules` 类型已导出。
- [x] `resolveH5Version(ctx, manifest)` 已导出。
- [x] resolver 支持 `stableVersion`。
- [x] resolver 支持 `grayVersion`。
- [x] resolver 支持 `forceVersion`。
- [x] resolver 支持 `blacklistVersions`。
- [x] resolver 支持 `rollbackVersion`。
- [x] 单元测试覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
- [x] `docs/08_CHANGELOG.md` 已更新。
- [x] `.ai/CHANGE_SUMMARY.md` 已记录变更文件和验证结果。

## 验证

- 命令或人工检查：
  - 运行 manifest resolver 的单元测试命令。
  - 如果项目已有 TypeScript 检查命令，运行类型检查。
- 预期结果：
  - manifest resolver 测试通过。
  - 可用时类型检查通过。
  - 文档更新存在。

## 风险和假设

- 项目尚未建立正式测试运行器；实现前应选择最小合理测试方案，或记录为阻塞。
- 灰度规则匹配维度尚未最终确定；规划时保持 `GrayRules` 最小化并记录假设。
- `forceVersion` 相对 gray 和 stable 的优先级需要在规划时明确。
- `blacklistVersions` 命中时应选择哪个版本，需要在规划时明确。
- `rollbackVersion` 是主动生效，还是仅在目标版本非法或命中黑名单时使用，需要在规划时明确。

## 计划

### 影响范围

- Manifest 和发布：新增 Root Manifest 类型和本地版本解析函数，不实现 manifest 拉取、缓存、发布、灰度服务或 CDN 集成。
- Native Bridge：不涉及。
- Theme：不涉及。
- API：不涉及。
- Static Bundle：不涉及。
- UI：不涉及。
- AI Workflow：更新任务状态、变更摘要、changelog、验证记录和归档记录。

### 行为约定

- `stableVersion` 是默认安全版本，作为 resolver 的基础 fallback。
- `grayVersion` 只在 `grayRules` 命中时生效；第一版 `GrayRules` 支持 `includeUserIds`、`excludeUserIds`、`percentage`、`salt`、`platforms`、`minAppVersion`、`maxAppVersion`。
- `forceVersion` 优先级高于灰度和稳定版，用于强制切到指定版本。
- `rollbackVersion` 不因字段存在而自动生效；仅在当前版本或候选版本命中 `blacklistVersions` 时作为优先 fallback。
- `blacklistVersions` 命中候选版本时，按 `rollbackVersion`、`stableVersion` 的顺序选择非黑名单版本。
- 如果所有 fallback 都不可用，返回 `stableVersion`，并保持该异常情况由后续 schema 校验任务处理。

### 文件影响

- 新增实现：
  - `src/config/manifest.ts`
- 新增测试：
  - `src/config/manifest.test.ts`
- 更新文档和 AI 状态：
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `.ai/test-reports/2026-05-15-root-manifest-version-resolver.md`
  - `docs/03_RELEASE_SPEC.md`
  - `docs/08_CHANGELOG.md`

### 实施步骤

1. 先写 `src/config/manifest.test.ts`，覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
2. 运行针对 manifest 的 Vitest，确认测试因模块缺失或实现缺失而失败。
3. 实现 `src/config/manifest.ts`，导出 `RootManifest`、`GrayRules`、`ResolveH5VersionContext` 和 `resolveH5Version(ctx, manifest)`。
4. 保持实现纯函数化，不读取浏览器、网络、环境变量或原生能力。
5. 重新运行 manifest 单测、全量测试、类型检查和 lint。
6. 更新 `docs/03_RELEASE_SPEC.md`，记录本地 resolver 第一版优先级和 fallback 行为。
7. 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
8. 生成 `.ai/test-reports/2026-05-15-root-manifest-version-resolver.md`。

### 验证计划

- `pnpm test -- src/config/manifest.test.ts`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm run ai:check-workflow --strict`

### 风险

- 灰度规则最终口径尚未与发布平台确认；本任务只提供本地纯函数版本，后续 schema 和发布服务对齐时可能需要扩展。
- 字段名与 `docs/03_RELEASE_SPEC.md` 中 manifest 模板存在差异；本任务按已批准任务文件的 `stableVersion`、`grayVersion`、`forceVersion`、`blacklistVersions`、`rollbackVersion` 实现，并在 release 文档中说明。
- 当前不做外部输入 schema 校验；schema 校验已作为后续 TODO 保留。

### 待确认问题

- 后续 manifest schema 是否统一采用任务中的字段名，还是迁移为 release 文档模板中的 `activeVersion`、`rollout` 结构。
## 验证记录

- 状态：passed
- 摘要：TDD 红绿流程完成；manifest resolver 单测、全量测试、类型检查、lint 和工作流检查均通过。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-root-manifest-version-resolver-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围匹配任务计划；只实现本地 manifest resolver，未引入真实发布、CDN、原生或业务逻辑；发布文档和 AI 状态已同步，可以归档。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-root-manifest-version-resolver-review.md

## 归档说明

### 已完成

- 实现 Root Manifest 类型和 resolveH5Version(ctx, manifest)

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
