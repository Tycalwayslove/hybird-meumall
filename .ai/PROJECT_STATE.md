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
- Figma 色彩组件已沉淀为 `src/design-system` 设计体系基础，提供全局 color/radius/shadow/typography/spacing token 和 AppScreen、Section、Surface、Metric、StateView、Skeleton、AssetPlaceholder 等 UI primitives。
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
- H5 BFF HTTP 鉴权基础：原生 Cookie 登录态、Next 服务端读取 `pythonToken` / `mallToken`、服务端按 Python / Java 后端选择 token 并转 Authorization、浏览器端 H5 client 请求 BFF。
- 首页原生传参展示面板：通过 `/api/bff/runtime/context` 展示完整 Cookie 值、`pythonToken`、`mallToken`、`statusHeight`、`meu_page_config`、URL 参数和环境信息；该面板仅限当前内部调试，正式开放前必须删除或关闭。
- 推广模块首批页面：已实现推广首页五档达人主题、活动中心、榜单中心、达人销量榜、达人销售额榜和达人权益中心；已建立 H5 BFF mock、server service、状态兜底和测试。
- 推广首页已重构为 `pages/PromotionHomePage` + 业务 section components + `theme/talent-theme`，作为后续页面工程化样板。
- 推广二级页已按 design-system 模式迁移：活动中心、榜单中心、榜单详情和权益中心的常规颜色使用 token，业务视觉参数集中到 `theme/promotion-page-theme.ts`。
- 达人徽章、推广首页达人背景、汇总卡背景 V1-V5 已接入本地 PNG 静态资源，路径位于 `public/assets/promotion/talent-badges/`，并通过 `src/lib/assets/local-assets.ts` 的资源 key 统一解析。
- H5 本地静态资源已确认为强约束：业务组件和 mock 不直接保存 `/assets/...` 裸路径，稳定本地图片必须注册到 `src/lib/assets/local-assets.ts` 并通过 `localAssetUrl()` 解析版本 basePath 或后续 CDN 前缀；资源工具必须使用显式 `process.env.NEXT_PUBLIC_*`，禁止动态 `process.env[key]`，避免客户端 hydrate 或切换状态后丢失版本前缀。
- 本地 H5 dev 启动必须同时设置 `H5_BASE_PATH=/hybird` 和 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`；Next `basePath` 和客户端 `localAssetUrl()` 必须使用同一个公开 basePath，避免 SSR 图片路径正确但 hydration 后退回裸 `/assets/...`。
- 权益中心已接入 V1-V5 本地背景、左右切换箭头和权益 icon 资源，页面首屏由 SSR 准备五档数据，客户端支持左右滑切换、query 同步和 GSAP transform/opacity 动效。
- 达人销量榜和达人销售额榜已按 2026-06-05 最新 Figma 节点重做为浅绿渐变头图、三榜 tab、绿色分段周期控件、三列领奖台、白底列表和底部当前用户栏；领奖台背景和皇冠继续通过本地资源 registry 与 `localAssetUrl()` 引用。
- 我的页、奖励记录和排行榜已复用共享浅绿顶部背景 `shared.greenHeroBg`，业务 key `mine.hero.background`、`promotion.rewardRecordsBg`、`promotion.rankingHeroBg` 均解析到 `public/assets/shared/green-hero-bg.png`。
- 排行榜领奖台已收敛为 360px 容器内三卡贴合居中布局，皇冠固定在头像顶部右侧；排行榜顶部导航确认使用 `TransparentNavPage` / `TopNavigation` 公共组件。
- Figma 品牌色常规 `#A8F156` 已补充为 design-system `brand.normal` token，用于排行榜周期控件描边等场景。
- Native Bridge 统一信封调试 runtime：支持 `router/event/rpc`、`callbackId`、`window.__bridgeHandler.resolve/reject/emit`、首页调试按钮和 Web fallback 日志。
- H5 与原生路由跳转基础闭环：新增 `src/lib/navigation`，统一 `HybridLink`、`createHybridNavigator()` 和 `HybridRouteReporter`；已支持新开 H5 WebView、切 Tab、关闭当前 WebView、打开原生页、导航返回和 `route_changed` 上报。
- 首页、推广首页、我的页已按跳转原则接入：Tab 根页进入 H5 二级页默认新开 WebView；搜索/分类等二级页内部下钻商品详情保持当前 WebView push；推广首页头像/昵称/徽章不再跳权益中心，权益中心入口收敛到我的页。
- v1.2.0 首批静态高保真页面已完成：搜索首页、清除历史弹窗、搜索结果、搜索筛选弹层、完整热榜、推广商品页、推广商品筛选弹层、推广商品公告样式和限时秒杀页。
- v1.2.0 已新增 `DropdownFilterBar` 公共筛选组件，搜索结果页和推广商品页共用同一套筛选行/下拉层结构；商品图片暂按当前需求使用灰色色块占位，不接入本地图片资源。
- `DropdownFilterBar` 已补充公共状态 hook `useDropdownFilterBarState()` 和选中项标题展示规则；后续新列表/商品页筛选应复用该组件与 hook，保持“点击展开、选择关闭、标题展示已选项、蒙层关闭、展开时锁滚动”的统一交互。
- 已新增 `ProductImagePlaceholder` 公共商品缩略图缺省组件；搜索商品卡、推广商品卡、秒杀商品卡、购买弹窗和提交订单商品行已统一使用该组件，后续商品卡片在未接真实图片前不要再手写灰色色块。
- 商品分类页一级分类已改为页面内 state 切换，不再通过 `#level-*` hash 修改地址栏；当前右侧内容仍为静态 mock，但会随一级分类切换产生可见变化。
- 推广商品分享 Bridge payload 当前为原生联调临时口径，`productId` 固定发送 `1001`，后续接真实商品接口时需要恢复为真实商品 id 或后端约定字段。
- 首页“推广带货”活动入口已从推广 Tab 根页调整为 `/promotion/products`，按当前容器策略由原生新开 H5 WebView。
- v1.2.0 限时秒杀页已接入本地背景图 `seckill.heroBg`；推广商品页“推广”按钮已接入 `event/share` Bridge 事件，Web 环境无 Bridge 时安全 no-op。
- 商品详情购买链路已进入静态高保真阶段：商品详情“立即购买”打开底部购买弹窗，弹窗支持规格、配送方式、数量步进器和携参确认；`/order-confirm` 已替换为高保真提交订单页，支持默认地址态和未填写收货信息禁用提交态。
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
- H5 首页 Bridge 调试面板已能发出统一信封；原生 App 当前已能消费 H5 路由跳转信封并维护调试 WebView 栈，但设置、分享、登录重认证等仍是占位或待原生正式实现。
- active manifest 已约定由 server-meumall 提供，灰度规则和审批归属仍需与发布平台确认。
- H5 runtime 已可通过 server-meumall 拉取并缓存 manifest；原生 App 是否也需要拉取仍待确认。
- SSR 已覆盖当前模拟路由；最终随 App 内置的兜底页列表尚未确定。
- Figma 全局色彩 token 已完成首版 H5 落地；后续仍需确认设计、H5、原生是否共享同一套 token 发布和变更流程。
- 品牌主题、远程主题拉取和用户主题偏好持久化尚未实现。
- manifest resolver 和发布脚本第一版灰度规则尚未与发布平台最终口径对齐。
- API token 刷新、重新登录、真实 base URL 和原生代理策略尚未确定；当前已建立 H5 BFF 转 Authorization 的基础设施，Cookie 已按 `pythonToken` / `mallToken` 区分 Python 与 Java 服务，但真实 Java / Python base URL 仍需确认。
- Telemetry 真实采样点、采样率、隐私脱敏和平台上报策略尚未确定。
- 模拟电商页面的正式视觉、真实 icon 和真实 API 尚未实现。
- GitHub Actions workflow 已切回 SSR/standalone 产物归档，并支持可选注册 candidate release，但尚未在远端仓库环境中验证，仍需配置 `H5_SERVICE_BASE_URL`、`H5_RELEASE_SERVER_URL` 等 GitHub Secrets 和受保护环境。
- 本地 Jenkins 依赖 Mac Studio 的 Docker Desktop、Java 17、SSH key 和 `/Users/mac/person_code/meu-mall/meumall-ci` 工作目录；迁移到新机器时需要恢复这些本地运行条件。
- 当前 Jenkins release 注册通过 SSH tunnel 访问服务器内网 FastAPI；后续接入外部 CI 时应补充独立 CI token 鉴权。
- 推广模块真实后端接口尚未完成，首批页面将先基于 H5 BFF mock 开发；达人月销量、月 GMV、福利细则和榜单刷新规则仍需后续确认。
- 本地稳定图片资源可以随 H5 发版，但运营可替换图片、商品图、用户头像仍应由后台或 CMS 返回 CDN URL。
- 新增 H5 页面如果绕过 `localAssetUrl()` 直接写 `/assets/...`，或在资源工具中用动态 `process.env[key]` 读取客户端配置，线上 `/h5-v/<version>` 页面会丢失版本前缀并导致图片 404；新增页面提交前必须通过扫描、渲染测试或构建产物检查确认无裸本地资源路径。
- 本地开发如果只设置 `H5_BASE_PATH` 而漏掉 `NEXT_PUBLIC_H5_BASE_PATH`，客户端组件 hydrate 后仍可能把图片改成裸 `/assets/...`；根目录 `dev:h5` 和 `dev-all.sh` 已修复，手动启动时也必须同步设置两者。
- 浅绿顶部背景已作为共享资源存在，后续我的页、奖励记录、排行榜或其他同款头图页面不要再复制新文件，应复用 `shared.greenHeroBg` 或对应业务 alias。
- 权益中心 GSAP 动效当前只用于内部 H5 页面表现增强，后续若原生 WebView 性能不足，应优先降低动画时长或按设备能力关闭动效。
- H5 顶部导航已建立公共组件和页面预设；后续页面若继续手写状态栏、返回按钮或固定透明导航，会重新带来滚动容器和状态栏口径不一致风险。
- 排行榜头像当前仍为 H5 mock 渐变头像，占位效果用于页面框架和样式验证；后续真实用户头像应由后端或 CMS 返回远程 URL。
- v1.2.0 搜索、推广商品和限时秒杀当前仍为静态 mock 页面，未接真实商品搜索、榜单、推广商品、佣金、秒杀库存、秒杀资格和限时活动接口；后续进入联调前需要补齐 BFF service 和接口契约。

## 下一步建议

1. 推广模块进入后端契约确认和真实接口迁移准备阶段，后续需要确认真实活动、榜单、权益和达人等级接口。
2. 与 iOS / Android 确认 `router/navigate` 的 `webview/tab/back/close_webview/native_page` 和 `event/route_changed` 最终命名、payload 和手势返回行为。
3. 配置 SSR 部署平台、`H5_SERVICE_BASE_URL`、server-meumall active manifest URL、受保护环境和 manifest active 发布审批。
4. 确认首批需要内置的原生兜底页。
5. 基于现有 BFF mock 输出真实后端接口契约，确认活动、榜单、权益和达人等级数据字段。
6. 为 v1.2.0 搜索、推广商品和限时秒杀补真实 BFF service、接口契约、原生入口说明和联调验收用例。
7. 为后续 manifest、Bridge、theme runtime 和 API client 任务补充对应测试。
8. 后续新增 H5 页面优先套用 `StandardNavPage`、`TransparentNavPage` 或 `TransparentActionNavPage`，复杂导航变体先扩展 design-system，再接入业务页。
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
