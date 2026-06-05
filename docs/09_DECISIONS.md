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

## ADR-0020 - H5 本地静态资源必须通过资源 registry 解析

日期：2026-06-05

状态：Accepted

### 背景

H5 线上页面运行在版本化 basePath 下，例如 `/h5-v/v1.0.8`。如果业务组件直接写 `src="/assets/..."`、`href="/assets/..."` 或 `url(/assets/...)`，浏览器会请求域名根路径资源，绕过当前 H5 版本目录，导致线上图片 404。新开 AI 会话继续开发页面时，如果只依赖聊天记忆，很容易再次写出裸路径。

### 决策

本地随 H5 发版的稳定图片、icon、背景图必须先注册到 `src/lib/assets/local-assets.ts`，业务类型和 mock 使用 `LocalAssetKey` 表达资源，组件渲染时通过 `localAssetUrl(assetKey)` 得到最终 URL。

`localAssetUrl()` 统一处理：

- `NEXT_PUBLIC_H5_ASSET_BASE_URL`：后续资源上 CDN 时使用。
- `NEXT_PUBLIC_H5_BASE_PATH` / `H5_BASE_PATH`：当前多版本 SSR 路径使用。
- 裸 `public/assets` 路径：只允许在 registry 内部保存，业务组件不得直接引用。

### 影响

- 新增页面可以在本地、版本目录、后续 CDN 三种资源来源之间复用同一套代码。
- 新会话只要读取 `AGENTS.md`、本 ADR 或推广页面开发规范，就能恢复静态资源规则。
- 测试需要覆盖 basePath 场景，避免只在本地根路径通过。

### 备选方案

- 在每个组件里手动拼 `basePath + "/assets/..."`：拒绝，因为会造成重复逻辑和遗漏。
- 继续直接写 `/assets/...`：拒绝，因为版本目录和后续 CDN 场景都会失效。
- 只把规则写在聊天里：拒绝，因为跨会话无法可靠恢复。

## ADR-0019 - H5 页面采用 Figma Token 驱动的 Design System

日期：2026-06-04

状态：Accepted

### 背景

推广首页首版虽然接近 Figma 结构，但页面 JSX 中存在大量直接颜色 class、视觉常量和页面内拼装逻辑。随着后续活动、榜单、权益、商品、订单等页面增加，如果继续按单页写法推进，会导致颜色难维护、组件难复用、页面职责不清晰。

### 决策

建立 `src/design-system` 作为 H5 全局 UI 基础层：

- Figma 色彩组件节点 `34:884` 进入 `src/design-system/tokens/colors.ts`。
- Tailwind 统一暴露 `brand`、`text`、`fill`、`line`、`success`、`warning`、`danger`、`price` 等语义 token。
- 常用 UI primitives 统一放在 `src/design-system/components`。
- 业务页面不再直接写颜色 class，业务专属视觉参数集中在 feature 的 `theme/` 目录。
- 推广首页先按该模式重构，作为后续页面迁移样板。

### 影响

- 设计改色可以优先改 token，而不是全局搜索页面 class。
- 页面入口会更薄，业务组件和视觉主题可以独立维护。
- 活动、榜单、权益等已实现页面后续需要按同一模式逐步迁移。

### 备选方案

- 继续在页面中写 Tailwind 原子 class 和十六进制颜色：拒绝，因为维护成本会随着页面数量增长快速失控。
- 直接引入第三方组件库：暂不采用，因为当前 H5 需要高度贴合 Figma 与 WebView，第三方库会带来样式覆盖和包体成本。

## ADR-0018 - 本地 Jenkins 采用 Mac agent 与本地 Git mirror 缓存

日期：2026-05-16

状态：Accepted

### 背景

云服务器配置较低，不适合长期承担 Jenkins、Node 依赖安装和 Next.js 构建。Mac Studio 本地性能更适合做构建机，但 Jenkins Controller 运行在 Docker Desktop 中，直接让容器内完成构建会遇到 Docker in Docker、宿主机 SSH key 和本机工具链访问复杂度。实际演练中还出现 `mac-studio` agent offline 和 GitHub 连接超时导致构建失败。

### 决策

本地 Jenkins 架构采用：

- Jenkins Controller 继续运行在 Docker Desktop。
- Mac Studio 作为固定 Jenkins agent，由 launchd 守护，负责执行构建任务。
- Pipeline 只启动 detached 本机部署脚本并轮询状态，长时间 Docker 构建和 rsync 上传由本机脚本承接。
- H5 构建脚本维护本地 Git mirror 缓存；每次构建先短超时刷新 GitHub，失败时使用本地缓存继续构建。
- launchd 启动的 Jenkins agent 固化代理环境，避免后台进程绕过本机代理直连 GitHub。
- release 注册阶段通过 SSH tunnel 访问服务器本机 FastAPI `127.0.0.1:4100`，公网 nginx 继续保护 `/api/releases` 管理接口。
- 云服务器只保存部署产物和运行服务，不承担 H5 编译。

### 影响

- 点 Jenkins 参数化 Build 可以选择分支、版本、服务器和是否激活发布。
- GitHub 网络短时不可用不会阻断已有分支的本地构建演练。
- CI 注册 release 不需要在 Jenkins 中保存 nginx Basic Auth 凭据，也不需要放开公网管理 API。
- 迁移到新 Mac 或重装系统时，需要恢复 `/Users/mac/person_code/meu-mall/meumall-ci`、launchd agent、Docker Desktop、Java 17、SSH key 和 Git mirror。

## 2026-06-01：本地多项目工作区不再依赖旧路径软链接

- 决策：`hybird-meumall`、`server-meumall`、`admin-meumall`、`app-meumall` 和 `meumall-ci` 统一放在 `/Users/mac/person_code/meu-mall/` 下；Jenkins、launchd、pipeline 和 H5 构建脚本全部使用新路径。
- 原因：软链接适合短期搬迁过渡，但会隐藏真实部署依赖；后续迁移到新服务器或新 Mac 时，旧绝对路径会造成不可见的环境耦合。
- 替代方案：继续保留 `/Users/mac/company_code/*` 和 `/Users/mac/meumall-ci` 软链接作为兼容层。该方案已拒绝，因为它会让 CI 成功依赖本机历史路径，不利于标准化部署。
- 影响：历史构建日志和历史测试报告仍可保留旧路径记录；当前运行配置、启动脚本和发布脚本不再依赖旧软链接。

### 备选方案

- Jenkins 完全部署在云服务器：拒绝，因为当前轻量云服务器 CPU 和内存不足，构建慢且影响线上服务。
- Jenkins Controller 容器内直接构建并上传：暂不采用，因为需要处理 Docker socket、SSH key、跨架构 Node 镜像和宿主机路径映射，复杂度更高。
- 每次构建都强依赖 GitHub HTTPS clone：拒绝，因为本地网络到 GitHub 可能失败，会让可重复发版演练不稳定。
- Jenkins 通过公网 `/api/releases` + Basic Auth 注册 release：暂不采用，因为会复用后台管理认证面，并把 CI 绑定到公网管理入口。
- 立即新增 server-meumall CI token：暂缓，因为当前本地 Jenkins 已有 SSH 发布通道；该方案适合作为后续外部 CI 生产化改造。

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

## ADR-0017 - 正式发版入口由 H5 CI 注册 candidate，admin 控制 active

日期：2026-05-16

状态：Accepted

### 背景

本地蓝/绿/粉演练阶段通过直接写入 server-meumall 数据库来模拟多个 H5 版本。正式流程中，版本应由 hybird-meumall 的构建流水线产生并通知配置中心，admin-meumall 只负责查看候选版本、灰度、全量和回滚。

### 决策

正式发版入口拆分为两个控制面：

- hybird-meumall CI 使用 `ai:register-release --execute` 在构建、部署和 smoke 后向 server-meumall 注册 candidate release。
- server-meumall 负责持久化 release，生成或保存兼容 `ManifestFile` 的 manifest，并提供 promote、gray 和 rollback API。
- admin-meumall 不构建 H5，只消费 release API 执行发布 active、设置灰度和回滚。
- active manifest endpoint 仍是 App/WebView 唯一读取入口。

### 影响

- 发版产物来源和发布操作分离，避免 admin 直接拥有构建和部署权限。
- 回滚仍然是 manifest 指针切换，不重新构建 SSR 产物。
- CI 可以使用参数式 payload 注册 release；特殊场景仍可提交完整 manifest。
- 真实环境需要为 `H5_RELEASE_SERVER_URL`、权限、审计、审批和网络访问策略补生产配置。

### 备选方案

- 在 admin-meumall 中直接触发构建和部署：拒绝，因为会把源码构建权限和线上切流权限混在一个后台入口。
- 继续人工把版本写入数据库：拒绝，因为无法沉淀可追溯、可自动化、可审计的发版链路。

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

## ADR-0019 - H5 内置静态资源使用 public/assets 与可选 CDN 前缀

日期：2026-06-01

状态：Accepted

### 背景

首页进入生产化改造后，需要接入真实图片和 icon。若页面组件直接写 `/assets/...`、业务图片混入 H5 仓库、或各页面自行处理 CDN 前缀，会导致 WebView `basePath`、SSR、CDN、离线包和回滚策略互相打架。

### 决策

- H5 内置稳定资源放在 `public/assets`，并按 `brand`、`icons`、`home`、`promotion`、`mine`、`placeholders` 分目录管理。
- 页面和组件统一通过 `assetUrl("/assets/...")` 引用内置资源。
- manifest `assets` 增加可选 `publicAssetBaseUrl`，用于表达当前 H5 版本的公共资源 CDN 前缀。
- `release-prepare`、`update-manifest` 和 `register-release` 支持 `--public-asset-base-url`。
- 商品图、用户头像、后台配置 banner、达人素材等业务动态图片不进入 H5 仓库，由接口返回完整 CDN URL。
- 原生离线包可预下载 `public/assets` 和 `.next/static`，但只作为缓存/兜底层，不替代 SSR + CDN 主发布链路。

### 影响

- H5 在本地、`/hybird` basePath、CDN 和离线包场景下使用同一套资源引用入口。
- 首页真实图片替换时，页面不需要关心资源来自本地 public、CDN 还是原生本地缓存。
- 公共资源如果使用长缓存，必须采用版本目录或 hash 文件名，避免同名替换造成客户端旧缓存。

### 备选方案

- 组件内直接写 `/assets/...`：拒绝，因为生产 `basePath` 下路径容易错误。
- 所有图片都进入 H5 仓库：拒绝，因为业务运营图片需要后台动态替换。
- 默认只走原生 zip 离线包：拒绝，因为灰度、回滚和资源缺失回源会更复杂。

## ADR-0015 - active manifest 由 server-meumall 提供

日期：2026-05-15

状态：Accepted

### 背景

客户端 manifest runtime 已支持注入 `fetchManifest`，但 hybird 缺少面向 server-meumall active manifest endpoint 的标准 fetcher。继续只依赖调用方手写 fetcher 会让 HTTP 错误处理、JSON 解析错误和默认 URL 读取分散在 App Shell 或原生集成层。

### 决策

新增 `src/lib/manifest/server-fetcher.ts`，由 `createHttpManifestFetcher()` 通过 URL 拉取 server-meumall active manifest JSON。默认 URL 依次读取 `NEXT_PUBLIC_H5_MANIFEST_URL` 和 `H5_MANIFEST_URL`；非 2xx 和 JSON 解析失败直接抛错，交由既有 manifest runtime fallback 到 last-known-good 缓存。

### 影响

- hybird 有统一入口接入 server-meumall active manifest。
- 现有 manifest runtime API 不变，仍通过 `fetchManifest` 注入远程来源。
- 测试可通过 `fetchImpl` 注入覆盖网络成功、HTTP 失败和解析失败。
- 真实环境还需要验证 server-meumall endpoint、CORS、WebView 访问策略和发布审批。

### 备选方案

- 在 `createManifestRuntime` 内直接绑定 server-meumall URL：拒绝，因为会破坏现有注入边界，也不利于原生或测试替换来源。
- 让业务 API client 拉取 active manifest：拒绝，因为 manifest 是发布控制面请求，不应受业务鉴权、业务 base URL 或重试策略影响。

## ADR-0016 - 本地配置中心使用 FastAPI + SQLite 跑通闭环

日期：2026-05-15

状态：Accepted

### 背景

发布切流和回滚需要一个后台可操作的 active manifest 控制面。当前阶段目标是先跑通本地闭环：后台编辑配置、服务端持久化并发布 active、hybird 读取 active manifest。

### 决策

`server-meumall` 首版使用 Python FastAPI + SQLite 实现本地配置中心，提供 manifest 配置 CRUD、发布 active 和 H5 只读 active manifest endpoint。`admin-meumall` 使用 Vite + React 提供简单配置发布后台。hybird 不直接依赖后台管理接口，只通过 `GET /api/h5/manifest/active?environment=prod` 获取已发布配置。

### 影响

- 本地可以完整体验配置创建、保存、发布、读取和 H5 URL 解析。
- SQLite 适合本地联调和早期验证，后续生产化可以迁移到 MySQL/PostgreSQL 或内部配置平台。
- 后台管理接口和 H5 只读接口分离，降低 WebView 暴露管理能力的风险。

### 备选方案

- Node.js + Express 配置中心：用户明确希望后端使用 Python + FastAPI，因此不采用。
- 直接读写 OSS/CDN manifest JSON：暂不采用，因为本地管理和审批能力不足，且不便于后续补审计和权限。

## ADR-0020 - H5 页面顶部导航统一进入 design-system

日期：2026-06-04

状态：Accepted

### 背景

推广模块开始进入正式页面开发后，页面导航出现多种形态：白底常规导航、透明返回导航、透明标题导航和右侧操作导航。若每个业务页面自行实现状态栏占位、返回按钮、固定定位和滚动容器，会导致 WebView 中 `statusHeight` 处理不一致，也会让桌面调试宽度、页面滚动和沉浸式头图互相影响。

### 决策

- H5 顶部导航统一放入 `src/design-system/components`。
- `TopNavigation` 只负责导航视觉和交互槽位。
- 页面级布局使用 `StandardNavPage`、`TransparentNavPage` 和 `TransparentActionNavPage` 三个预设。
- 状态栏高度由根布局注入 CSS 变量：`--meu-status-bar-height`、`--meu-nav-height`、`--meu-top-bar-height`。
- 业务页面不再手写状态栏占位、返回按钮或固定透明导航。
- 透明导航页面如果头图内容需要避开按钮区域，由页面头图区显式使用 `pt-[var(--meu-top-bar-height)]`。
- 固定定位的 H5 顶部或底部浮层必须限制在 `max-w-[430px]` 容器内。

### 影响

- 后续 H5 页面可以通过选择页面预设来确定导航、状态栏和滚动策略。
- 推广模块二级页面已迁移到公共导航，旧 `PromotionNav` 删除。
- 若后续出现滚动后变白、搜索栏、多右侧操作等场景，应扩展 design-system 导航变体，再接入业务页面。

### 备选方案

- 继续让每个业务页面手写导航：拒绝，因为状态栏和滚动容器会持续漂移。
- 只做一个万能导航组件，不提供页面预设：拒绝，因为透明导航是否占据文档流属于页面布局决策，仅靠视觉组件容易误用。
