# 项目状态

## 当前阶段

H5 基础工程架构初始化完成，进入运行时基础能力建设阶段。

## 已实现

- Hybrid App H5 架构文档脚手架。
- AI 工作流状态文件。
- 已完成任务和发布记录归档目录。
- AI 脚本和测试报告占位目录。
- 项目级 Codex Skills：任务创建、规划、实现、测试、审查、归档、发布准备和回滚。
- `scripts/ai/` 下的最小可运行 AI 辅助脚本。
- 包含 `ai:*` 命令的最小 `package.json`。
- 面向协作的文档、任务和 Skill 已转换为中文。
- `task-create` Skill 已升级为对话式任务创建流程：自然语言输入、多轮澄清、草案确认后落盘。
- AI 工作流自动化已补充 `check-workflow`、`plan-task`、`test-task`、`review-task`、`release-prepare` 等脚本。
- `archive-task` 已增强为验证和审查通过后才能归档。
- Next.js App Router、React、TypeScript、Tailwind CSS 基础工程骨架。
- `pnpm` 应用工程依赖和脚本。
- Vitest 最小测试体系。
- 默认 CSS Variables 主题 token 和 Tailwind token 映射。
- `src/app`、`src/components`、`src/lib/bridge`、`src/lib/manifest`、`src/lib/theme`、`src/lib/api`、`src/styles` 源码边界。
- Root Manifest 类型、GrayRules 类型和 `resolveH5Version(ctx, manifest)` 本地版本解析函数。
- 类型化 Native Bridge adapter、Web mock、首批方法和统一错误结构。
- Manifest、app-config、theme-config 类型和本地 schema 校验函数。
- 客户端 Manifest Runtime：远程拉取、schema 校验、last-known-good 缓存、版本解析和路由加载结果构造。
- server-meumall active manifest HTTP fetcher：支持通过 `NEXT_PUBLIC_H5_MANIFEST_URL` / `H5_MANIFEST_URL` 拉取 JSON，并可注入 `fetchImpl` 测试。
- 本地配置中心闭环：`server-meumall` 已提供 FastAPI + SQLite 的 manifest 配置 CRUD、发布 active 和 H5 只读接口；`admin-meumall` 已提供简单配置发布后台；hybird 可通过 active manifest URL 拉取配置。
- 发布脚本已统一生成和更新 `ManifestFile` schema 草案。
- 回滚脚本已支持只修改 manifest 草案完成版本回退并记录黑名单。
- Next.js 已切回 SSR/standalone 构建，默认生成可部署到 Node.js 或 Serverless 运行时的 `.next/standalone` 产物，并通过根 layout 显式强制当前路由动态渲染。
- Manifest 资源模型已收敛为 SSR 服务入口：`serviceBaseUrl`、`basePath`、`staticAssetPath` 和 `healthCheckPath`。
- 发布准备、manifest 更新和回滚脚本已按 SSR manifest schema 输出。
- SSR 发布计划和 smoke 脚本已落地：`ai:prepare-ssr-release`、`ai:smoke-ssr-release`。
- standalone 静态资源准备脚本已落地：`ai:prepare-standalone-assets`，用于将 `.next/static` 和 `public` 复制到 `.next/standalone` 运行目录。
- H5 本地多版本演练能力：通过 `H5_RELEASE_VARIANT` 和 `H5_RELEASE_LABEL` 在页面右上角展示版本标识，并支持蓝/绿/粉三份 SSR 服务供 admin active manifest 切换。
- SSR manifest 切流观察脚本已落地：`ai:resolve-manifest`。
- 正式发版入口已落地：`ai:register-release` 支持生成 release 注册草案，并可通过 `--execute` 将 candidate release 注册到 server-meumall；GitHub Actions 已增加可选 `register_release` 输入。
- server-meumall 已支持 release 注册、列表、发布 active、设置灰度和回滚 API，并兼容 CI 参数式 payload 与完整 manifest payload。
- admin-meumall 已增加“正式发版”操作区，可查看 release、发布 active、设置灰度和发起回滚。
- 已生成本地切流/回滚演练档案 `archives/releases/2026.05.15-switch-drill/`。
- 已新增 SSR 健康检查路由 `/api/health`。
- 已添加手动 GitHub Actions 发布流水线 `.github/workflows/h5-release.yml`，当前按 SSR/standalone 产物归档。
- 已跑通 Mac Studio 本地 Jenkins H5 参数化构建链路：Jenkins Controller 运行在 Docker Desktop，`mac-studio` agent 由 launchd 守护，构建产物通过 SSH/rsync 上传到云服务器 release 目录。
- 本地 Jenkins H5 构建脚本已接入 Git mirror 缓存，GitHub 网络不可用时可使用本机缓存继续构建指定分支。
- 本地 Jenkins H5 构建已支持通过 SSH tunnel 注册 candidate release，并可在注册成功后激活远端 H5 SSR 服务。
- Light/Dark 主题 token、主题 allowlist 和运行时应用 API。
- API Client 基础：`ApiResult<T>`、`ApiError`、`RequestMeta`、base URL、requestId、Bridge token 来源、超时和错误归一化。
- Native Bridge 统一信封调试 runtime：支持 `router/event/rpc`、`callbackId`、`window.__bridgeHandler.resolve/reject/emit`、首页调试按钮和 Web fallback 日志。
- Telemetry 基础：事件类型、noop reporter、telemetry client、白屏评估策略和首屏性能事件构造。
- 电商模拟页面：首页、分类、商品详情、购物车和我的页，使用本地 mock 数据和色块 icon 占位。
- 静态缺省资源：offline、not-found、error、maintenance HTML。
- `.env.example` 已收敛为 SSR 服务配置占位，不包含 OSS 发布参数。
- Git 提交信息规范检查：Conventional Commits、commitlint 和 husky commit-msg hook。

## 尚未实现

- 真实业务页面。
- 真实电商业务接口、登录、支付、订单和购物车持久化。
- 原生 App 内置兜底页流水线。
- 业务测试覆盖。
- manifest 正式 active 发布审批和 SSR 运行平台接入。
- server-meumall active manifest 的生产环境部署、权限控制和发布审批配置。
- 真实 Sentry、原生埋点或内部监控平台接入。

## 当前约束

- 业务实现必须通过任务流推进。
- 修改 release、bridge、theme、api 时必须同步更新对应文档。
- 回滚流程只能修改 manifest 草案，不重新构建资源。
- 发布准备流程必须生成 `build.json`、`release-note.md`、`manifest.draft.json`、`ssr-release-plan.json` 和 SSR 运行时归档。
- AI 辅助脚本默认只做本地草案、SSR 发布计划和 smoke；`ai:register-release` 只有显式追加 `--execute` 时才连接 server-meumall 注册 candidate release。
- 应用工程使用 `pnpm`；AI 辅助脚本可继续通过 `npm run` 或 `pnpm run` 执行。
- 协作文档使用中文；代码标识符、文件名、命令名保留英文。
- 使用 `task-create` 时，用户可先用自然语言描述需求；AI 必须先澄清并输出草案，用户确认后才创建任务文件。
- 发布准备和回滚脚本仅生成或修改本地草案；candidate release 可由 CI 注册到 server-meumall，active、灰度和回滚必须通过 admin-meumall 或受控发布平台审批执行。
- Git 提交信息必须使用 Conventional Commits 结构，描述可以使用中文。

## 已知风险

- Native Bridge 总协议草案已建立，但尚未与 iOS 和 Android 团队确认。
- H5 首页 Bridge 调试面板已能发出统一信封；原生 App 当前只做 debug receiver，占位回传，不代表真实 token、导航、分享等业务能力完成。
- active manifest 已约定由 server-meumall 提供，灰度规则和审批归属仍需与发布平台确认。
- H5 runtime 已可通过 server-meumall 拉取并缓存 manifest；原生 App 是否也需要拉取仍待确认。
- SSR 已覆盖当前模拟路由；最终随 App 内置的兜底页列表尚未确定。
- 主题 token 来源和归属尚未确定。
- 品牌主题、远程主题拉取和用户主题偏好持久化尚未实现。
- manifest resolver 和发布脚本第一版灰度规则尚未与发布平台最终口径对齐。
- API token 刷新、重新登录、真实 base URL 和原生代理策略尚未确定。
- Telemetry 真实采样点、采样率、隐私脱敏和平台上报策略尚未确定。
- 模拟电商页面的正式视觉、真实 icon 和真实 API 尚未实现。
- GitHub Actions workflow 已切回 SSR/standalone 产物归档，并支持可选注册 candidate release，但尚未在远端仓库环境中验证，仍需配置 `H5_SERVICE_BASE_URL`、`H5_RELEASE_SERVER_URL` 等 GitHub Secrets 和受保护环境。
- 本地 Jenkins 依赖 Mac Studio 的 Docker Desktop、Java 17、SSH key 和 `/Users/mac/person_code/meu-mall/meumall-ci` 工作目录；迁移到新机器时需要恢复这些本地运行条件。
- 当前 Jenkins release 注册通过 SSH tunnel 访问服务器内网 FastAPI；后续接入外部 CI 时应补充独立 CI token 鉴权。

## 下一步建议

1. 确认 Native Bridge namespace、通信方式和首批方法。
2. 配置 SSR 部署平台、`H5_SERVICE_BASE_URL`、server-meumall active manifest URL、受保护环境和 manifest active 发布审批。
3. 确认首批需要内置的原生兜底页。
4. 定义主题 token 集合和 Tailwind 映射。
5. 为后续 manifest、Bridge、theme runtime 和 API client 任务补充对应测试。
## 2026-05-15 任务归档

- 归档任务：2026-05-15-ai-workflow-hardening-and-rehearsal.md
- 摘要：完善 AI 工作流自动化并完成完整任务闭环演练
## 2026-05-15 任务归档

- 归档任务：2026-05-15-h5-foundation-architecture.md
- 摘要：初始化 H5 基础工程架构
## 2026-05-15 任务归档

- 归档任务：2026-05-15-root-manifest-version-resolver.md
- 摘要：实现 Root Manifest 类型和 resolveH5Version(ctx, manifest)
## 2026-05-15 任务归档

- 归档任务：2026-05-15-native-bridge-adapter-and-web-mock.md
- 摘要：实现 Native Bridge 协议与 Web Mock
## 2026-05-15 任务归档

- 归档任务：2026-05-15-manifest-schema-and-remote-config.md
- 摘要：实现 Manifest Schema 与远程配置中心类型
## 2026-05-15 任务归档

- 归档任务：2026-05-15-theme-runtime-light-dark.md
- 摘要：实现 Theme Runtime 与 Light/Dark 切换
## 2026-05-15 任务归档

- 归档任务：2026-05-15-api-client-auth-tracing.md
- 摘要：实现 API Client、鉴权与请求追踪基础
## 2026-05-15 任务归档

- 归档任务：2026-05-15-telemetry-white-screen-performance.md
- 摘要：实现监控、白屏检测与性能埋点基础
## 2026-05-15 任务归档

- 归档任务：2026-05-15-commerce-mock-pages-static-fallback-oss-config.md
- 摘要：实现模拟电商页面、静态缺省页与 OSS 配置模板
## 2026-05-15 任务归档

- 归档任务：2026-05-15-release-rollback-system-implementation.md
- 摘要：落地版本发布与回滚基础机制
## 2026-05-15 任务归档

- 归档任务：2026-05-15-real-oss-platform-integration.md
- 摘要：真实OSS平台参数体检与显式上传入口
