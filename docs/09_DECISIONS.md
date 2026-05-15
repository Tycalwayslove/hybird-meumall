# 09 决策记录

本文件记录架构和流程决策，采用轻量 ADR 形式。

## 决策模板

```markdown
## ADR-0000 - <决策标题>

日期：YYYY-MM-DD

状态：Proposed | Accepted | Superseded

### 背景

### 决策

### 影响

### 备选方案
```

## ADR-0001 - 初始化 AI 工程化工作流文档

日期：2026-05-15

状态：Accepted

### 背景

项目需要面向 Hybrid App H5 的文档优先工作流，覆盖 Next.js、React、TypeScript、Tailwind CSS、WebView、manifest 发布控制、动态换肤、Native Bridge 和后续 Codex 任务开发。

### 决策

在实现业务功能前，先创建文档和 AI 工作流脚手架。

### 影响

- 后续任务有稳定上下文来源。
- AI Agent 明确知道任务前读取什么、任务后更新什么。
- 发布、主题、Bridge、API 和编码约定可以通过文档持续演进。

### 备选方案

- 直接开始实现：拒绝，因为用户要求先初始化工作流。
- 只在聊天中记录工作流：拒绝，因为后续 AI 会话需要持久文件。

## ADR-0002 - 使用本地 AI 辅助脚本骨架

日期：2026-05-15

状态：Accepted

### 背景

项目在真实业务功能和 CDN 集成前，需要先具备可运行的任务、发布草案、manifest 草案、变更记录和回滚辅助脚本。

### 决策

在 `scripts/ai/` 下创建最小 Node 可运行 `.ts` CLI，并通过 `package.json` 的 `ai:*` 命令暴露。初始版本保持本地、参数校验和无外部依赖。

### 影响

- 完整 Next.js 应用初始化前也能运行脚本。
- 发布和回滚只生成本地草案。
- 后续可在确定工具链后补充更强类型和测试。

### 备选方案

- 引入 `tsx` 或 `ts-node`：暂不采用，初始脚本不需要外部依赖。
- 接入真实 CDN 或发布系统：拒绝，因为用户明确要求不接真实 CDN。

## ADR-0003 - 初始化 H5 基础工程技术栈

日期：2026-05-15

状态：Accepted

### 背景

项目需要从 AI 工作流和文档阶段进入可运行 H5 工程阶段，同时保持不实现业务功能、不越界实现 Bridge、manifest、theme runtime 或 API client。

### 决策

使用 Next.js App Router、React、TypeScript、Tailwind CSS、CSS Variables、pnpm 和 Vitest 初始化基础工程骨架。首版只创建 `src/app`、`src/lib/*`、`src/styles` 等工程边界和默认主题 token 映射。

### 影响

- 后续业务页面必须基于 App Router 组织。
- 应用依赖和工程命令使用 `pnpm`。
- 纯逻辑和基础模块测试使用 Vitest。
- Bridge、manifest、API 目录入口目前只是边界，不代表能力已实现。

### 备选方案

- 使用 Pages Router：拒绝，用户已确认使用 App Router。
- 使用 npm 或 yarn：拒绝，用户已确认使用 pnpm。
- 暂不接入测试运行器：拒绝，用户已确认使用 Vitest。

## ADR-0004 - Root Manifest 本地版本解析优先级

日期：2026-05-15

状态：Accepted

### 背景

Root Manifest resolver 需要在未接入远程 manifest 服务、schema 校验和真实灰度平台前，先提供可测试的本地版本选择规则。

### 决策

`stableVersion` 作为默认安全版本；`grayVersion` 仅在 `grayRules` 命中时生效；`forceVersion` 优先于灰度和稳定版；`rollbackVersion` 不因字段存在而自动生效，只在当前版本或候选版本命中 `blacklistVersions` 时作为优先 fallback。

### 影响

- resolver 可以作为纯函数被 Vitest 覆盖。
- 回滚不会因为 manifest 声明了 `rollbackVersion` 而自动触发。
- 黑名单命中时按 `rollbackVersion`、`stableVersion` 顺序选择非黑名单版本。
- 后续 manifest schema 和发布平台接入时，需要确认字段结构是否继续沿用当前任务字段。

### 备选方案

- `rollbackVersion` 存在即强制回滚：拒绝，因为发布规范要求生产发布声明 rollback 目标，字段存在不等于回滚生效。
- 灰度优先于 `forceVersion`：拒绝，因为 force 应用于强制切换或紧急修正，优先级应更高。

## ADR-0005 - API Client 首版采用可注入请求边界

日期：2026-05-15

状态：Accepted

### 背景

API client 需要在真实后端、token 刷新策略和原生代理模式尚未确认前，为后续业务接口提供一致且可测试的请求边界。

### 决策

首版 `src/lib/api` 提供 `createApiClient(config)`，通过配置注入 `fetcher`、`tokenProvider`、`requestIdFactory` 和可选 Bridge。默认鉴权 token 来源预留到既有 `user.getToken` Bridge 方法；`auth: true` 且 token 不可用时直接返回 `TOKEN_MISSING`，不发起网络请求。

### 影响

- 业务接口可以统一消费 `ApiResult<T>` 和 `ApiError`。
- 单元测试可以稳定覆盖 base URL、requestId、鉴权、网络错误和超时。
- 不提前绑定真实登录页、token 刷新、后端域名或原生代理。

### 备选方案

- 直接在业务模块中使用 `fetch`：拒绝，因为会导致鉴权、追踪和错误处理分散。
- 在首版实现 token 刷新闭环：拒绝，因为刷新、登出和重新登录策略尚未确认。
- 强制所有请求都鉴权：拒绝，因为后续可能存在公开配置或健康检查类接口。

## ADR-0006 - Telemetry 首版采用 noop reporter 和纯函数策略

日期：2026-05-15

状态：Accepted

### 背景

项目需要为错误监控、白屏检测、首屏性能和通用埋点建立统一入口，但真实 Sentry、原生埋点 SDK、隐私合规要求和采样策略尚未确认。

### 决策

首版 `src/lib/telemetry` 只提供事件类型、`TelemetryReporter` interface、noop reporter、telemetry client、白屏采样评估纯函数和首屏性能事件构造。默认 reporter 不发送网络请求、不调用原生能力。

### 影响

- 后续可以把 Sentry、原生 `trackEvent` 或内部监控平台作为 reporter 接入。
- 白屏检测策略可被单元测试覆盖，不依赖 DOM 环境。
- 真实采样、采样率、隐私脱敏和平台上报策略保留到后续任务。

### 备选方案

- 直接接入 Sentry：拒绝，因为 DSN、环境隔离和隐私策略尚未确认。
- 立即新增 Native Bridge `trackEvent`：拒绝，因为 Bridge 方法需要原生侧确认和文档化。
- 在 App Shell 中直接采集 DOM 白屏：拒绝，因为当前没有业务页面和真实页面结构。

## ADR-0007 - 电商模拟页面只使用本地 mock 和色块占位

日期：2026-05-15

状态：Accepted

### 背景

当前需要先模拟跑通电商 H5 页面、静态缺省资源和 OSS 配置模板，但真实商品、购物车、订单、登录、支付和 icon 体系尚未确认。

### 决策

首版电商页面只使用本地 mock 数据和 App Router 页面。所有 icon 位置使用色块占位，不引入 icon 库或真实素材。静态缺省页放在 `public/static/fallback/`，OSS 配置只提供非敏感模板。

### 影响

- 可以先本地验证页面路由、移动 WebView 布局、静态兜底资源和配置填写方式。
- 不会提前绑定真实业务接口、素材体系或上传流程。
- 后续替换真实 icon、API 和 OSS 上传脚本时需要单独任务推进。

### 备选方案

- 直接接真实接口：拒绝，因为业务接口和登录态尚未确认。
- 直接引入 icon 库：拒绝，因为用户要求先用色块占位。
- 在配置模板中写真实 OSS 凭证：拒绝，因为敏感信息不能提交到仓库。

## ADR-0008 - 使用 Conventional Commits 规范提交信息

日期：2026-05-15

状态：Accepted

### 背景

此前本地提交信息缺少统一结构，不利于后续生成变更记录、筛选提交范围和多人协作审查。

### 决策

使用社区通用 Conventional Commits 规范，并通过 `commitlint`、`@commitlint/config-conventional` 和 `husky` 在 `commit-msg` 阶段自动检查。提交描述允许中文，但必须保留 `<type>(<scope>): <subject>` 结构。

### 影响

- 后续提交需要使用 `feat(ui): 添加页面` 这类格式。
- 本地可运行 `pnpm run lint:commit` 检查最近一次提交。
- 不符合规范的提交会在 `commit-msg` 阶段被拦截。

### 备选方案

- 只写文档不加 hook：拒绝，因为不能自动阻止不规范提交。
- 自定义私有提交格式：拒绝，因为社区生态和工具兼容性更弱。
- 强制英文 subject：拒绝，因为项目协作文档和用户偏好以中文为主。
