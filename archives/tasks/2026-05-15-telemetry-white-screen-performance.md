# 任务：监控、白屏检测与性能埋点基础

## 目标

建立 WebView H5 的基础可观测能力边界，包括错误监控、白屏检测、首屏性能和埋点事件类型，为后续接入 Sentry、原生埋点或内部监控平台预留统一入口。

## 标签

- infra

## 范围

### 包含

- 创建 `telemetry` 模块边界。
- 定义错误事件、性能事件、白屏事件和通用埋点事件类型。
- 实现本地 noop reporter。
- 预留 Sentry 或原生 `trackEvent` 接入点。
- 定义白屏检测基础策略。
- 定义首屏性能采集基础指标。
- 增加 telemetry 类型和 reporter 单元测试。
- 更新 `docs/01_ARCHITECTURE.md` 或新增监控相关章节。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不接真实 Sentry。
- 不接真实埋点平台。
- 不接真实 Native Bridge `trackEvent`。
- 不上报用户敏感信息。
- 不实现可视化监控后台。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/02_NATIVE_BRIDGE_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - 待创建：`src/lib/telemetry/*`
  - 待创建：`src/lib/telemetry/**/*.test.ts`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] telemetry 模块边界存在。
- [x] 错误事件、性能事件、白屏事件和通用埋点事件类型已定义。
- [x] noop reporter 已实现。
- [x] Sentry 或原生 `trackEvent` 接入点已预留。
- [x] 白屏检测基础策略已文档化。
- [x] 单元测试覆盖 reporter 和事件类型约束。
- [x] 架构或监控文档已同步。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 测试、类型检查、lint 和工作流检查通过。

## 风险和假设

- 首版只做本地 noop reporter，不发送真实网络请求。
- 真实 Sentry DSN、埋点平台和隐私合规要求尚未确认。
- 白屏检测阈值和采样率需要后续结合真实页面调整。

## 计划

### 影响范围

- Telemetry：新增 `src/lib/telemetry` 模块边界、事件类型、noop reporter、client 入口和白屏评估策略。
- Bridge：不新增真实 `trackEvent` 方法，只通过 reporter interface 预留原生/Sentry 接入点。
- 文档：更新架构文档中的 Telemetry 模块职责、白屏检测策略和首屏性能指标。
- AI 工作流：更新状态、变更摘要、TODO、changelog 和验证报告。

### 预计文件

- 待创建：`src/lib/telemetry/types.ts`
- 待创建：`src/lib/telemetry/reporter.ts`
- 待创建：`src/lib/telemetry/white-screen.ts`
- 待创建：`src/lib/telemetry/performance.ts`
- 待创建：`src/lib/telemetry/index.ts`
- 待创建：`src/lib/telemetry/telemetry.test.ts`
- `docs/01_ARCHITECTURE.md`
- `.ai/PROJECT_STATE.md`
- `.ai/CHANGE_SUMMARY.md`
- `.ai/TODO.md`
- `docs/08_CHANGELOG.md`
- `.ai/test-reports/2026-05-15-telemetry-white-screen-performance.md`

### 步骤

1. 使用测试优先方式，先覆盖 noop reporter、client 上报、事件类型、白屏评估和首屏性能事件构造。
2. 确认测试因 telemetry 模块未实现而失败。
3. 实现最小 telemetry 模块：
   - 错误事件、性能事件、白屏事件和通用埋点事件类型。
   - `TelemetryReporter` interface 和 noop reporter。
   - `createTelemetryClient`，统一注入上下文和 timestamp。
   - `evaluateWhiteScreen(samples, options)` 纯函数策略。
   - `createFirstScreenPerformanceEvent(metrics, options)` 事件构造。
4. 更新架构文档，说明首版只本地 noop，不发送网络请求，不采集敏感信息。
5. 运行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict`。
6. 记录验证报告，更新 AI 状态文件，审查通过后归档任务。

### 不在本任务内

- 不接真实 Sentry。
- 不接真实原生埋点平台。
- 不新增 Native Bridge `trackEvent` 方法。
- 不做 DOM 采样实现或监控后台。
## 验证记录

- 状态：passed
- 摘要：telemetry 单测、全量测试、类型检查、lint 和 AI 工作流检查均通过
- 报告：.ai/test-reports/2026-05-15-2026-05-15-telemetry-white-screen-performance-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围与任务一致，未接真实 Sentry、原生埋点或业务监控后台，架构文档和状态文件已同步
- 报告：.ai/test-reports/2026-05-15-2026-05-15-telemetry-white-screen-performance-review.md

## 归档说明

### 已完成

- 实现监控、白屏检测与性能埋点基础

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
