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
- Light/Dark 主题 token、主题 allowlist 和运行时应用 API。
- API Client 基础：`ApiResult<T>`、`ApiError`、`RequestMeta`、base URL、requestId、Bridge token 来源、超时和错误归一化。
- Telemetry 基础：事件类型、noop reporter、telemetry client、白屏评估策略和首屏性能事件构造。
- 电商模拟页面：首页、分类、商品详情、购物车和我的页，使用本地 mock 数据和色块 icon 占位。
- 静态缺省资源：offline、not-found、error、maintenance HTML。
- OSS 配置模板和 `.env.example` 占位说明。

## 尚未实现

- 真实业务页面。
- 真实电商业务接口、登录、支付、订单和购物车持久化。
- manifest 远程拉取、缓存或 release runtime。
- 静态导出和原生打包流水线。
- 业务测试覆盖。
- 真实 CDN 集成。
- 真实 Sentry、原生埋点或内部监控平台接入。

## 当前约束

- 业务实现必须通过任务流推进。
- 修改 release、bridge、theme、api 时必须同步更新对应文档。
- 回滚流程只能修改 manifest 草案，不重新构建资源。
- 发布准备流程必须生成 `build.json`、`release-note.md` 和 `manifest.draft.json` 草案。
- AI 辅助脚本当前只做本地骨架，不连接真实 CDN。
- 应用工程使用 `pnpm`；AI 辅助脚本可继续通过 `npm run` 或 `pnpm run` 执行。
- 协作文档使用中文；代码标识符、文件名、命令名保留英文。
- 使用 `task-create` 时，用户可先用自然语言描述需求；AI 必须先澄清并输出草案，用户确认后才创建任务文件。
- 发布准备和回滚脚本仅生成或修改本地草案，不发布真实资源。

## 已知风险

- Native Bridge 契约尚未与 iOS 和 Android 团队确认。
- Native Bridge 真实 namespace、通信协议和最低 App 版本仍待原生团队确认。
- manifest 托管和灰度归属尚未确定。
- manifest 由 H5 拉取、原生拉取还是二者都拉取尚未确定。
- 静态打包路由列表尚未确定。
- 主题 token 来源和归属尚未确定。
- 品牌主题、远程主题拉取和用户主题偏好持久化尚未实现。
- manifest resolver 第一版灰度规则尚未与发布平台最终口径对齐。
- API token 刷新、重新登录、真实 base URL 和原生代理策略尚未确定。
- Telemetry 真实采样点、采样率、隐私脱敏和平台上报策略尚未确定。
- 模拟电商页面的正式视觉、真实 icon、真实 API 和 OSS 上传脚本尚未实现。

## 下一步建议

1. 确认 Native Bridge namespace、通信方式和首批方法。
2. 定义 manifest schema 归属、托管位置和缓存策略。
3. 确认首批需要静态打包的路由。
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
