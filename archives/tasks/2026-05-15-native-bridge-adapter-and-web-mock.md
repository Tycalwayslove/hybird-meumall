# 任务：Native Bridge 协议与 Web Mock

## 目标

定义并实现首版类型化 Native Bridge adapter，支持 Web 环境 mock、能力检测、超时、统一错误结构，为 H5 后续调用原生能力提供稳定边界。

## 标签

- bridge
- infra

## 范围

### 包含

- 明确首版 Bridge namespace 和 `nativeBridge.call(method, payload)` 调用协议。
- 实现类型化 Bridge adapter 入口。
- 实现 Web mock adapter，支持本地开发和浏览器环境验证。
- 首批支持方法：
  - `app.getVersion`
  - `user.getToken`
  - `webview.close`
  - `webview.setTitle`
- 定义统一 `BridgeResult<T>` 和 `BridgeError`。
- 支持 Bridge 不可用、方法不存在、调用超时等错误。
- 支持方法能力检测。
- 增加单元测试覆盖成功、失败、超时、方法不可用和 Web mock 行为。
- 更新 `docs/02_NATIVE_BRIDGE_SPEC.md`。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
- 生成 `.ai/test-reports/` 验证记录。

### 不包含

- 不接入真实 iOS 或 Android Bridge。
- 不实现支付、分享、扫码、图片选择等业务能力。
- 不实现登录态刷新闭环。
- 不创建业务页面或业务 UI。

## 上下文

- 相关文档：
  - `AGENTS.md`
  - `docs/01_ARCHITECTURE.md`
  - `docs/02_NATIVE_BRIDGE_SPEC.md`
  - `docs/06_CODING_RULES.md`
  - `docs/07_AI_WORKFLOW.md`
- 相关文件：
  - `src/lib/bridge/index.ts`
  - 待创建：`src/lib/bridge/*`
  - 待创建：`src/lib/bridge/**/*.test.ts`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `docs/08_CHANGELOG.md`

## 验收标准

- [x] Bridge adapter 暴露统一类型化调用入口。
- [x] Web mock adapter 可在无原生环境下返回可预测结果。
- [x] `app.getVersion`、`user.getToken`、`webview.close`、`webview.setTitle` 已定义类型。
- [x] Bridge 不可用、方法不存在和超时错误可被统一返回。
- [x] 单元测试覆盖首批方法、Web mock、超时和错误路径。
- [x] `docs/02_NATIVE_BRIDGE_SPEC.md` 已同步协议和首批方法。

## 验证

- 命令或人工检查：
  - `pnpm test`
  - `pnpm typecheck`
  - `pnpm lint`
  - `pnpm run ai:check-workflow --strict`
- 预期结果：
  - 测试、类型检查、lint 和工作流检查通过。

## 风险和假设

- 原生 Bridge namespace 和真实通信格式尚未与 iOS/Android 团队确认；本任务先实现可替换的 adapter 边界和 Web mock。
- `user.getToken` 的真实 token 格式和生命周期未确认；本任务只定义类型和 mock，不持久化敏感 token。
- 真实原生接入时可能需要补充迁移任务。

## 计划

### 影响范围

- Native Bridge：新增类型化 adapter、协议类型、Web mock、能力检测、超时和错误归一化。
- Manifest 和发布：不涉及。
- Theme：不涉及。
- API：仅为后续 `user.getToken` 鉴权来源提供边界，不实现 API client。
- Static Bundle：不涉及。
- UI：不新增业务页面。
- AI Workflow：更新任务状态、变更摘要、changelog、验证记录和归档记录。

### 行为约定

- H5 统一通过 `nativeBridge.call(method, payload, options?)` 调用原生能力。
- 第一版默认原生命名空间为 `window.MeumallNativeBridge`，真实 namespace 仍可在后续原生确认后替换。
- 原生侧协议暂按 Promise 风格 `call(method, payload)` 适配；callback-id 或 message-channel 模式后续通过 adapter 替换，不影响业务调用方。
- Web 环境默认使用 `createWebBridgeAdapter()` 生成 mock adapter。
- 所有调用返回 `BridgeResult<T>`，不向业务层抛出原生异常。
- 默认超时时间为 3000ms，可按单次调用通过 options 覆盖。

### 文件影响

- 新增或修改源码：
  - `src/lib/bridge/index.ts`
  - `src/lib/bridge/types.ts`
  - `src/lib/bridge/errors.ts`
  - `src/lib/bridge/web-mock.ts`
  - `src/lib/bridge/native-adapter.ts`
  - `src/lib/bridge/bridge.test.ts`
- 更新文档和 AI 状态：
  - `docs/02_NATIVE_BRIDGE_SPEC.md`
  - `.ai/PROJECT_STATE.md`
  - `.ai/CHANGE_SUMMARY.md`
  - `.ai/TODO.md`
  - `.ai/test-reports/2026-05-15-native-bridge-adapter-and-web-mock.md`
  - `docs/08_CHANGELOG.md`

### 实施步骤

1. 先写 `src/lib/bridge/bridge.test.ts`，覆盖 Web mock 成功、方法不存在、Bridge 不可用、超时、`webview.setTitle` payload 类型和能力检测。
2. 运行 bridge 单测，确认测试因能力缺失或模块缺失失败。
3. 实现 `types.ts`，定义 `BridgeMethod`、`BridgeMethodMap`、`BridgeResult<T>`、`BridgeError`、`NativeBridgeAdapter`。
4. 实现 `errors.ts`，统一构造 `BRIDGE_UNAVAILABLE`、`METHOD_NOT_FOUND`、`TIMEOUT` 和 `NATIVE_ERROR`。
5. 实现 `web-mock.ts`，提供首批方法的本地 mock。
6. 实现 `native-adapter.ts`，封装 `window.MeumallNativeBridge.call`，支持超时和异常归一化。
7. 更新 `index.ts`，导出默认 `nativeBridge`、adapter factory、类型和错误工具。
8. 运行 bridge 单测、全量测试、类型检查、lint 和工作流检查。
9. 更新 `docs/02_NATIVE_BRIDGE_SPEC.md`，记录首版 namespace、调用协议、首批方法和 fallback。
10. 更新 `.ai/PROJECT_STATE.md`、`.ai/CHANGE_SUMMARY.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。
11. 生成 `.ai/test-reports/2026-05-15-native-bridge-adapter-and-web-mock.md`。

### 验证计划

- `pnpm test -- src/lib/bridge/bridge.test.ts`
- `pnpm test`
- `pnpm typecheck`
- `pnpm lint`
- `pnpm run ai:check-workflow --strict`

### 风险

- 原生 namespace 与通信模式尚未最终确认；本任务通过 adapter 层隔离变化。
- `user.getToken` mock 只能返回占位 token，不代表真实登录态和刷新逻辑。
- Web mock 不应被误认为生产原生实现；文档和命名需要明确说明。

### 待确认问题

- 原生侧最终 namespace 是否采用 `MeumallNativeBridge`。
- 原生侧真实协议是 Promise、callback-id 还是 message-channel。
## 验证记录

- 状态：passed
- 摘要：TDD 红绿流程完成；Bridge 单测、全量测试、类型检查、lint 和工作流检查均通过。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-native-bridge-adapter-and-web-mock-verification.md
## 审查记录

- 状态：passed
- 摘要：变更范围匹配任务计划；只实现 H5 Bridge adapter 和 Web mock，未接真实原生、业务功能或 API client；Bridge 文档和 AI 状态已同步，可以归档。
- 报告：.ai/test-reports/2026-05-15-2026-05-15-native-bridge-adapter-and-web-mock-review.md

## 归档说明

### 已完成

- 实现 Native Bridge 协议与 Web Mock

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过
