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
- H5 HTTP 请求观测第一阶段：`createH5Client()` 支持 App / 设备 / 系统 / WebView 上下文 header，`createBackendClient()` 支持透传原始 `user-agent` 和客户端上下文，并提供结构化 backend call logger hook；示例 BFF route 已接入上下文透传。
- H5 HTTP 请求架构补齐：`createH5Client()` 已接入页面会话和最近请求诊断，`createBffRequestContext()` 统一 BFF auth / clientContext / backendClient / logger，首页 Runtime 和推广模块已提供 feature API adapter 样板。
- H5 首页真实接口首批接入：新增 `/api/bff/home`、`/api/bff/home/recommend-products` 和 `/api/bff/home/for-you-products`。首页核心 BFF 只调 Java `/p/app/home/index`；首页“为您推荐”商品区按 `current/size` 调 `/p/app/home/recommendProds`，并已支持底部进入视口后按 `current + 1` 下滑加载更多，加载到第 2 页后显示回到顶部按钮；首页“更多”进入的新页面 `/home/recommend-products` 标题为“相似推荐商品”，其列表按 `current/size` 调 `/p/app/home/forYouProds`，并已支持底部进入视口后按 `current + 1` 下拉加载更多。首页 BFF 响应采用 `view/modules/debugRaw` 结构：`view` 给当前页面渲染，`modules` 保留业务模块字段供后续扩展，`debugRaw` 仅 local/test 按需返回 Java 原始 envelope。
- H5 商品详情真实接口首批接入：新增 `/api/bff/product-detail?prodId=<prodId>`，由 H5 BFF 调 Java `/prod/prodInfo?prodId=<prodId>&addrId=0&dvyType=1`；新增 `/api/bff/order-confirm?productId=<prodId>&skuId=<skuId>&quantity=<n>`，订单确认页重新请求商品详情并校验 SKU、库存、价格和数量。本期只覆盖普通商品、快递、SKU 和立即购买到订单确认，不包含秒杀、拼团、自提、同城、购物车、正式下单和支付。
- 商品详情 `content` 富文本已接入：BFF mapper 使用 `sanitize-html` 清洗后端 HTML 并拼接富文本图片 OSS 地址，页面通过 `ProductRichContent` + `html-react-parser` 渲染富文本节点；危险标签、事件属性和危险协议会被移除。
- 商品详情迁移向导第一阶段继续补齐评论概要、主图媒体和中部展示逻辑：`/api/bff/product-detail` 在商品主数据成功后尽量聚合 Java `/shop/headInfo`、`/prod/prodCommData`、`/prod/prodCommPageByProd`；店铺头部仅保留在 modules，页面不展示店铺卡片；评价模块固定展示，主图支持视频 + 图片混合轮播，售后保障和资质条按旧字段逻辑映射。
- H5 三套环境 profile 已建立：`config/env/h5.local.env`、`config/env/h5.test.env`、`config/env/h5.prod.env`。当前三套均按联调要求指向 `https://hybird.aigcpop.com`，Java 后端为 `https://test.aigcpop.com/mini_h5`，Python 后端为 `https://test.aigcpop.com/api`；其中 `h5.prod.env` 是正式环境占位，正式域名完成后再替换。
- Java 图片 OSS base URL 已配置为 `JAVA_OSS_ASSET_BASE_URL=https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/`。首页 mapper 对 Java 返回的相对 `imgUrl` / `pic` / `icon` 会拼接该 base URL，完整 `http(s)` 图片 URL 保持原样。
- 首页已停止请求旧首页配置接口 `/api/h5/home/config/active`；当前获取 H5 active 版本使用 `/api/h5/manifest/active`，首页业务数据使用 `/api/bff/home`。
- BFF 排错日志已明确：后端调用日志前缀为 `[h5-bff-backend-call]`，BFF route 自身异常日志前缀为 `[h5-bff-route-error]`。
- `[h5-bff-backend-call]` 已补充后端业务 envelope 字段：`backendBusinessCode`、`backendBusinessMessage`、`backendBusinessSuccess`。排查时不能只看 `backendStatus`，HTTP 200 也可能是业务失败。
- `[h5-bff-backend-call]` 已补充后端出站请求快照：`requestUrl`、`requestQuery`、`requestBody`、`requestHeaders`。日志会掩码 `Authorization`、Cookie、token 和 secret 类敏感字段，只保留格式、首尾片段和长度用于联调判断。
- `[h5-bff-backend-call]` 支持后端响应快照日志：`H5_BFF_LOG_BACKEND_RESPONSE=1` 时以格式化 JSON 打印 `responseBody`、`responseBodySize`、`responseBodyTruncated`，嵌套数组和对象会完整展开。本地和测试 profile 默认打开，正式 profile 默认关闭；token、mobile、phone、address 等字段会掩码，超出 `H5_BFF_BACKEND_RESPONSE_LOG_LIMIT` 会截断。
- BFF 后端鉴权 header 已按联调结果区分：Python 使用 `Authorization: Bearer <pythonToken>`，Java / mall 使用 `Authorization: <mallToken>`，不拼接 `Bearer`。
- BFF 调 Java / mall 后端时已统一注入 `source: 1`，按 Java 来源枚举表示 App 来源；Python 后端不携带该 header。
- Java 后端 `ResponseEnum` 已沉淀到 `src/server/http/java-response-codes.ts`。当前重点映射 `A00004/UNAUTHORIZED -> AUTH_FAILED`、`A00005/EXCEPTION -> HTTP_ERROR`，完整启用码表已写入 API 规范。
- 本地开发 token 兜底已建立：仅 `APP_ENV=local` 且 Cookie 缺失时，BFF 使用 `.env.local` 中的 `H5_LOCAL_JAVA_TOKEN` / `H5_LOCAL_PYTHON_TOKEN`；测试和正式环境忽略该兜底。
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
- 我的页用户昵称后的 V1-V5 达人等级已接入独立横条 PNG 资源，路径位于 `public/assets/mine/level-badges/`，并通过 `mine.levelBadge.v1-v5` 资源 key 与 `localAssetUrl()` 解析。
- 个人中心二级页首批静态高保真已完成：`/wallet`、`/favorites/products`、`/footprints`、`/coupons` 和 `/orders` 均使用本地 mock 数据展示钱包、收藏/足迹编辑态、优惠券和订单列表/空态；`/mine` 钱包余额、优惠券和足迹入口已连接到对应页面。
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
- H5 全局已禁止页面级缩放：根 layout 的 viewport 固定 `minimumScale=1`、`maximumScale=1`、`userScalable=false`，并通过 `DisableViewportZoom` 拦截 App WebView 双指缩放手势。
- 首页“推广带货”活动入口已从推广 Tab 根页调整为 `/promotion/products`，按当前容器策略由原生新开 H5 WebView。
- v1.2.0 限时秒杀页已接入本地背景图 `seckill.heroBg`；推广商品页“推广”按钮已接入 `event/share` Bridge 事件，Web 环境无 Bridge 时安全 no-op。
- 商品详情购买链路已从静态高保真进入普通商品真实接口阶段：数字商品 ID 通过 BFF 拉取真实商品和 SKU，购买弹窗携带真实 `productId/skuId/quantity` 进入订单确认；订单确认页通过 BFF 重新校验商品、SKU、库存和价格。`p-1001` mock 仍保留为静态高保真验证入口。
- Telemetry 基础：事件类型、noop reporter、telemetry client、白屏评估策略和首屏性能事件构造。
- 电商模拟页面：首页、分类、商品详情、购物车和我的页，使用本地 mock 数据和色块 icon 占位。
- 静态缺省资源：offline、not-found、error、maintenance HTML。
- `.env.example` 已收敛为 SSR 服务配置占位，不包含 OSS 发布参数。
- Git 提交信息规范检查：Conventional Commits、commitlint 和 husky commit-msg hook。

## 尚未实现

- 真实业务页面。
- 秒杀、拼团、自提、同城、收藏、优惠券领取、正式下单、支付和订单持久化真实接口。
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
- H5 首页 Bridge 调试面板已能发出统一信封；原生 App 当前已能消费 H5 路由跳转信封并维护调试 WebView 栈；H5 原生页跳转当前直接发送 `router/navigate route=<native-page>`，例如我的页设置入口发送 `route=settings`；分享、登录重认证等仍是占位或待原生正式实现。
- active manifest 已约定由 server-meumall 提供，灰度规则和审批归属仍需与发布平台确认。
- H5 runtime 已可通过 server-meumall 拉取并缓存 manifest；原生 App 是否也需要拉取仍待确认。
- SSR 已覆盖当前模拟路由；最终随 App 内置的兜底页列表尚未确定。
- Figma 全局色彩 token 已完成首版 H5 落地；后续仍需确认设计、H5、原生是否共享同一套 token 发布和变更流程。
- 品牌主题、远程主题拉取和用户主题偏好持久化尚未实现。
- manifest resolver 和发布脚本第一版灰度规则尚未与发布平台最终口径对齐。
- API token 刷新、重新登录和原生代理策略尚未确定；当前已建立 H5 BFF 转 Authorization 的基础设施，Cookie 已按 `pythonToken` / `mallToken` 区分 Python 与 Java 服务，本地/测试/正式占位 profile 已统一注入当前测试 Java / Python base URL。
- Java / Python 后端尚未接入 `x-request-id` 和客户端上下文日志，当前请求观测链路在 H5 BFF 侧已具备透传、最近请求诊断和日志 hook，端到端后端日志检索仍需后续后端适配。
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
- H5 已按 App 内嵌页面口径禁止页面级缩放；后续如果引入第三方组件、地图、富文本或 iframe，需要确认它们不会重新开启局部缩放或阻断单指滚动。
- 排行榜头像当前仍为 H5 mock 渐变头像，占位效果用于页面框架和样式验证；后续真实用户头像应由后端或 CMS 返回远程 URL。
- 首页和商品详情普通商品快递链路已接入首批真实接口，但真实数据展示依赖 App/WebView 注入有效 `mallToken`；无 token 时 Java 返回 `A00004 Unauthorized`，H5 会展示 fallback 或可恢复错误。
- v1.2.0 搜索、推广商品和限时秒杀当前仍为静态 mock 页面，未接真实商品搜索、榜单、推广商品、佣金、秒杀库存、秒杀资格和限时活动接口；商品详情也只完成普通商品快递链路，秒杀、拼团、自提、同城、正式下单和支付仍需后续补齐 BFF service 和接口契约。
- 个人中心二级页当前仍为静态 mock 页面，钱包流水、收藏/足迹删除、优惠券领取/使用和订单操作尚未接真实接口或真实业务动作。

## 下一步建议

1. 推广模块进入后端契约确认和真实接口迁移准备阶段，后续需要确认真实活动、榜单、权益和达人等级接口。
2. 与 iOS / Android 确认 `router/navigate` 的 `webview/tab/back/close_webview`、原生页直接 route、`event/route_changed` 最终命名、payload 和手势返回行为。
3. 正式服务器和域名完成后，替换 `config/env/h5.prod.env` 中的 H5、Java、Python base URL，并同步发布/运维文档。
4. 确认首批需要内置的原生兜底页。
5. 基于现有 feature API adapter 和 BFF mock 输出真实后端接口契约，确认活动、榜单、权益和达人等级数据字段。
6. 为 v1.2.0 搜索、推广商品和限时秒杀补 feature API adapter、真实 BFF service、接口契约、原生入口说明和联调验收用例。
7. 用 App 注入的真实 `mallToken` 验证首页 `/api/bff/home`、首页推荐 `/api/bff/home/recommend-products`、相似推荐商品页 `/api/bff/home/for-you-products`、商品详情 `/api/bff/product-detail?prodId=1000054` 和订单确认 `/api/bff/order-confirm?productId=1000054&skuId=<skuId>&quantity=1` 能返回真实数据。
8. 为后续 manifest、Bridge、theme runtime 和 API client 任务补充对应测试。
9. 后续新增 H5 页面优先套用 `StandardNavPage`、`TransparentNavPage` 或 `TransparentActionNavPage`，复杂导航变体先扩展 design-system，再接入业务页。
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
