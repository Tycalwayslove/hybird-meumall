# 任务：API Client、鉴权与请求追踪

## 目标

建立统一 API client 基础，定义请求元信息、错误归一化、鉴权 token 来源和 requestId 注入规则，为后续业务接口提供一致请求边界。

## 标签

- api
- infra

## 范围

### 包含

- 定义 `ApiResult<T>`、`ApiError`、`RequestMeta`。
- 实现基础 request wrapper。
- 支持 base URL 配置。
- 支持 requestId 注入。
- 预留 `user.getToken` Bridge token 来源。
- 定义 token 缺失、鉴权失败、网络失败和超时错误结构。
- 定义请求取消或超时策略。
- 增加 API client 单元测试。
- 更新 `docs/05_API_SPEC.md`。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不接真实业务接口。
- 不实现登录页。
- 不实现真实 token 刷新闭环。
- 不接原生代理真实实现。
- 不持久化长生命周期 token。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/05_API_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `src/lib/api/index.ts`
  - 待创建：`src/lib/api/*`
  - 待创建：`src/lib/api/**/*.test.ts`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] API 结果和错误类型已定义。
- [x] 基础 request wrapper 已实现。
- [x] requestId 可自动注入。
- [x] base URL 可配置。
- [x] 鉴权 token 来源已预留到 Bridge `user.getToken`。
- [x] token 缺失、鉴权失败、网络失败和超时可归一化为 `ApiError`。
- [x] 单元测试覆盖成功、错误、requestId、base URL 和 token 缺失场景。
- [x] `docs/05_API_SPEC.md` 已同步 API client 行为。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 测试、类型检查、lint 和工作流检查通过。

## 风险和假设

- 真实鉴权、刷新和登出策略尚未确认；本任务只定义可测试的基础边界。
- API 流量由 H5 直连还是原生代理仍未确认；本任务保留扩展点。
- 敏感 token 不写日志、不落本地持久化。

## 计划

### 影响范围

- API：新增共享 API client 类型、request wrapper、错误归一化和 requestId/header 注入。
- Bridge：只消费既有 `user.getToken` 方法，不新增 Bridge 方法。
- 文档：同步 `docs/05_API_SPEC.md` 中的 client 行为、错误码和 header 规则。
- AI 工作流：更新状态、变更摘要、TODO、changelog 和验证报告。

### 预计文件

- `src/lib/api/index.ts`
- 待创建：`src/lib/api/types.ts`
- 待创建：`src/lib/api/client.ts`
- 待创建：`src/lib/api/errors.ts`
- 待创建：`src/lib/api/client.test.ts`
- `docs/05_API_SPEC.md`
- `.ai/PROJECT_STATE.md`
- `.ai/CHANGE_SUMMARY.md`
- `.ai/TODO.md`
- `docs/08_CHANGELOG.md`
- `.ai/test-reports/2026-05-15-api-client-auth-tracing.md`

### 步骤

1. 使用测试优先方式，为成功请求、base URL、requestId、Bridge token、token 缺失、鉴权失败、网络失败和超时写单元测试。
2. 确认测试因 API client 未实现而失败。
3. 实现最小 API client：
   - `ApiResult<T>`、`ApiError`、`RequestMeta`、`ApiClientConfig` 类型。
   - `createApiClient(config)` 和 `request<T>(path, options)`。
   - base URL 合并、JSON 请求和响应解析。
   - requestId 自动生成并注入 header。
   - 可选鉴权 token provider，默认预留到 Bridge `user.getToken`。
   - token 缺失、401/403、网络失败和超时归一化。
4. 更新 API 规范文档，明确本任务不实现 token 刷新、业务接口和原生代理。
5. 运行 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict`。
6. 记录验证报告，更新 AI 状态文件，审查通过后归档任务。

### 不在本任务内

- 不接真实业务接口。
- 不实现登录、登出、token 刷新或重试闭环。
- 不持久化 token。
- 不接真实原生 API 代理。
## 验证记录

- 状态：passed
- 摘要：API client 单测、全量测试、类型检查、lint 和 AI 工作流检查均通过
- 报告：.ai/test-reports/2026-05-15-2026-05-15-api-client-auth-tracing-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围与任务一致，未新增业务接口或登录闭环，API 规范和状态文件已同步
- 报告：.ai/test-reports/2026-05-15-2026-05-15-api-client-auth-tracing-review.md

## 归档说明

### 已完成

- 实现 API Client、鉴权与请求追踪基础

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
