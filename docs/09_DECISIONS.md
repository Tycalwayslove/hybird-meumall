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

## ADR-0009 - OSS 配置显式声明 bucket 内目录

日期：2026-05-15

状态：Superseded by ADR-0014

### 背景

OSS 配置模板已有 CDN 公开访问地址和发布前缀，但缺少 OSS bucket 内约定的一级目录，发布与回滚流程无法从配置中明确资源上传根目录。

### 决策

在 `config/oss.config.example.json` 中新增 `ossDirectory`，当前固定为 `/hybird`。该字段只表达 OSS bucket 内目录，不承载公网 CDN URL；`remotePrefix` 保持为该目录下的 H5 资源根目录 `h5`，环境和版本由 `versionPathPattern` 表达。

### 影响

- 发布准备和回滚机制后续可以从配置模板读取 OSS 上传根目录。
- CDN 公开访问地址、OSS bucket 内目录、H5 资源根目录和环境/版本目录保持各自独立。
- 真实 OSS 上传脚本已可基于该目录约定生成对象 key，并在显式 `--execute` 时上传。

### 备选方案

- 复用 `publicBaseUrl`：拒绝，因为它是公网访问地址，不适合表达 OSS bucket 内目录。
- 直接把 `/hybird` 或环境名合并进 `remotePrefix`：拒绝，因为会导致 bucket 根目录、H5 资源根目录和环境/版本目录边界不清。

## ADR-0010 - 发布控制面统一采用 ManifestFile schema

日期：2026-05-15

状态：Accepted

### 背景

发布脚本早期生成 `activeVersion`、`rollout` 和数组路由草案，而运行时 schema 使用 `stableVersion`、`grayVersion`、`grayRules` 和路由 record。两套结构并存会导致发布草案、客户端 runtime 和文档契约漂移。

### 决策

发布准备、manifest 更新、回滚和客户端加载统一采用 `src/config/remote-config.ts` 中的 `ManifestFile` schema。灰度发布时，`stableVersion` 保持旧稳定版，`grayVersion` 指向新版本；全量发布时，`stableVersion` 指向新版本并移除 `grayVersion`。

### 影响

- `ai:release-prepare` 生成的 `manifest.draft.json` 可被 `validateManifestFile` 校验。
- `ai:rollback` 只修改 manifest 草案，不重建资源。
- 客户端 manifest runtime 可以直接消费发布草案同构的远程 manifest。
- 旧草案中的 `activeVersion`、`rollout` 和数组路由会在脚本更新时被归一化。

### 备选方案

- 保留脚本自定义 manifest 结构：拒绝，因为会增加转换和发布风险。
- 让客户端 runtime 兼容多套 schema：拒绝，因为控制面应在发布前收敛，不应把历史草案复杂度下放到客户端。

## ADR-0011 - 静态导出构建注入版本目录前缀

日期：2026-05-15

状态：Superseded by ADR-0014

### 背景

H5 静态产物需要上传到 OSS bucket 内的不可变版本目录，例如 `/hybird/h5/prod/2026.05.15-static-smoke/`。如果静态 HTML 中的 `_next/static` 资源仍使用 bucket 根路径，页面在版本目录下打开时会加载不到 JS/CSS。

### 决策

Next.js 配置启用 `output: "export"` 和 `trailingSlash: true`。构建发布版本时，通过 `H5_BASE_PATH` 注入站内路由前缀，通过 `H5_ASSET_PREFIX` 注入 `_next/static` 资源前缀；本地开发或普通构建未设置这些变量时保持默认根路径。

### 影响

- 同一套源码可以生成本地根路径构建，也可以生成 OSS 版本目录构建。
- OSS 上传脚本仍按 `ossDirectory + remotePrefix + environment + version` 上传 `out/` 内容。
- CI/CD 必须在正式静态发布构建阶段传入和目标版本目录一致的 `H5_BASE_PATH` 与 `H5_ASSET_PREFIX`。
- manifest 的 `assets.cdnBaseUrl` 只表达域名或 CDN 根路径，`immutablePathPattern` 承载 `/hybird/h5/<env>/{version}/`，避免客户端 runtime 拼接时重复目录。

### 备选方案

- 只依赖 CDN origin path 重写：暂不采用，因为直接访问 bucket 公网 URL 时仍会暴露路径问题。
- 把版本目录写死在代码中：拒绝，因为版本号每次发布变化，会污染源码并增加回滚风险。

## ADR-0012 - 发布运维脚本默认 dry-run，真实发布必须显式执行

日期：2026-05-15

状态：Superseded by ADR-0014

### 背景

当前发布链路已经具备真实 OSS 上传能力，但 active manifest、latest 指针和 CDN 刷新都会影响线上用户或缓存行为，需要避免本地脚本误触发生产变更。

### 决策

新增发布运维脚本统一采用 dry-run 默认行为：先生成 plan 文件，只有显式传入 `--execute` 才会访问外部平台。manifest 发布拆分为 `candidate` 和 `active` 两个 stage；CI 默认只发布 candidate manifest，active 覆盖必须经人工审批后单独执行。`latest/` 仅作为排查辅助指针，不作为生产固定入口。

### 影响

- 本地和 CI 都能复用同一批计划文件进行审查。
- OSS smoke 可以在 candidate 前阻断 404、错误缓存和强制下载响应头。
- CDN 刷新可以先审查 URL 清单，再由受控环境执行。

### 备选方案

- 上传资源后自动覆盖 active manifest：拒绝，因为缺少发布审批和监控门禁。
- 自动镜像完整版本目录到 `latest/`：拒绝，因为 `_next/static` 已是不可变资源，镜像会扩大刷新面并误导生产入口。

## ADR-0013 - 默认远程交付切回 Next.js SSR

日期：2026-05-15

状态：Superseded by ADR-0014

### 背景

当前业务页面尚未接真实接口。继续使用 Next.js 静态导出会把远程 H5 固定为预渲染 HTML 和客户端二次请求模式，不利于后续服务端渲染、登录态服务端校验、接口聚合和动态页面缓存策略设计。

### 决策

默认远程发布切回 Next.js SSR，并使用 `output: "standalone"` 生成可部署到 Node.js 或 Serverless 运行时的产物。当前 App Router 根 layout 显式设置 `dynamic = "force-dynamic"`，避免纯 mock 页面被自动静态优化；后续接入真实接口后再按页面粒度收敛 SSR、SSG 或 ISR。`H5_BASE_PATH` 仅在服务挂载到子路径时配置，`H5_ASSET_PREFIX` 仅在静态资源走独立 CDN 时配置。OSS 静态上传脚本继续保留，但只用于 App 内置静态包、fallback 页面、历史 smoke 或可选 CDN 静态资源，不作为完整远程 H5 的默认发布方式。

### 影响

- 发布平台需要承载 `.next/standalone/server.js`，并同时发布 `.next/static` 和 `public`。
- manifest 的远程路由在 SSR 模式下应指向应用路由，例如 `/category`，不应指向 `category/index.html`。
- GitHub Actions 默认归档 SSR 运行时包，不再上传 `out/` 到 OSS。
- 历史 `2026.05.15-static-smoke` 仍可作为 OSS 静态发布验证记录，但不应直接提升为默认远程 H5 发布方案。

### 备选方案

- 继续使用静态导出作为默认远程交付：拒绝，因为真实业务接口接入后，动态数据、登录态和服务端渲染能力会受限。
- 同时维护 SSR 和静态导出两条默认发布链路：暂不采用，因为会增加 manifest、CI 和缓存策略复杂度；静态包需求应通过明确任务单独收敛。

## ADR-0014 - 发布配置收敛为 SSR-only

日期：2026-05-15

状态：Accepted

### 背景

项目已经明确不需要兼容此前的 SSG/OSS 静态导出发布链路。继续保留 `cdnBaseUrl + immutablePathPattern`、OSS 上传配置和静态 smoke 配置，会让 manifest、CI/CD、回滚语义同时存在两套路径，增加发布风险。

### 决策

当前远程 H5 发布配置收敛为 SSR-only：

- manifest `assets` 改为 `serviceBaseUrl`、`basePath`、`staticAssetPath` 和 `healthCheckPath`。
- 客户端 runtime 使用 SSR 服务地址拼路由，不再拼版本目录。
- `release-prepare` 和 `update-manifest` 使用 `--service-base-url` 与 `--base-path`。
- 新增 `prepare-ssr-release` 和 `smoke-ssr-release`，替代 OSS 上传计划、OSS smoke、latest 指针和 CDN 刷新计划。
- `.env.example` 不再提供 OSS 参数。
- 默认 CI/CD 只归档 standalone SSR 产物和 release 草案。

### 影响

- 回滚只通过 manifest 指针切回已部署 SSR 版本。
- H5 版本号不再参与页面 URL 拼接。
- 原生 App 内置内容只保留兜底页语义，不再作为业务页面 SSG 兼容链路。
- 历史 OSS smoke 记录保留为历史验证资料，但不再代表当前发布方案。

### 备选方案

- 保留 OSS 静态脚本作为默认可选分支：拒绝，因为用户明确不需要兼容以前的 SSG。
- 继续让 manifest 同时支持 SSR 和静态目录：拒绝，因为客户端 URL 拼接和回滚语义会变复杂。
