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
- Figma 色彩组件已沉淀为 `src/design-system` 设计体系基础，提供全局 color/radius/shadow/typography/spacing token 和 AppScreen、Section、Surface、Metric、StateView、Skeleton、AssetPlaceholder、IconFont 等 UI primitives。
- iconfont Font class 单色图标体系已接入 design-system：字体文件本地随 H5 打包，`IconFont` 提供统一使用入口，`pnpm icons:sync -- --source <iconfont下载目录>` 可从下载包重新生成 CSS、字体文件和类型清单。
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
- 运营注册二维码固定入口已确定为 `https://hybird.aigcpop.com/register`；实际页面仍在 active H5 版本 `/h5-v/<version>/register`，由 server-meumall public entry 302。
- Light/Dark 主题 token、主题 allowlist 和运行时应用 API。
- API Client 基础：`ApiResult<T>`、`ApiError`、`RequestMeta`、base URL、requestId、Bridge token 来源、超时和错误归一化。
- H5 BFF HTTP 鉴权基础：原生 Cookie 登录态、Next 服务端读取 `pythonToken` / `mallToken`、服务端按 Python / Java 后端选择 token 并转 Authorization、浏览器端 H5 client 请求 BFF；钱包推广订单额外读取原生 Cookie `userInfo.phone` 作为 Java `queryPromotionOrder.userId`。
- H5 HTTP 请求观测第一阶段：`createH5Client()` 支持 App / 设备 / 系统 / WebView 上下文 header，`createBackendClient()` 支持透传原始 `user-agent` 和客户端上下文，并提供结构化 backend call logger hook；示例 BFF route 已接入上下文透传。
- H5 HTTP 请求架构补齐：`createH5Client()` 已接入页面会话和最近请求诊断，`createBffRequestContext()` 统一 BFF auth / clientContext / backendClient / logger，首页 Runtime 和推广模块已提供 feature API adapter 样板。
- 支付结果主链路已调整为按订单号回查：新增 `/api/bff/order-is-paid` 对接 Java `/p/order/isPay/{payEntry}/{orderNumbers}`，支付结果页固定 `payEntry=0`；订单确认进入收银台、收银台进入支付结果页均使用 `replace`，支付宝支付优先发起 `paymentStartAlipay`，微信支付优先发起 `paymentStartWechat`，旧 `paymentStartCashier` 仅作为 `unsupported` fallback，通联支付发起后 H5 立即进入 `/pay-result`，由结果页展示“查看支付状态 / 查看订单”。
- H5 首页真实接口首批接入：新增 `/api/bff/home`、`/api/bff/home/recommend-products` 和 `/api/bff/home/for-you-products`。首页核心 BFF 只调 Java `/p/app/home/index`；首页“为您推荐”商品区按 `current/size` 调 `/p/app/home/recommendProds`，并已支持底部进入视口后按 `current + 1` 下滑加载更多，加载到第 2 页后显示回到顶部按钮；首页“更多”进入的新页面 `/home/recommend-products` 标题为“相似推荐商品”，其列表按 `current/size` 调 `/p/app/home/forYouProds`，并已支持底部进入视口后按 `current + 1` 下拉加载更多，首屏默认展示骨架屏；首页正式联调阶段不再使用 `homeExperienceData` 补齐 banner、分类或推荐商品，接口失败展示错误/空业务态；首页“限时秒杀”和“推广带货”入口卡是 H5 固定 UI，分别固定跳转 `/seckill` 和 `/promotion/products`，不再由首页聚合接口或配置模块控制；相似推荐商品卡进入详情时已复用 `HybridLink strategy="new-webview"`，与首页商品详情入口保持同一 WebView 容器策略。首页分页 BFF 响应采用 `view/modules/debugRaw` 结构：`view` 给当前页面渲染，`modules` 保留业务模块字段供后续扩展，`debugRaw` 仅 local/test 按需返回 Java 原始 envelope。
- H5 真实接口联调渲染规则已固化：进入联调阶段的页面首屏先展示骨架屏或 loading，接口成功后只渲染真实数据，列表空数据展示 `EmptyState` 或业务空态，失败展示错误、重试、登录态或兼容提示，不再使用本地 mock 数据作为页面兜底。
- 首页分类映射已按 2026-06-25 Apifox 最新口径修正：`/p/app/home/index` 中的 `navList` 直接作为首页分类区来源；`navType=1` 进入 `/search/ranking`，若后端返回 `rankType/categoryId` 则携带到完整热榜页用于默认选中对应标签；`navType=2` 进入 `/search?categoryId=<categoryId>`；`navType=3` 进入 `/category`；不再拼接 `hotCategory + categoryTop8`。banner 或分类为空时展示骨架屏，不使用本地 mock 业务数据。
- 搜索首页热门词已接入真实 BFF：新增 `/api/bff/search/hot-keywords?type=1` -> Java `/search/hotSearch?type=1`；`/search` 热门搜索区域首屏展示骨架屏，成功后只渲染真实热词，空数组展示“暂无热门搜索”，失败展示“热门搜索加载失败”，不拼接本地 mock 热词。搜索历史改为前端 localStorage `meumall.search.history`，提交搜索或点击热词写入本地，支持清空全部历史和单条删除指定关键词。
- 搜索热榜已接入真实 BFF：新增 `/api/bff/search/ranking` -> Java `/search/rankTabs` 和 `/search/rank/{rankType}`；`/search` 下方热榜模块传 `categoryBoardCount=4`，商品只展示前三条，`/search/ranking` 完整榜单不传 `categoryBoardCount` 并完整展示商品；首屏展示骨架，成功后只渲染真实标签和商品，切换标签会按 `rankType/categoryId` 重新请求商品列表，空数组展示通用空态且外层不使用白底卡片，失败展示“热榜加载失败”，不拼接本地 mock 热榜商品。搜索页进入完整榜单、热榜商品详情或搜索结果商品详情时使用 `window.location.replace(buildClientHref(...))` 替换当前搜索 history，避免 App 返回按钮或滑动返回停回搜索页；进入完整榜单会携带当前标签 `rankType/categoryId`，完整榜单页内切换标签只更新 state 和 BFF 请求，不操作 URL。
- 搜索结果商品已接入真实 BFF：新增 `/api/bff/search/products` -> Java `/p/app/prod/page`，支持 `keyword/orderBy/categoryId/categoryOptionsParentId`；首页分类或分类 leaf 进入 `/search?categoryId=<id>` 时无关键词也展示结果页，并通过 `/category/list?parentId=<id>&shopId=0` 获取当前类目的所有子孙类目；搜索框、热门搜索、搜索历史进入 `/search?q=<keyword>` 时不带 `categoryId`，通过 `/category/list?parentId=0&shopId=0` 获取全局分类树；搜索结果页分类筛选接口默认不传 `depth`；BFF 递归保留 Java 返回项的 `children/categories` 子孙树，H5 点击类目后优先直接展示已返回的所有子孙类目；排序 UI 只保留销量/价格两个互斥条件，点击同一条件切换升降序；筛选区已优化为“综合筛选”摘要、分段排序按钮和分级类目标题；分类面板展开时有蒙层并锁定页面滚动，点击类目只更新待确认选中态，点击“确认”才应用分类请求，点击“重置”清空分类并重新请求；搜索结果页内再次搜索或清空关键词只更新本页关键词 state 并用 `history.replaceState` 同步 URL，不重置排序/分类筛选；输入框使用 `type=text`，只保留 H5 自定义清空按钮；搜索结果页首屏只展示骨架屏，商品空数组展示通用空态，接口失败展示错误态，不拼接本地 mock 商品或分类；商品有下一页时底部进入视口自动加载下一页，不再展示手动“加载更多”按钮。
- 商品分类页已接入真实 BFF：新增 `/api/bff/category/list` -> Java `/category/list?parentId=-1&shopId=0&depth=3`；`/category` 首屏展示骨架屏，成功后渲染真实分类树，空数组展示“暂无分类”，失败展示“分类加载失败”，不拼接本地 mock 分类；三级/叶子分类点击与首页 `navType=2` 同口径，进入 `/search?categoryId=<categoryId>`。
- H5 商品详情真实接口首批接入：新增 `/api/bff/product-detail?prodId=<prodId>`，由 H5 BFF 调 Java `/prod/prodInfo?prodId=<prodId>&addrId=0&dvyType=1`；数字商品 ID 首屏展示商品详情骨架屏，等待真实接口成功后再渲染详情，不再展示“正在加载商品”假数据；主图无媒体时复用 `ProductImagePlaceholder` 通用商品图片空态。新增 `/api/bff/order-confirm?productId=<prodId>&skuId=<skuId>&quantity=<n>&addrId=<addrId>`，订单确认页先调 Java `/p/address/addrInfo/{addrId|0}` 解析默认/选中收货地址，再请求商品详情并校验 SKU、库存、价格和数量，随后按旧 uni-app 立即购买参数调用 Java `/p/order/confirm` 生成确认上下文，`dvyTypes` 包含 `lat:null/lng:null/stationId:0`；新增 `/api/bff/order-submit`，BFF 先解析收货地址，无地址时返回 409，再依次调用 Java `/prod/prodInfo`、`/p/order/confirm` 和 `/p/order/submit` 创建普通快递待支付订单，提交体包含旧确认页的 `orderFlowLogParam` 并优先用确认返回的 `shopCartOrders` 生成 `orderShopParams`。订单创建成功后进入 `/pay-way` 收银台；新增 `/api/bff/order-pay-info`，BFF 调 Java `/p/order/getOrderPayInfoByOrderNumber`、`/sys/config/info/getSysPaySwitch` 和 `/sys/config/paySettlementType` 展示订单金额、过期时间、支付状态、支付方式和结算类型；新增 `/api/bff/order-pay`，点击“确定支付”后调用 Java `/p/order/pay` 生成普通支付宝/微信 SDK 参数或通联支付参数；新增 `/api/bff/allinpay-order-status` 和 `/pay-result`，测试环境 `paySettlementType=1` 时支付宝通过 `paymentStartAlipay + paymentMode=allinpay-url + paymentUrl + sdkPayload` 交给 App 打开通联支付 URL，微信通过 `paymentStartWechat + paymentMode=allinpay-mini-program-bridge + sdkPayload/chnlFrontParamInfo` 交给 App 直开通联小程序收银台；收银台金额面板、支付方式选中态、底部提交栏和加载/错误状态已完成 App 内视觉优化。本期覆盖普通商品、快递、SKU、立即购买、订单确认、待支付订单创建、收银台真实发起支付、通联支付宝回查和通联微信 Bridge payload，不包含秒杀、拼团、自提、同城、购物车和支付成功后权益/订单状态的完整闭环。
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
- 独立 H5 调试 Token 登录页已建立：浏览器独立打开且缺少 `mallToken` / `pythonToken` 时可进入 `/debug-login` 手动写入 Java Token、Python Token 和 UserInfo JSON；已有 token 但缺少 `userInfo` 时直接访问 `/debug-login` 可补写 `userInfo.phone`，首页不会因此自动跳调试页；检测到 `statusHeight`、`meu_page_config`、App/WebView header 或 `x-platform=ios/android` 时返回 404，避免在原生 App WebView 内展示。
- 首页原生传参展示面板：通过 `/api/bff/runtime/context` 展示完整 Cookie 值、`pythonToken`、`mallToken`、`statusHeight`、`meu_page_config`、URL 参数和环境信息；该面板仅限当前内部调试，正式开放前必须删除或关闭。
- 推广模块首批页面：已实现推广首页五档达人主题、活动中心、榜单中心、达人销量榜、达人销售额榜和达人权益中心；推广首页 `/promotion` 已接入真实概览 BFF `/api/bff/promotion/home` -> Java `/p/distribution/home/overview`；活动中心 `/promotion/activities` 已接入真实 BFF `/api/bff/promotion/activities` -> Java `/p/app/distribution/incentive/page`，首屏按 `displayStates=[1,2,3,4]` 和 `[0]` 分别拉取进行中/已暂停活动；历史活动 `/promotion/activities/history` 使用 `displayStates=[6]`；活动详情 `/promotion/activities/[id]` 当前只请求 Java `/p/app/distribution/incentive/detail/{id}`。详情页顶部不展示活动标题和 `ruleSummary`，主按钮按 `displayState` 展示“去带货 / 去领奖 / 查看奖励”或隐藏；`去领奖` 进入 `/promotion/activities/[id]/reward?mode=receive`，`查看奖励` 进入 `/promotion/activities/[id]/reward?mode=view`，奖励页单独请求 `/p/app/distribution/incentive/reward/detail/{id}` 展示完成文案、全部奖励、领取按钮和奖励详情弹层；导航栏右侧“活动规则”进入 `/promotion/activities/[id]/rules`，展示清洗后的 `ruleContent`。活动列表、详情、奖励详情失败或 token 缺失不回退本地 mock。
- 推广首页已重构为 `pages/PromotionHomePage` + 业务 section components + `theme/talent-theme`，作为后续页面工程化样板。
- 推广二级页已按 design-system 模式迁移：活动中心、榜单中心、榜单详情和权益中心的常规颜色使用 token，业务视觉参数集中到 `theme/promotion-page-theme.ts`。
- 达人徽章、推广首页达人背景、汇总卡背景 V1-V5 已接入本地 PNG 静态资源，路径位于 `public/assets/promotion/talent-badges/`，并通过 `src/lib/assets/local-assets.ts` 的资源 key 统一解析。
- H5 本地静态资源已确认为强约束：业务组件和 mock 不直接保存 `/assets/...` 裸路径，稳定本地图片必须注册到 `src/lib/assets/local-assets.ts` 并通过 `localAssetUrl()` 解析版本 basePath 或后续 CDN 前缀；资源工具必须使用显式 `process.env.NEXT_PUBLIC_*`，禁止动态 `process.env[key]`，避免客户端 hydrate 或切换状态后丢失版本前缀。
- 本地 H5 dev 启动必须同时设置 `H5_BASE_PATH=/hybird` 和 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`；Next `basePath` 和客户端 `localAssetUrl()` 必须使用同一个公开 basePath，避免 SSR 图片路径正确但 hydration 后退回裸 `/assets/...`。
- 权益中心已接入 V1-V5 本地背景、左右切换箭头和权益 icon 资源，页面首屏由 SSR 准备五档数据，客户端支持左右滑切换、query 同步和 GSAP transform/opacity 动效。
- 达人销量榜和达人销售额榜已按 2026-06-05 最新 Figma 节点重做为浅绿渐变头图、三榜 tab、绿色分段周期控件、三列领奖台、白底列表和底部当前用户栏；领奖台背景和皇冠继续通过本地资源 registry 与 `localAssetUrl()` 引用。
- 我的页、奖励记录和排行榜已复用共享浅绿顶部背景 `shared.greenHeroBg`，业务 key `mine.hero.background`、`promotion.rewardRecordsBg`、`promotion.rankingHeroBg` 均解析到 `public/assets/shared/green-hero-bg.png`。
- 我的页用户昵称后的 V1-V5 达人等级已接入独立横条 PNG 资源，路径位于 `public/assets/mine/level-badges/`，并通过 `mine.levelBadge.v1-v5` 资源 key 与 `localAssetUrl()` 解析。
- 我的页 `/mine` 已接入真实 BFF `/api/bff/mine/summary` -> Java `/p/app/profile/summary`、`/p/daren/level/myLevel`，展示真实钱包余额、今年已省、可用优惠券和当前达人等级；权益中心入口携带当前等级。个人中心二级页中 `/wallet` 已接真实 BFF `/api/bff/wallet/summary`、`/api/bff/wallet/history-status` 和 `/api/bff/wallet/orders`：汇总获取 Java `/p/distribution/wallet/infoV2?userMobile=<userInfo.phone>`，历史状态获取 Python `/user/wallet_state`，订单按 `state/current/size` 获取 `/p/distribution/api/queryPromotionOrder`，钱包汇总 `userMobile` 和推广订单 `userId` 都来自原生 Cookie `userInfo.phone`；历史状态 `state=1` 时导航栏右侧展示“历史钱包”，点击发送 Native Bridge `router/navigate route=history-wallet` 给 App 打开原生历史钱包页；账户卡片按 Figma 节点 `677:29231` 展示，`提现` 靠近帐户余额金额，帐户余额和可提现金额都取 `canWithdrawAmount`，点击提现后打开金额弹窗并消费 `/api/bff/wallet/withdraw` -> Java `/p/allinpay/member/memberWithdrawApply`，前端和 BFF 都校验金额不超过 `canWithdrawAmount`，转 Java body 只包含 `{ amount }`；`提现记录` 位于账户卡片右上角并进入 `/wallet/withdraw-records`；提现记录页消费 `/api/bff/wallet/withdraw-records` -> Java `/p/userWithdraw/pageDateUserWithdrawCash`，按年月分组展示并支持触底加载更多。页面切换结算 tab 只重置订单并请求第一页，触底加载更多订单。新增 `/wallet/account` 账户管理页，当前只展示“认证信息”入口；`/wallet/account/certification` 认证信息页消费 `/api/bff/wallet/member-info` -> Java `/p/allinpay/member/getMemberBasicInfoV2` 获取会员姓名和身份证号，同时复用 `/api/bff/wallet/bank-cards` 展示银行卡列表预览并可跳转 `/wallet/bank-cards`。新增 `/wallet/bank-cards` 银行卡管理和 `/wallet/bank-cards/add` 添加银行卡页，查询 `/p/allinpay/member/queryBankCardV2`，创建会员申请 `/p/allinpay/member/createMemberApply` 只传 `acctNum/cerNum/phone`，解绑银行卡 `/p/allinpay/member/unbindBankCardV2` 只传 `acctNum`，`signNum/name` 均由后端自行获取。`/coupons` 仍为静态高保真或 mock；`/favorites/products` 和 `/footprints` 已接真实 BFF：收藏列表 `/api/bff/favorites/products` -> Java `/p/user/collection/prods`，取消收藏 `/api/bff/favorites/products/cancel` -> `/p/user/collection/addOrCancel`，足迹列表 `/api/bff/footprints` -> `/p/prodBrowseLog/page`，批量删除 `/api/bff/footprints/delete` -> `/p/prodBrowseLog`；页面首屏 loading、空数组使用通用 `EmptyState`，失败展示重试，不回退本地 mock。订单列表、独立退货退款列表、普通快递订单详情和退款详情已接真实 BFF：`/api/bff/orders` -> Java `/p/myOrder/myOrder`，`/api/bff/orders/refunds` -> `/p/orderRefund/list`，`/api/bff/orders/detail` -> `/p/myOrder/orderDetail` + `/p/myDelivery/orderInfo/{orderNumber}`，`/api/bff/orders/refund-detail` -> `/p/orderRefund/info`；页面路由为 `/orders`、`/orders/[orderNumber]`、`/refunds`、`/refunds/[refundSn]`，旧 `/orders/refunds/[refundSn]` 仅兼容重定向；取消、继续付款、确认收货、查看物流锚定、删除和联系商家留言已接入，待 App WebView 真实 `mallToken` 联调验证。
- 收货地址模块已完成页面、真实 BFF、App Bridge 优先接入和交易选择流优化：新增 `/address` 地址列表和 `/address/edit` 新增/编辑地址页，地址空态图和定位图标复制自旧 uni-app 项目并注册到 `localAssetUrl()`；我的页“地址管理”入口连接到 `/address` 管理态；商品详情和订单确认进入地址列表时使用统一 `select/from/flowId/productId/skuId/quantity/addressId` 地址流上下文。地址列表“使用”会写入一次性 `sessionStorage` 结果并 `history.back()` 回来源页，来源页消费后通过 `history.replaceState` 修正 URL 并重新请求商品详情或订单确认接口；新增/编辑地址保存成功后先回到地址列表，用户仍需明确点击“使用”才切换交易地址。H5 已新增 `rpc/address.*` typed Bridge adapter，地址列表、详情、新增、编辑、设默认和删除优先通过 App Bridge，Bridge 不可用时回退 `/api/bff/address/*` 和 Java `/p/address/*`；商品详情页会通过 URL/选择结果/Bridge 默认地址刷新配送行和商品详情 BFF 的 `addrId`；订单确认无地址参数时也会先通过 Bridge 获取默认地址。交易链路仍用 Java `/p/address/addrInfo/{addrId}` 做服务端校验。新增/编辑地址页省市区通过 `/api/bff/address/regions` -> Java `/p/area/listByPid` 获取；地址列表、省市区接口无数据时展示空态、错误提示或空选项，不使用本地轻量业务数据兜底。定位按钮预留 `address.chooseLocation` Bridge 并输出 `[MeuMall][address-location]` 调试日志，App 未接入时只提示等待接入。
- 排行榜领奖台已收敛为 360px 容器内三卡贴合居中布局，皇冠固定在头像顶部右侧；排行榜顶部导航确认使用 `TransparentNavPage` / `TopNavigation` 公共组件。
- Figma 品牌色常规 `#A8F156` 已补充为 design-system `brand.normal` token，用于排行榜周期控件描边等场景。
- Native Bridge 统一信封调试 runtime：支持 `router/event/rpc`、`callbackId`、`window.__bridgeHandler.resolve/reject/emit`、首页调试按钮和 Web fallback 日志。
- H5 与原生路由跳转基础闭环：新增 `src/lib/navigation`，统一 `HybridLink`、`createHybridNavigator()` 和 `HybridRouteReporter`；已支持新开 H5 WebView、切 Tab、关闭当前 WebView、打开原生页、导航返回和 `route_changed` 上报。
- 首页、推广首页、我的页已按跳转原则接入：Tab 根页进入 H5 二级页默认新开 WebView；分类等二级页内部下钻商品详情保持当前 WebView push；搜索页离开到完整榜单或商品详情使用 replace，返回链路回到搜索页之前的首页；推广首页头像/昵称/徽章不再跳权益中心，权益中心入口收敛到我的页。
- v1.2.0 首批静态高保真页面已完成：搜索首页、清除历史弹窗、搜索结果、搜索筛选弹层、完整热榜、推广商品页、推广商品筛选弹层、推广商品公告样式和限时秒杀页。
- v1.2.0 已新增 `DropdownFilterBar` 公共筛选组件，搜索结果页和推广商品页共用同一套筛选行/下拉层结构；商品图片暂按当前需求使用灰色色块占位，不接入本地图片资源。
- `DropdownFilterBar` 已补充公共状态 hook `useDropdownFilterBarState()` 和选中项标题展示规则；后续新列表/商品页筛选应复用该组件与 hook，保持“点击展开、选择关闭、标题展示已选项、蒙层关闭、展开时锁滚动”的统一交互。
- 已新增 `ProductImagePlaceholder` 公共商品缩略图缺省组件；搜索商品卡、推广商品卡、秒杀商品卡、购买弹窗和提交订单商品行已统一使用该组件，后续商品卡片在未接真实图片前不要再手写灰色色块。
- 已新增 `EmptyState` 通用空态组件，默认使用喵呜空盒子角色图，支持调用方自定义文案、图片尺寸、字体大小、颜色和间距；限时秒杀页和推广商品页无商品时已复用该组件。
- 商品分类页一级分类已改为页面内 state 切换，不再通过 `#level-*` hash 修改地址栏；当前左侧和右侧内容均来自 Java 分类树。
- 推广商品分享 Bridge payload 当前为原生联调临时口径，`productId` 固定发送 `1001`，后续接真实商品接口时需要恢复为真实商品 id 或后端约定字段。
- H5 全局已禁止页面级缩放：根 layout 的 viewport 固定 `minimumScale=1`、`maximumScale=1`、`userScalable=false`，并通过 `DisableViewportZoom` 拦截 App WebView 双指缩放手势。
- 首页“推广带货”活动入口已从推广 Tab 根页调整为 `/promotion/products`，按当前容器策略由原生新开 H5 WebView。
- v1.2.0 限时秒杀页已接入本地背景图 `seckill.heroBg`；推广商品页“推广”按钮已接入 `event/share` Bridge 事件，Web 环境无 Bridge 时安全 no-op。
- 限时秒杀页和推广商品页真实分页已接入：新增 `/api/bff/seckill/products` -> Java `/p/app/home/seckillProds`，`/api/bff/promotion/products` -> Java `/p/distribution/prod/productPage`；链调阶段两个页面均不拼接本地 mock，Java 空列表展示空态，商品卡进入 `/product/<prodId>`，推广分享 payload 已恢复使用真实 `prodId`。
- 商品详情购买链路已从静态高保真进入普通商品真实接口阶段：数字商品 ID 通过 BFF 拉取真实商品和 SKU，购买弹窗携带真实 `productId/skuId/quantity` 进入订单确认；订单确认页通过 BFF 重新校验商品、SKU、库存和价格。`p-1001` mock 仍保留为静态高保真验证入口。
- Telemetry 基础：事件类型、noop reporter、telemetry client、白屏评估策略和首屏性能事件构造。
- 电商模拟页面：首页、分类、商品详情、购物车和我的页，使用本地 mock 数据和色块 icon 占位。
- 静态缺省资源：offline、not-found、error、maintenance HTML。
- `.env.example` 已收敛为 SSR 服务配置占位，不包含 OSS 发布参数。
- Git 提交信息规范检查：Conventional Commits、commitlint 和 husky commit-msg hook。

## 尚未实现

- 真实业务页面。
- 秒杀、拼团、自提、同城、商品详情收藏状态切换、优惠券领取、通联微信小程序支付桥真机回调、App 正式支付宝/微信 SDK handler 和真实支付验签闭环。
- App 正式地址数据源接入 `rpc/address.*`；完整全国行政区树、App 定位/地图选点和更完整的地址校验体验。
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
- 推广首页概览、活动中心、活动详情、权益中心、排行榜销量榜和销售额榜真实接口已接入，联调阶段不回退本地 mock；佣金明细、名片、奖励记录列表等真实后端接口仍待确认，达人月销量、月 GMV、福利细则和榜单刷新规则仍需后续确认。
- 本地稳定图片资源可以随 H5 发版，但运营可替换图片、商品图、用户头像仍应由后台或 CMS 返回 CDN URL。
- 新增 H5 页面如果绕过 `localAssetUrl()` 直接写 `/assets/...`，或在资源工具中用动态 `process.env[key]` 读取客户端配置，线上 `/h5-v/<version>` 页面会丢失版本前缀并导致图片 404；新增页面提交前必须通过扫描、渲染测试或构建产物检查确认无裸本地资源路径。
- iconfont 字体文件通过 Next CSS 资源打包，不放在 `public/assets` 中；后续更新必须使用 `icons:sync` 显式生成并提交，不能在 CI 构建时动态拉取 iconfont 最新线上资源。
- 本地开发如果只设置 `H5_BASE_PATH` 而漏掉 `NEXT_PUBLIC_H5_BASE_PATH`，客户端组件 hydrate 后仍可能把图片改成裸 `/assets/...`；根目录 `dev:h5` 和 `dev-all.sh` 已修复，手动启动时也必须同步设置两者。
- 浅绿顶部背景已作为共享资源存在，后续我的页、奖励记录、排行榜或其他同款头图页面不要再复制新文件，应复用 `shared.greenHeroBg` 或对应业务 alias。
- 权益中心 GSAP 动效当前只用于内部 H5 页面表现增强，后续若原生 WebView 性能不足，应优先降低动画时长或按设备能力关闭动效。
- H5 顶部导航已建立公共组件和页面预设；后续页面若继续手写状态栏、返回按钮或固定透明导航，会重新带来滚动容器和状态栏口径不一致风险。
- H5 已按 App 内嵌页面口径禁止页面级缩放；后续如果引入第三方组件、地图、富文本或 iframe，需要确认它们不会重新开启局部缩放或阻断单指滚动。
- 排行榜头像当前仍为 H5 mock 渐变头像，占位效果用于页面框架和样式验证；后续真实用户头像应由后端或 CMS 返回远程 URL。
- 推广排行榜销量榜和销售额榜已接入真实 BFF：`/api/bff/promotion/rankings/sales` -> Java `/p/distribution/rank/list?rankType=1`，`/api/bff/promotion/rankings/amount` -> Java `/p/distribution/rank/list?rankType=2`；我的排名来自同一响应内 `myRank`；支持日/周/月和 `statPeriod`，空榜展示空态，失败或 token 缺失不回退 mock；榜单类型和周期切换只更新页面 state 与 BFF 请求，不修改 URL。达人激励榜 `/promotion/ranking/incentive` 当前固定空态，不请求 `rankType=4`。
- 榜单中心 `/promotion/rank-center` 当前仅达人销量榜和达人销售额榜可点击；达人激励榜、战队销量榜、战队销售额榜均置灰不可点击。
- 推广激励活动已接入 APP 侧 Java 接口：列表 `/p/app/distribution/incentive/page`、详情 `/p/app/distribution/incentive/detail/{id}`、奖励详情 `/p/app/distribution/incentive/reward/detail/{id}`、领取奖励 `PATCH /p/app/distribution/incentive/reward/receive/{recordId}`。H5 BFF 路由为 `/api/bff/promotion/activities`、`/api/bff/promotion/activities/[id]`、`/api/bff/promotion/activities/[id]/reward`、`/api/bff/promotion/activities/rewards/[recordId]/receive`；列表 BFF 支持 `displayStates`，活动中心拉 `[1,2,3,4]` 和 `[0]`，历史页拉 `[6]`；活动详情页只调活动详情接口，领奖/查看奖励页 `/promotion/activities/[id]/reward` 独立调奖励详情接口并按 `deliverState` 展示领取或查看；实物奖励地址选择完整交互后置，当前仅支持透传已有 `addressId`。
- 卖手活动已接入 Java 真实接口：营销活动入口 `/api/bff/seller-activities` -> `/p/sellerActivity/availableList`；活动商品配置 `/api/bff/seller-activities/[activityId]/products` -> `/p/sellerActivity/page`；活动商品详情 `/api/bff/seller-activities/[activityId]/products/[prodId]` -> `/p/sellerActivity/detail`；保存 `/api/bff/seller-activities/save-or-update` -> `/p/sellerActivity/saveOrUpdate`；批量状态 `/api/bff/seller-activities/batch-status` -> `/p/sellerActivity/batchStatus`；新增商品来源 `/api/bff/seller-activities/[activityId]/available-products` -> `/p/distribution/prod/productPage`。页面路由为 `/seller/activities`、`/seller/activities/[activityId]`、`/seller/activities/[activityId]/products`、`/seller/activities/[activityId]/products/[prodId]`；原生智能体入口只需打开 `/seller/activities`。配置页 tab 切换不修改 URL，进行中批量按钮为暂停，已暂停批量按钮为开始；联调阶段不回退本地 mock。
- 首页和商品详情普通商品快递链路已接入首批真实接口，但真实数据展示依赖 App/WebView 注入有效 `mallToken`；无 token 时 Java 返回 `A00004 Unauthorized`，H5 展示错误/空业务态或可恢复错误，不回退本地 mock 业务数据。
- `/debug-login` 会在浏览器独立 H5 中写入 JS 可读调试 Cookie，仅用于当前线上/测试联调；原生 App 正式路径仍必须由 App 写入 `mallToken` / `pythonToken` / `userInfo`，不要把该页面扩展成正式账号登录或在 App 内作为补偿登录入口。
- v1.2.0 搜索首页热门词、搜索热榜、搜索结果商品和商品分类页已接真实接口；推广商品列表、推广首页、权益中心、我的页、收藏商品、我的足迹和限时秒杀列表已接真实 BFF；收银台已接真实发起支付、通联支付宝回查和通联微信小程序支付桥 Bridge payload，但推广商品分类 ID 来源、商品详情收藏状态、搜索建议、秒杀购买资格、秒杀下单、拼团、自提、同城、通联微信真机回调和 App 正式支付 SDK handler 仍需后续补齐。
- 个人中心二级页当前仍有优惠券领取/使用等静态 mock 页面或动作；钱包、提现申请、提现记录、账户管理认证信息、银行卡管理、添加银行卡和解绑银行卡已接真实接口；收藏商品和我的足迹已接真实接口并支持取消收藏/删除足迹；我的页顶部概览已接真实 BFF；地址管理已接真实 BFF 和 Bridge 优先层，新增/编辑页已有轻量省市区下拉，但完整区域树和 App 定位/地图选点仍后置。

## 下一步建议

1. 推广模块进入后端契约确认和真实接口迁移准备阶段，后续需要确认真实活动、榜单、权益和达人等级接口。
2. 与 iOS / Android 确认 `router/navigate` 的 `webview/tab/back/close_webview`、原生页直接 route、`event/route_changed` 最终命名、payload 和手势返回行为。
3. 正式服务器和域名完成后，替换 `config/env/h5.prod.env` 中的 H5、Java、Python base URL，并同步发布/运维文档。
4. 确认首批需要内置的原生兜底页。
5. 基于现有 feature API adapter 和 BFF mock 输出真实后端接口契约，确认活动、榜单、权益和达人等级数据字段。
6. 为 v1.2.0 搜索结果页补搜索建议、收藏状态和 App WebView token 联调验收。
7. 用 App 注入的真实 `mallToken` 验证首页 `/api/bff/home`、首页推荐 `/api/bff/home/recommend-products`、相似推荐商品页 `/api/bff/home/for-you-products`、我的页 `/api/bff/mine/summary`、推广首页 `/api/bff/promotion/home`、活动中心 `/api/bff/promotion/activities`、权益中心 `/api/bff/promotion/benefits`、秒杀商品 `/api/bff/seckill/products`、推广商品 `/api/bff/promotion/products`、卖手活动 `/api/bff/seller-activities`、商品详情 `/api/bff/product-detail?prodId=1000054`、订单确认 `/api/bff/order-confirm?productId=1000054&skuId=<skuId>&quantity=1&addrId=<addrId>` 和订单提交 `/api/bff/order-submit` 能返回真实数据。
8. 为 App 正式地址数据源接入 `rpc/address.*`，补齐 `address.chooseLocation` 真实定位/地图选点和真实 App WebView token 联调验证。
9. 为后续 manifest、Bridge、theme runtime 和 API client 任务补充对应测试。
10. 后续新增 H5 页面优先套用 `StandardNavPage`、`TransparentNavPage` 或 `TransparentActionNavPage`，复杂导航变体先扩展 design-system，再接入业务页。

## 2026-07-03 注册后实名认证流程

- H5 注册成功后进入 `/register/certification` 达人认证入口页。
- 运营二维码固定入口为 `https://hybird.aigcpop.com/register`，不是 `/h5-v/<version>/register`。
- 认证姓名页 `/register/certification/name` 调用 BFF `/api/bff/certification/apply-url`，由 BFF 调 Java `/p/allinpay/member/getCreateMemberApplyUrl?name=<真实姓名>` 获取 `regInviteLink`。
- 认证结果页 `/register/certification/result` 调用 BFF `/api/bff/certification/member-info`，由 BFF 调 Java `/p/allinpay/member/getMemberBasicInfoV2`，按 `phone` 存在、`isRealNameAuth=1`、`isWithdraw=1` 判定认证成功。
- 独立 H5 入口 URL 上的 `token` 作为 Java 鉴权 token 使用：浏览器端只传给自身 BFF 的 `x-meumall-auth-token` header；App Cookie `mallToken` 仍为优先的正式鉴权来源。
- App 内打开通联认证链接使用现有 Hybrid Navigation 的 `router/navigate route=webview`；成功页“打开喵呜商城APP”使用 `route=tab tab=home closeCurrentWebView=true`。
- 认证成功/失败图标已作为本地资源注册到 `localAssetUrl()`，避免线上 basePath 丢失。
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
