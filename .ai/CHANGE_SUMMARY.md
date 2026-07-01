# 变更摘要

## 2026-07-01 - 接入 iconfont Font class 图标体系

### 变更

- 从本地下载包 `/Users/mac/Downloads/font_5196034_pfky5d5l91/` 同步 iconfont 项目 `5196034` 的 23 个单色 Font class 图标。
- 新增 `IconFont` design-system 组件，业务页面通过英文语义名或生成 key 使用图标，不直接依赖 iconfont 原始 class。
- 新增 `pnpm icons:sync -- --source <iconfont下载目录>`，用于后续下载新包后重新生成字体文件、CSS 和类型清单。
- iconfont 字体资源放入 `src/design-system/icons/font/`，通过 Next CSS 资源打包适配 H5 basePath。

### 验证

- `pnpm exec vitest run src/design-system/components/iconfont.test.tsx`：通过，1 file / 4 tests。
- `pnpm typecheck`：通过。
- `pnpm icons:sync -- --source /Users/mac/Downloads/font_5196034_pfky5d5l91`：通过，同步 23 个图标。
- `pnpm build:test`：通过，构建产物包含 `.next/static/media/iconfont...woff2/woff/ttf`。

## 2026-07-01 - 钱包提现记录页真实接口

### 变更

- 点击钱包账户卡片右上角 `提现记录` 进入 `/wallet/withdraw-records`。
- 新增提现记录 BFF `/api/bff/wallet/withdraw-records`，接入 Apifox main 分支 `GET /p/userWithdraw/pageDateUserWithdrawCash`，按 `current/size` 分页。
- 新增提现记录页面，保留顶部导航栏，按年月分组展示记录，支持 loading、error、empty、触底加载更多和按钮兜底。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx`：通过，3 files / 18 tests。
- `pnpm typecheck`：通过。
- 飞书同步：页面清单 revision 48；H5 BFF/API 对接说明 revision 19。

## 2026-07-01 - 钱包账户卡片入口布局调整

### 变更

- 按 Figma 节点 `677:29231` 调整钱包账户卡片：`提现` 按钮移动到帐户余额金额右侧。
- 账户卡片右上角展示 `提现记录` 入口；页面顶部导航不再额外展示重复的 `提现记录`。
- 订单列表仍保持无筛选、无总述、无详情箭头的纯列表展示。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx -t "renders wallet real data"`：通过，1 test。
- `pnpm typecheck`：通过。

## 2026-07-01 - 钱包 BFF 拆分与订单分页加载

### 变更

- 将钱包汇总与推广订单拆成两个 BFF：`/api/bff/wallet/summary` 只获取 `/p/distribution/wallet/info`，`/api/bff/wallet/orders` 按 `state/current/size` 获取 `/p/distribution/api/queryPromotionOrder`。
- `/wallet` 页面改为汇总和订单两条加载状态：切换“已结算 / 待结算”只重置订单列表并请求第一页，不重复请求钱包汇总。
- 推广订单列表支持触底自动加载下一页，并保留“上拉加载更多”按钮作为兜底。
- 旧 `/api/bff/wallet` 保留为钱包汇总兼容入口，不再聚合订单。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx`：通过，3 files / 16 tests。
- `pnpm typecheck`：通过。
- 飞书同步：页面清单 revision 47；H5 BFF/API 对接说明 revision 18。

## 2026-07-01 - Debug Login 支持写入 UserInfo

### 变更

- `/debug-login` 表单新增 `UserInfo JSON` 输入框，提交时会校验 JSON 对象并写入 `userInfo` Cookie。
- 清空调试 Cookie 时同步清除 `userInfo`。
- 直接访问 `/debug-login` 时，如果已有 `mallToken` / `pythonToken` 但缺少 `userInfo`，会继续展示表单，方便补写 `userInfo.phone`；首页不会因为缺少 `userInfo` 自动跳调试页。

### 验证

- `pnpm exec vitest run src/features/debug-login/debug-login.test.tsx`：通过，1 file / 6 tests。

## 2026-07-01 - 钱包推广订单 userId 来源修正

### 变更

- 新增服务端 Cookie `userInfo` 解析，读取 `phone` 作为钱包推广订单 `/p/distribution/api/queryPromotionOrder` 的 `userId` 参数。
- `/api/bff/wallet` 不再为了推广订单请求 `/p/distribution/home/overview`；银行卡管理仍使用推广概览 `userInfo.cardNo` 作为当前解绑 `signNum` 候选值。
- 更新 H5 API 规范、根级 API 契约、对接说明、页面清单、工作项和 TODO。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/server/auth/cookie-auth.test.ts`：通过，2 files / 14 tests。
- 飞书同步：页面清单 revision 46；H5 BFF/API 对接说明 revision 17。

### 后续

- 需要 App WebView 初始化时随 `mallToken` / `pythonToken` 一起写入 `userInfo` Cookie，并用真实 `userInfo.phone` 验证推广订单返回。

## 2026-07-01 - 支付 RPC 无点命名与通联微信小程序桥修正

### 变更

- 将 H5 发给原生的支付 RPC action 从 `payment.pay` 改为无点命名 `paymentStartCashier`，降低原生侧方法映射复杂度。
- 通联微信 `paySettlementType=1 + payType=8` 分支改为 `paymentMode="allinpay-mini-program-bridge"`。
- `miniProgram` 不再指向通联收银台原始 ID/path，而是指向喵呜小程序支付桥：`appId=wx264f4850dc92b03d`、`path=package-pay/pages/allinpay-bridge/allinpay-bridge`。
- `/p/order/pay` 返回的完整 `data` 继续透传到 `sdkPayload`；`chnlFrontParamInfo` 解析对象同时放入 `chnlFrontParamInfo` 和 `miniProgram.extraData.allinpayParams`，由小程序桥页原样传给通联收银台。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 21 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。
- `pnpm run ai:check-docs-sync --strict`：通过，15 个 H5 文档文件同步检查通过。
- 飞书同步：H5 与原生 App 对接说明 revision 119；H5 BFF/API 对接说明 revision 16；页面清单 revision 45。

## 2026-06-30 - payment.pay 完整透传支付返回

### 变更

- 按原生联调要求调整支付 Bridge 参数：所有 `execution.type="native-sdk"` 分支的 `sdkPayload` 都透传 Java `/p/order/pay` 解包后的完整 `data`。
- 普通微信支付不再把后端字段裁剪为 `appid/noncestr/prepayid` 等 H5 归一化对象；通联微信支付不再只传 `miniprogramPayInfo_VSP` 内部字段。
- 通联微信在 `data.result == 0` 且 `data.chnlFrontParamInfo` 可解析时，会把该 JSON 字符串解析为 `chnlFrontParamInfo` 对象并把对象内所有顶层参数传给原生；仍保留 `miniProgram` 作为 H5 派生的快捷拉起参数，原生需要完整支付返回时读取 `sdkPayload`，需要通联前置参数时读取 `chnlFrontParamInfo`，需要打开喵呜小程序支付桥时读取 `miniProgram`。
- 同步更新 H5 Native Bridge 规范、API 规范、根级支付 Bridge/API 契约和通联微信原生对接说明。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 21 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。
- `pnpm run ai:check-docs-sync --strict`：通过，15 个 H5 文档文件同步检查通过。
- 飞书同步：H5 与原生 App 对接说明 `OJk1wa43PiR9lTkYs2YcW8llnmf` revision 93；H5 BFF/API 对接说明 `GPhdwjQ87iQAQskeS6lc9bMOnte` revision 14；页面清单 `WgaqwTRRUitnRNkCtNPcOcDnnre` revision 43。
- 2026-07-01 追加：`chnlFrontParamInfo` 解析传参后，支付聚焦测试通过，2 files / 21 tests；飞书同步：H5 与原生 App 对接说明 revision 99；H5 BFF/API 对接说明 revision 15；页面清单 revision 44。

## 2026-06-30 - 通联微信支付 Native Bridge 对接

### 变更

- `/api/bff/order-pay` 在 `paySettlementType=1 + payType=8` 时，会把 Java `/p/order/pay` 返回的通联小程序支付字段归一化为 `execution.type="native-sdk"`、`provider="allinpay"`、`settlementProvider="allinpay"`、`paymentMode="allinpay-mini-program-bridge"`。
- `paymentStartCashier` Bridge payload 新增 `miniProgram`、`paymentMode`、`settlementProvider` 和 `bizOrderNo`，H5 会传 `miniProgram.appId=wx264f4850dc92b03d`、`miniProgram.path=package-pay/pages/allinpay-bridge/allinpay-bridge` 与 `miniProgram.extraData.allinpayParams` 给 App 打开喵呜小程序支付桥页。
- 通联微信打开成功但支付结果未知时，App 可返回 `status=unknown`，H5 进入 `/pay-result` 并按 `bizOrderNo` 回查订单状态。
- 收紧通联微信参数识别：只有命中 `miniprogramPayInfo_VSP` 等显式字段或顶层通联小程序关键字段时，才生成小程序收银台 payload。
- 同步更新 H5 Native Bridge 规范、API 规范、根级 Native Bridge/API 契约、支付对接说明、任务和页面盘点。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。
- `pnpm run ai:check-docs-sync --strict`：通过，15 个 H5 文档文件同步检查通过。
- 飞书同步：H5 与原生 App 对接说明 `OJk1wa43PiR9lTkYs2YcW8llnmf` revision 90；H5 BFF/API 对接说明 `GPhdwjQ87iQAQskeS6lc9bMOnte` revision 13；页面清单 `WgaqwTRRUitnRNkCtNPcOcDnnre` revision 42。

## 2026-06-30 - 收银台支付调试日志

### 变更

- `/api/bff/order-pay` 增加专属服务端日志 `[h5-order-pay-bff-request]` 和 `[h5-order-pay-bff-response]`，单独打印 H5 到 BFF 的支付提交参数和 BFF 返回结果。
- Java `/p/order/pay` 调用前后增加专属服务端日志 `[h5-order-pay-java-request]` 和 `[h5-order-pay-java-response]`，单独打印实际发给 Java 的请求体和 Java 原始返回。
- H5 收银台点击“确定支付”时在 console 输出 `[MeuMall][order-pay][h5-request]`、`[MeuMall][order-pay][h5-response]`，本地/测试环境还会输出 `[MeuMall][order-pay][java-request]` 和 `[MeuMall][order-pay][java-response]`。
- `/api/bff/order-pay?debugRaw=1` 在 local/test 下补充 `debugRaw.orderPayRequest`，方便 App WebView console 直接对照 Java 入参；正式环境不返回该调试字段。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 18 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。

## 2026-06-30 - 收银台视觉优化

### 变更

- 优化 `/pay-way` 收银台金额面板、支付方式列表、选中态、底部提交栏、支付中提示和加载/错误状态样式。
- 支付方式行补充 App 支付副文案和 `aria-pressed` 状态，当前选中方式在标题区同步展示。
- 本次仅调整收银台视觉与展示结构，不变更 `/api/bff/order-pay`、支付 RPC 或 `rpc/payment.openUrl` 的接口契约。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 18 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。

## 2026-06-30 - 卖手活动真实接口联调

### 变更

- 新增 `/seller/activities` 营销活动入口、`/seller/activities/[activityId]` 活动商品配置、`/seller/activities/[activityId]/products` 选择商品、`/seller/activities/[activityId]/products/[prodId]` 商品设置页。
- 新增卖手活动 BFF 和 mapper：可用活动、活动商品分页、活动详情、保存配置、批量状态、可选推广商品来源。
- 配置页 tab 切换只走页面 state，不改 URL；进行中批量橙色按钮为“暂停”，已暂停批量橙色按钮为“开始”；删除保留确认弹层。
- 新增根级任务、对接说明和 API 契约：`TASK-2026-0630-001`、`BRIEF-2026-0630-001`、`h5-seller-activities-real-api-contract.md`。

### 验证

- `pnpm exec vitest run src/features/seller-activity/seller-activity.test.tsx`：通过，1 file / 7 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/seller-activity src/app/seller src/app/api/bff/seller-activities`：通过。

### 风险

- 真实新增模式下 `/p/sellerActivity/detail` 是否能返回未配置商品的基础信息仍需后端联调确认；当前 H5 支持从选择商品页 query 带入基础展示信息，最终保存仍由后端校验。

## 2026-06-29 - 推广激励活动真实接口联调

### 变更

- `/promotion/activities` 改为 SSR 调真实活动列表 BFF，不再使用本地活动 mock 作为联调页面兜底。
- `/promotion/activities/[id]` 改为聚合真实活动详情和奖励详情，并展示活动 banner、个人进度、奖励规则和奖励状态。
- 新增 H5 BFF：`/api/bff/promotion/activities`、`/api/bff/promotion/activities/[id]`、`/api/bff/promotion/activities/[id]/reward`、`PATCH /api/bff/promotion/activities/rewards/[recordId]/receive`。
- `createPromotionApi` 增加活动列表、详情和奖励详情入口，继续复用统一 Promotion API。
- 新增根级任务、对接说明和 API 契约：`TASK-2026-0629-007`、`BRIEF-2026-0629-007`、`h5-promotion-incentive-activities-real-api-contract.md`。

### 验证

- `pnpm exec vitest run src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts`：通过，3 files / 29 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/components/PromotionActivitiesScreen.tsx src/features/promotion/components/PromotionActivityDetailScreen.tsx src/app/promotion/activities/page.tsx 'src/app/promotion/activities/[slug]/page.tsx' src/app/api/bff/promotion/activities/route.ts 'src/app/api/bff/promotion/activities/[id]/route.ts' 'src/app/api/bff/promotion/activities/[id]/reward/route.ts' 'src/app/api/bff/promotion/activities/rewards/[recordId]/receive/route.ts' src/features/promotion/api.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts`：通过，0 errors，2 warnings；warning 为活动页既有 `<img>` 规则提示。
- `pnpm run ai:check-docs-sync --strict`：通过。

### 风险

- 实物奖励领取需要地址选择，当前只完成 BFF `addressId` 转发能力；完整前端地址选择交互后置。

## 2026-06-29 - 收银台真实支付发起与通联链路

### 变更

- 2026-06-30 追加：为先跑通微信支付，收银台默认支付方式从“支付方式数组第一项”改为“微信可用时优先微信”，避免用户直接点击“确定支付”时默认提交支付宝 `payType=7`。
- 2026-06-30 追加：支付 RPC H5 payload 字段从实现里的旧名 `paymentPayload` 对齐为契约字段 `sdkPayload`。
- 新增 `/api/bff/order-pay`，点击收银台“确定支付”后调用 Java `/p/order/pay`，并按 `/sys/config/paySettlementType` 分流普通 App SDK 支付和通联支付。
- `/api/bff/order-pay-info` 增加 `/sys/config/paySettlementType` 读取，收银台可展示当前为普通结算或通联结算。
- 测试环境 `paySettlementType=1` 时，支付宝链路会用 `/p/order/pay` 返回的 `miniprogramPayInfo_VSP` 请求 `/p/allinpay/order/getAliAppPayUrl`，再通过 `rpc/payment.openUrl` 请求 App 打开通联支付 URL。
- 新增 `/api/bff/allinpay-order-status` 和 `/pay-result`，支付结果页可按 `bizOrderNo` 调 Java `/p/allinpay/order/getOrderStatus` 回查通联状态；非通联或 SDK 支付返回后回读订单支付信息。
- 新增 `rpc/paymentStartCashier` 与 `rpc/payment.openUrl` typed Bridge，普通支付宝/微信 SDK 支付交给 App，通联 URL 打开交给 App；Web 调试环境仅对通联 URL 保留直接跳转兜底。
- 同步更新 Native Bridge 规范、API 规范、根级 Bridge/API 契约和页面盘点。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 16 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。
- 2026-06-30 追加验证：`pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，2 files / 18 tests。
- 2026-06-30 追加验证：`pnpm typecheck`：通过。
- 2026-06-30 追加验证：`pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`：通过。
- 飞书同步：页面清单 `WgaqwTRRUitnRNkCtNPcOcDnnre` revision 40；H5 与原生 App 对接说明 `OJk1wa43PiR9lTkYs2YcW8llnmf` revision 89；H5 BFF/API 对接说明 `GPhdwjQ87iQAQskeS6lc9bMOnte` revision 11。

## 2026-06-29 - 地址模块路由选择流优化

### 变更

- 新增 `src/features/mine-secondary/address-flow.ts`，统一生成和解析地址选择流上下文：`select/from/flowId/productId/skuId/quantity/addressId`。
- `/address` 和 `/address/edit` 保留来源上下文；选择态点击“使用”写入一次性 `sessionStorage` 结果并 `history.back()` 回来源页。
- 地址列表删除非默认地址时新增 H5 确认弹层，用户确认后才调用删除接口。
- 商品详情配送行进入 `from=product-detail` 地址选择流，消费地址结果后更新 URL 并按 `addrId` 重拉商品详情。
- 订单确认地址卡进入 `from=order-confirm` 地址选择流，消费地址结果后更新 URL 并按 `addrId` 重拉订单确认。
- 同步更新 Native Bridge 规范、API 规范、changelog、项目状态、TODO 和根级页面盘点。
- 已同步飞书知识库：页面清单 `WgaqwTRRUitnRNkCtNPcOcDnnre` revision 39；H5 与原生 App 路由跳转对接说明 `OJk1wa43PiR9lTkYs2YcW8llnmf` revision 88。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx src/features/product/product-real-flow.test.tsx`：通过，6 files / 37 tests。
- `pnpm exec vitest run src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/address-hybrid-api.test.ts`：通过，3 files / 12 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/mine-secondary/address-flow.ts src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/components/AddressScreens.tsx src/app/address/page.tsx src/app/address/edit/page.tsx src/features/product/components/ProductDetailScreen.tsx src/features/product/components/OrderConfirmScreen.tsx 'src/app/product/[id]/page.tsx'`：通过。
- `pnpm exec eslint src/features/mine-secondary/components/AddressScreens.tsx src/features/mine-secondary/address-pages.test.tsx`：通过。

### 后续

- 需要在 App WebView 内验证系统手势返回、H5 导航栏返回、选择地址、新增地址后返回列表等真实容器行为。

## 2026-06-27 - 推广排行榜真实接口联调

### 变更

- `/promotion/rank-center` 榜单中心将达人激励榜、战队销量榜、战队销售额榜置灰为不可点击状态，仅达人销量榜和达人销售额榜可进入真实榜单。
- 通过 Apifox 项目 `4403987` main 分支确认“达人推广排行榜接口 / 推广排行榜接口”，榜单页只依赖 Java `/p/distribution/rank/list`。
- `/promotion/ranking/sales` 与 `/api/bff/promotion/rankings/sales` 接入 Java `/p/distribution/rank/list?rankType=1`，我的排名来自同一响应内 `myRank`。
- `/promotion/ranking/amount` 与 `/api/bff/promotion/rankings/amount` 接入 Java `/p/distribution/rank/list?rankType=2`，我的排名来自同一响应内 `myRank`。
- `period=day/week/month` 映射 Java `period=1/2/3`，可选 `statPeriod` 透传；真实空榜展示空态，不回退 mock 榜单。
- 榜单类型和周期切换改为页面内 state + BFF 请求，不再修改 URL 或追加 WebView history，避免 App 返回和滑动返回被 tab 切换污染。
- 少量数据展示调整：0 条展示空态，1-3 条只展示领奖台并给出“更多排名统计中”，切换加载时展示骨架。
- 修复页面内切换时直接请求 `/api/...` 未拼接 H5 basePath 的问题，改用 `buildH5ApiPath()`，避免版本路径下切换榜单误报“榜单加载失败”。
- 排行榜页面内切换请求进一步收敛为 `createPromotionApi(createH5Client())`，复用统一 BFF 客户端的 `credentials: include`、`x-request-id` 和客户端上下文 header，避免手写 fetch 造成 BFF 日志和鉴权链路不完整。
- 推广商品页也从独立 `createPromotionProductsApi` 收敛到统一 `createPromotionApi(createH5Client())`，并删除独立 promotion products API 文件；推广模块客户端 BFF 调用统一从 `src/features/promotion/api.ts` 出口管理。
- 切换榜单和周期时不再把 tab 文案改成“加载中”，只在内容区展示骨架占位。
- 新增 `/promotion/ranking/incentive`，达人激励榜本阶段固定展示空态，不请求 `rankType=4`。
- 同步新增根级任务、对接说明和 API 契约，并更新页面清单、H5 API 规范、项目状态和 TODO。

### 验证

- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts src/lib/http/h5-client.test.ts`：通过，3 files / 26 tests。
- `pnpm typecheck`：通过。

### 后续

- 需要在 App WebView 中用有效 `mallToken` 验证销量榜、销售额榜和两个 BFF 的真实返回。

## 2026-06-27 - 我的页与权益中心真实接口联调

### 变更

- 通过 Apifox 项目 `4403987` main 分支确认三个接口：`GET /p/app/profile/summary`、`GET /p/daren/level/myLevel`、`GET /p/daren/level/list`。
- 新增 `/api/bff/mine/summary`，聚合个人中心概览和我的达人等级，`/mine` 不再直接渲染 `minePageData` mock。
- `/mine` 映射真实钱包余额、今年已省、可用优惠券、当前达人等级和个人中心 banner；权益中心入口携带当前等级。
- `/api/bff/promotion/benefits` 和 `/promotion/benefits` 改为真实我的等级 + 等级列表数据，继续支持左右滑、箭头和等级轨道切换。
- 同步新增根级任务、对接说明和 API 契约，并更新页面清单、H5 API 规范、项目状态和 TODO。

### 验证

- `pnpm exec vitest run src/features/mine/mine-real-api.test.tsx src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts`：通过，3 files / 20 tests。
- `pnpm typecheck`：通过。
- `pnpm run ai:check-docs-sync --strict`：通过。
- `pnpm lint -- src/features/mine src/app/mine/page.tsx src/app/api/bff/mine/summary/route.ts src/features/promotion/server/promotion-level-real-service.ts src/app/api/bff/promotion/benefits/route.ts src/app/promotion/benefits/page.tsx src/features/promotion/components/PromotionBenefitsCarousel.tsx src/features/promotion/api.ts src/features/promotion/promotion-service.test.ts`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

### 后续

- 需要在 App WebView 中用有效 `mallToken` 验证 `/mine`、`/promotion/benefits` 和两个 BFF 的真实返回。

## 2026-06-27 - 推广首页概览真实接口联调

### 变更

- 通过 Apifox 项目 `4403987` main 分支确认“达人主页接口 / 推广页概览”为 Java `GET /p/distribution/home/overview`。
- 新增推广首页真实接口 mapper，映射 `userInfo`、`level`、`mySales`、`salesStats` 和 `ongoingIncentiveCount` 到现有推广首页 view model。
- `/api/bff/promotion/home` 和 `/promotion` 已切真实接口；token 缺失、鉴权失败或接口失败展示错误态，不回退本地 mock。
- 用户头像支持真实远程 URL；头像缺失仍使用 H5 默认头像占位。
- 同步新增根级任务、对接说明和 API 契约，并更新页面清单、H5 API 规范、项目状态和 TODO。

### 验证

- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-products.test.tsx`：通过，3 files / 27 tests。
- `pnpm typecheck`：通过。
- `pnpm run ai:check-docs-sync --strict`：通过。
- `pnpm lint -- src/features/promotion/server/promotion-home-real-service.ts src/app/api/bff/promotion/home/route.ts src/app/promotion/page.tsx src/features/promotion/components/PromotionAssetPlaceholder.tsx src/features/promotion/components/TalentHero.tsx src/features/promotion/promotion-service.test.ts`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

### 后续

- 需要在 App WebView 中用有效 `mallToken` 验证 `/promotion` 和 `/api/bff/promotion/home` 真实返回。

## 2026-06-26 - 收银台支付信息展示链路

### 变更

- 首页 `navList.navType` 路由分流已补充回归：`navType=1` 进入 `/search/ranking`，并在后端返回 `rankType/categoryId` 时打开指定热榜标签；`navType=2` 进入 `/search?categoryId=<id>`；`navType=3` 进入 `/category`。商品分类页 leaf 点击与 `navType=2` 同口径。
- 新增 `/pay-way` 收银台页面，订单确认页提交成功后跳转 `/pay-way?orderNumbers=<orderNumbers>&dvyType=1&isPurePoints=0&orderType=0&ordermold=0`。
- 新增 `/api/bff/order-pay-info`，BFF 读取 Java `/p/order/getOrderPayInfoByOrderNumber` 和 `/sys/config/info/getSysPaySwitch`，展示订单金额、过期时间、支付状态和支付方式。
- 收银台样式按旧 uni-app `pay-way` 结构迁移：顶部金额/倒计时、中间支付方式、底部固定“确定支付”按钮。
- 按用户最新要求，确认付款流程暂不迁移：点击“确定支付”只在 H5 本地提示“已发起支付”，不调用 Java `/p/order/pay`，不接支付 Bridge，不进入支付结果页。
- 同步更新商品交易 API 规范、根级 API 契约、对接说明、任务、页面盘点和项目状态。

### 验证

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx`：通过，1 file / 7 tests。
- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx`：通过，2 files / 18 tests。
- `pnpm typecheck`：通过。
- `pnpm lint -- src/features/payment src/app/pay-way/page.tsx src/app/api/bff/order-pay-info/route.ts src/features/product/components/OrderConfirmScreen.tsx`：通过，0 errors；仍有 promotion 模块既有 `<img>` warnings。
- `pnpm run build`：通过，路由表包含 `/pay-way` 和 `/api/bff/order-pay-info`。

## 2026-06-25 - 商品详情订单确认下单链路参数修复

### 变更

- 对照旧 uni-app `prod.vue` 和 `submit-order.vue`，确认普通商品立即购买链路为商品详情写入 `bbcOrderItem`，确认页加载时先解析地址和商品/SKU，再调用 Java `/p/order/confirm`，最终提交 Java `/p/order/submit`。
- `/api/bff/order-confirm` 已补齐 Java `/p/order/confirm` 调用，不再只用商品详情接口拼确认页；确认页优先展示 Java 确认返回的实付款、数量、运费、优惠和 `submitOrder` 状态。
- 普通快递 `/p/order/confirm` 请求体按旧 uni-app DTO 补齐 `dvyTypes[].lat=null`、`lng=null`、`stationId=0`，并保留 `orderItem/prodCount/isScorePay/userChangeCoupon/userUseScore` 默认值。
- `/api/bff/order-submit` 提交体补齐旧确认页的 `orderFlowLogParam`，并优先使用 `/p/order/confirm` 返回的 `shopCartOrders` 生成 `orderShopParams`。
- 同步更新商品交易 API 契约、H5 API 规范、项目状态、工作项和页面盘点。

### 验证

- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx`：通过，1 file / 14 tests。
- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx`：通过，2 files / 16 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run build`：通过。
- 飞书知识库页面盘点已同步：[喵呜 APP 页面盘点](https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre)，返回 docx URL `https://v05ctaei9gn.feishu.cn/docx/IsGAdbLzUoZvZfxzOORcWlKknhc`，`revision_id=22`。

## 2026-06-25 - 首页正式联调移除本地 mock fallback

### 变更

- 首页客户端请求 `/api/bff/home` 或推荐商品分页失败时，不再回退 `homeExperienceData`。
- 首页 mapper 缺失 banner、分类或推荐商品时返回空业务数据，不再用本地静态样例补齐。
- 首页“限时秒杀”和“推广带货”入口改为 H5 固定 UI，分别固定跳转 `/seckill` 和 `/promotion/products`，不再由首页聚合接口或配置模块控制。
- 首页聚合接口按 Apifox 最新 schema 使用 `navList` 作为类目展示来源；`hotCategory/categoryTop8` 不再参与首页类目拼接。
- banner 或类目为空时展示骨架屏，不展示本地 mock banner 或 mock 类目。
- 首页 UI 图标资源仍保留本地 asset key；这些是界面资源，不作为业务数据兜底。
- BFF 成功但 Java 返回空业务模块时，页面展示空业务态；BFF 失败时展示“首页加载失败”错误态。

### 验证

- `pnpm exec vitest run src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，2 files / 27 tests。
- `pnpm exec vitest run src/features/home`：通过，4 files / 35 tests。

## 2026-06-25 - 搜索结果商品真实接口联调

### 变更

- 通过 Apifox 商品接口目录确认 Java 接口为 `GET /p/app/prod/page`，核心参数为 `orderBy`、`keyword`、`categoryId`。
- 通过 Apifox 分类接口目录确认分类筛选统一使用 `GET /category/list`；全局搜索传 `parentId=0`，分类入口和级联点击传当前类目 ID；搜索结果页分类筛选默认不传 `depth`，由后端返回当前类目的所有子孙类目。
- 新增 `/api/bff/search/products`，BFF 调 Java 商品分页接口并映射为搜索结果页商品卡。
- `/search?q=<keyword>` 不传 `categoryId`，按全局搜索处理；分类筛选项来自一级分类接口。
- `/search?categoryId=<id>` 无关键词也进入结果页，默认查询当前分类；后续分类筛选项来自 `/category/list?parentId=<id>&shopId=0`。
- 搜索结果页销量/价格/分类筛选改为请求真实 BFF，不再做本地排序和 mock 拼接。
- 排序 UI 收敛为销量/价格两个互斥条件，后方展示上/下箭头并高亮当前方向；分类筛选改为级联展示，递归保留 Java `children/categories` 子孙树，点击分类后直接展示已返回的所有子孙类目。
- 筛选区样式优化为“综合筛选”壳层、当前筛选摘要、销量/价格分段按钮和分级类目标题；排序/分类切换不修改 URL。
- 分类筛选面板新增蒙层和滚动锁定；点击分类项只更新待确认选中态，点击“确认”才应用分类请求，点击“重置”清空分类并重新请求。
- 搜索结果页商品有下一页时，底部哨兵进入视口自动加载 `current + 1` 并追加商品，不再展示“加载更多”按钮。
- 搜索结果页内再次搜索或清空关键词只更新当前页面关键词 state，并用 `history.replaceState` 同步 URL，不重置当前排序和分类筛选。
- 搜索输入框改为普通文本输入，只保留 H5 自定义清空按钮，避免浏览器原生 search 清除按钮重复出现。
- 搜索结果页首屏只展示骨架屏，不渲染本地 mock 商品或分类；商品空数组使用通用 `EmptyState`，接口失败展示错误和重试入口；商品详情跳转继续使用 replace 式离开搜索页。
- 同步新增根级任务、API 契约和对接说明。

### 验证

- `pnpm exec vitest run src/features/search/search-products-real-api.test.ts src/features/search/search.test.tsx`：通过，2 files / 32 tests。
- 补充验证：`pnpm exec vitest run src/features/search/search.test.tsx`：通过，1 file / 24 tests。
- 补充验证：`pnpm exec vitest run src/features/search`：通过，5 files / 41 tests。
- `pnpm test`：通过，56 files / 305 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- `pnpm run build`：通过，路由表包含 `/api/bff/search/products`。
- `pnpm run ai:check-docs-sync --strict`：通过。

## 2026-06-25 - 搜索页离开跳转改为 replace

### 变更

- `/search` 点击“查看完整榜单”进入 `/search/ranking` 时，使用 `window.location.replace(buildClientHref(...))`，不把搜索页留在 WebView history。
- “查看完整榜单”会携带当前热榜标签：喵呜热榜传 `rankType=1`，品类热榜传 `rankType=2&categoryId=<categoryId>`。
- `/search/ranking` 读取 URL 上的 `rankType/categoryId` 作为初始标签；进入页面后切换标签只更新 state 和 BFF 请求，不操作 URL，不追加 history。
- 搜索页热榜商品为空时继续复用通用空态，但空态容器背景改为透明，避免白色卡片破坏绿色热榜背景。
- `/search` 热榜商品、`/search/ranking` 完整榜单商品和 `/search?q=...` 搜索结果商品进入详情时，也统一使用 replace 式跳转。
- 该规则保证用户从搜索页进入商品详情或完整榜单后，点击原生返回按钮或使用 App 滑动返回，会回到搜索页之前的首页，而不是停回搜索页。
- 保留浏览器默认修饰键行为：`meta/ctrl/shift/alt` 或非左键点击仍交给浏览器处理。

### 验证

- `pnpm exec vitest run src/features/search/search.test.tsx`：通过，1 file / 15 tests。
- `pnpm exec vitest run src/features/search/search.test.tsx`：通过，1 file / 21 tests。
- `pnpm exec vitest run src/features/search`：通过，5 files / 37 tests。
- `pnpm typecheck`：通过。

## 2026-06-24 - 商品详情骨架和图片空态

### 变更

- 商品详情远程数字商品 ID 首屏不再渲染“正在加载商品”、`￥0` 等占位文案，改为展示商品详情骨架屏，等待 `/api/bff/product-detail` 返回真实数据后再渲染详情。
- `createProductLoadingData()` 增加内部 `isLoading` 标记，仅用于商品详情首屏骨架判断。
- 商品详情主图区无媒体图片时改为复用 `ProductImagePlaceholder` 通用商品图片空态，不再展示旧的手绘衣服占位。
- `ProductImagePlaceholder` 支持透传标准 `span` 属性，方便业务页补充 `data-*` 测试标记和可访问性属性。
- 补充回归测试，覆盖远程商品首屏骨架、无主图通用空态以及真实商品/订单相邻链路。

### 验证

- `pnpm test src/features/product/product-detail.test.tsx src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx src/design-system/components/product-image-placeholder.test.tsx`：通过，4 files / 25 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 2026-06-24 - 相似推荐商品详情跳转修复

### 变更

- 定位 `/home/recommend-products` 商品卡详情 404：商品详情页对数字商品 ID 会进入真实详情加载态，问题不在详情路由本身，而是相似推荐商品卡使用普通 `next/link`，未复用首页商品卡的 Hybrid 新 WebView 跳转策略。
- 相似推荐商品卡改用 `HybridLink strategy="new-webview"`，`source="recommend-products"`，`title="商品详情"`，与首页商品详情入口保持同一容器策略。
- 补充回归测试，确认相似推荐商品卡渲染为 Hybrid 新 WebView 入口，并保留 `/product/<prodId>` 详情链接。

### 验证

- `pnpm test src/features/home/home-recommend-products.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 2026-06-24 - 商品分类页真实分类列表

### 变更

- 通过 Apifox 项目 `4403987` 查询“获取分类列表”，确认 Java 接口为 `GET /category/list?parentId=-1&shopId=0&depth=3`，响应 `data: CategoryListTreeVO[]`；当前联调口径 `depth` 必传，分类页固定传 `3`。
- 新增 `/api/bff/category/list`，BFF 调 Java `/category/list` 并映射为分类页 `view`，保留 `modules.categories` 和 local/test `debugRaw`。
- `/category` 首屏不再注入 `categoryPageData` mock，改为展示骨架屏，真实接口返回后渲染左侧一级分类和右侧二/三级分类。
- Java 空数组展示通用空态“暂无分类”，接口失败展示“分类加载失败”，均不拼接本地 mock 分类。
- leaf 分类点击进入 `/search?categoryId=<categoryId>`，分类图片使用 `pic` / `icon`，相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接。
- 同步新增根级 API 契约 `.ai-workspace/contracts/api/h5-category-list-contract.md`，并更新 H5 API 规范、项目状态、TODO、页面盘点和 changelog。

### 验证

- `pnpm test src/features/category/category-real-api.test.ts src/app/category/page.test.tsx`：通过，2 files / 3 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。
- 本地 SSR smoke：`/hybird/category` 首屏包含分类骨架，不包含 mock“一级分类/二级分类/三级分类”。

## 2026-06-24 - 搜索首页热门词真实接口

### 变更

- 通过 Apifox 项目 `4403987` 查询“查看全局热搜”，确认 Java 接口为 `GET /search/hotSearch?type=1`，响应 `data: HotSearchDto[]`，展示字段优先取 `title`。
- 新增 `/api/bff/search/hot-keywords`，BFF 调 Java `/search/hotSearch` 并映射为 `view.hotKeywords`，保留 `modules.hotSearches` 和 local/test `debugRaw`。
- `/search` 搜索首页热门搜索区域首屏展示骨架屏，真实接口返回后展示真实热词；空数组展示“暂无热门搜索”，失败展示“热门搜索加载失败”，不再展示 mock 热词兜底。
- 搜索历史改为前端 localStorage `meumall.search.history`，提交搜索或点击热词写入本地历史，按最新优先去重并限制 10 条；顶部删除按钮清空全部历史，单个历史标签右侧删除按钮只删除对应关键词。
- 同步新增根级 API 契约 `.ai-workspace/contracts/api/h5-search-hot-keywords-contract.md`，并更新 H5 API 规范、项目状态、TODO、页面盘点和 changelog。

### 验证

- `pnpm test src/features/search/search-history.test.ts src/features/search/search-real-api.test.ts src/features/search/search.test.tsx`：通过，3 files / 15 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。
- 本地 SSR smoke：`/hybird/search` 首屏包含热门词骨架，不包含 mock 热词“保健品”，搜索历史展示本地空态。

## 2026-06-25 - 搜索热榜真实接口联调

### 变更

- 通过 Apifox 商品榜单接口目录确认顶部标签 `GET /search/rankTabs` 和商品列表 `GET /search/rank/{rankType}`。
- 新增 `/api/bff/search/ranking`，BFF 聚合 Java 热榜标签和商品列表，并输出 `view.tabs/products` 与 `modules.rankTabs/products`。
- `/search` 下方热榜模块和 `/search/ranking` 完整榜单页改为首屏骨架，接口成功后只渲染真实标签和商品；空数组展示空态，失败展示“热榜加载失败”，不再展示本地 mock 热榜商品。
- 热榜商品卡支持真实 `pic` 图片、`displayPrice/oriPrice/soldNum`、`activityType/isHot/isRecommend` 徽标和 `/product/<prodId>` 跳转。

### 验证

- `pnpm exec vitest run src/features/search`：通过，4 files / 20 tests。
- `pnpm test`：通过，55 files / 281 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- `pnpm run build`：通过。
- HTTP smoke：`/hybird/search`、`/hybird/search/ranking`、`/hybird/api/bff/search/ranking?categoryBoardCount=6` 均返回 200；BFF 返回真实商品数据。

## 2026-06-24 - H5 真实接口联调渲染规则固化

### 变更

- 根级 H5 对接工作流新增“真实接口联调渲染规则”：首屏骨架/loading、成功后真实数据、空列表空态、失败/重试，不再用 mock 业务数据兜底。
- 对接说明模板新增真实接口渲染规则和验收项，后续接口联调必须明确是否已移除页面 mock 兜底。
- `/home/recommend-products` 首屏不再注入 `homeExperienceData.products` mock 商品，改为展示商品骨架屏，真实接口返回后再渲染商品。
- `/api/bff/home/for-you-products` 和 `/api/bff/home/recommend-products` 不再把 Java 空列表替换成本地 mock 商品。
- 项目状态补充 H5 真实接口联调统一口径，后续商品/订单/活动/优惠券等列表空数据优先展示 `EmptyState` 或业务空态。

### 验证

- `pnpm test src/features/home/home-recommend-products.test.tsx src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，3 files / 30 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。
- 本地 SSR smoke：`/hybird/home/recommend-products` 首屏包含 6 个骨架卡片，不包含 `homeExperienceData.products` mock 商品标题，不渲染商品图片缺省图。

## 2026-06-24 - 相似推荐商品图片和回到顶部修复

### 变更

- 修复 `/home/recommend-products` 商品卡视觉区：有 `imageUrl` 时直接展示真实商品图，不再包裹 `ProductImagePlaceholder`。
- 修复真实商品图分支的视觉容器尺寸，商品标题、销量、价格等信息稳定展示在图片下方。
- 无 `imageUrl` 时仍保留商品图片缺省图。
- 新增 `BackToTopButton` 设计系统组件，复用首页右下角“顶部”样式，点击时优先滚动最近的可滚动父容器。
- 首页和 `/home/recommend-products` 均改用公共 `BackToTopButton`；相似推荐页加载超过一页后显示该按钮。
- `/home/recommend-products` 首屏不再注入 `homeExperienceData.products` mock 商品，改为展示商品骨架屏，真实接口返回后再渲染商品。
- `/api/bff/home/for-you-products` 和 `/api/bff/home/recommend-products` 不再把 Java 空列表替换成本地 mock 商品。
- 补充回归测试，覆盖真实图片商品不渲染缺省图、商品信息展示、相似推荐页回到顶部按钮、首屏骨架和 Java 空列表不 fallback。

### 验证

- `pnpm test src/features/home/home-recommend-products.test.tsx src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，3 files / 30 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 2026-06-24 - 通用空态组件

### 变更

- 新增 `EmptyState` 设计系统组件，默认展示喵呜空盒子角色图和“这里空空如也～”文案。
- 注册 `placeholder.emptyState` 本地资源，图片文件位于 `public/assets/placeholders/empty-state-mascot.png`。
- 组件支持调用方自定义文案、图片资源、图片尺寸、字体大小、文本颜色、图文间距和 className。
- 限时秒杀页和推广商品页无商品时改为复用 `EmptyState`，分别展示“暂无秒杀商品”和“暂无推广商品”。

### 验证

- `pnpm test src/design-system/components/empty-state.test.tsx src/lib/assets/asset-url.test.ts src/features/seckill/seckill.test.tsx src/features/promotion/promotion-products.test.tsx`：通过，4 files / 24 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 2026-06-12 - 收货地址模块前端闭环

### 变更

- 新增 `/address` 收货地址列表页，支持管理态和订单确认选择态 `select=1`。
- 新增 `/address/edit` 新增/编辑收货地址页，包含收货人、手机号码、所在地区、详细地址、定位、设为默认地址和保存按钮。
- 地址空态图 `empty-address.png` 和定位图标 `location.png` 从旧 uni-app 地址页面资产复制到 `public/assets/address/`，并注册 `address.empty`、`address.location` 资源 key。
- 我的页“地址管理”入口从占位改为 `/address`。
- 订单确认页地址卡改为可点击入口，跳转 `/address?select=1` 并保留商品、SKU、数量和地址参数。
- `/order-confirm`、`/api/bff/order-confirm` 和 `/api/bff/order-submit` 已支持 `addressId/addrId` 传递。
- `/api/bff/order-confirm` 和 `/api/bff/order-submit` 已接 Java `/p/address/addrInfo/{addrId}`，未传时使用 `0` 解析默认地址；无收货地址时禁止提交订单。
- 新增地址管理 BFF：`/api/bff/address/list`、`/api/bff/address/info`、`/api/bff/address/save`、`/api/bff/address/default`、`/api/bff/address/delete`。
- `/address` 会同步 Java 地址列表，设默认和删除会调用真实 BFF；`/address/edit` 会回填地址详情并保存到 Java `addAddr/updateAddr`。
- 新增 `rpc/address.*` Bridge 地址能力和 `createHybridAddressApi()`；商品详情、订单确认和地址管理页优先走 App Bridge，BFF 作为 fallback 和服务端校验层。
- `/address/edit` 省市区已从空输入改为 `/api/bff/address/regions` -> Java `/p/area/listByPid` 真实接口级联；接口未返回时不展示本地选项。
- `/address/edit?addrId=<addrId>` 编辑回显会按 `provinceId/cityId/areaId` 级联加载真实省市区 options 后再回显 select，避免只有文本没有选项。
- App debug Bridge receiver 不再内置本地地址样例，避免调试数据参与真实发货链路。
- 地址列表和省市区不保留本地轻量业务数据兜底；App 真实定位/地图选点后置。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/address-pages.test.tsx`：通过，1 file / 4 tests。
- `pnpm exec vitest run src/features/mine-secondary/address-real-service.test.ts src/features/mine-secondary/address-pages.test.tsx`：通过，2 files / 6 tests。
- `pnpm exec vitest run src/lib/bridge/protocol-bridge.test.ts src/features/mine-secondary/address-hybrid-api.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/product/product-detail.test.tsx src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx`：通过，6 files / 34 tests。
- `pnpm exec vitest run src/features/mine-secondary/address-real-service.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts src/lib/bridge/protocol-bridge.test.ts`：通过，4 files / 14 tests。
- `pnpm exec vitest run src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/mine-secondary-pages.test.tsx src/features/product/order-confirm.test.tsx src/features/product/product-real-flow.test.tsx`：通过，4 files / 25 tests。
- `pnpm test`：通过，54 files / 276 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run build`：通过，路由表包含 `/address`、`/address/edit`、`/api/bff/address/*`、`/api/bff/address/regions` 和 `/api/bff/order-submit`。
- 本轮按 H5-only 验收，不跑 iOS。

## 2026-06-12 - 独立 H5 调试 Token 登录页

### 变更

- 新增 `/debug-login` 调试页，仅用于浏览器独立打开 H5 且缺少 `mallToken` / `pythonToken` 时手动写入 Java Token 和 Python Token。
- `/` 首页在独立 H5、无 token、无原生运行信号时会跳转到 `/debug-login?redirect=/`，方便线上版本浏览器调试。
- 调试页检测到 `statusHeight`、`meu_page_config`、`x-app-version`、`x-platform=ios/android` 等原生运行信号时直接返回 404，避免在原生 App WebView 中展示。
- 调试页检测到两个 token Cookie 均已存在时直接回到目标页面，不重复展示。
- 调试写入的 Cookie 有效期 7 天，`SameSite=Lax`，HTTPS 下追加 `Secure`；该能力不改变原生 App 写入 HttpOnly Cookie 的正式鉴权模型。

### 验证

- `pnpm test src/features/debug-login/debug-login.test.tsx`：先按 TDD 确认缺少组件时失败，再实现通过，1 file / 4 tests。

## 2026-06-12 - 商品图片缺省组件中心图标

### 变更

- 新增商品图片缺省图标资源 `public/assets/placeholders/product-image-placeholder.png`，来源为本次提供的 `Vector.png`。
- 注册 `placeholder.productImage` 本地资源 key，继续通过 `localAssetUrl()` 适配 `/hybird` basePath 和后续 CDN 前缀。
- `ProductImagePlaceholder` 默认展示居中的缺省图标，图标尺寸使用 `clamp(28px, 52%, 60px)` 适配不同容器宽高；背景色仍可由调用方 CSS 覆盖。
- 新增 `hideDefaultIcon` 选项，供订单空态等自绘插画场景关闭默认图标。
- 个人中心二级页商品缩略图已从旧手绘衣服占位改为统一缺省图标。

### 验证

- `pnpm exec vitest run src/design-system/components/product-image-placeholder.test.tsx src/lib/assets/asset-url.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx`：通过，3 files / 14 tests。
- `pnpm typecheck`：通过。
- 本地 HTTP smoke：`/hybird/assets/placeholders/product-image-placeholder.png` 和 `/hybird/favorites/products` 均返回 200。
- Chrome headless 截图 `/tmp/meumall-placeholder-update/favorites.png`：收藏页商品缩略图中缺省图标居中且尺寸合适。

## 2026-06-12 - 原生页 Bridge Route 直出

### 变更

- `HybridLink strategy="native-page"` 仍作为 H5 侧容器策略入口。
- `createHybridNavigator().openNativePage(name, params)` 改为发送 `{ module: "router", action: "navigate", payload: { route: name, params } }`。
- `settings`、`address` 等原生页都不再走 `route: "native_page"` + `params.name` 包装。
- 更新 Native Bridge 规范、根级 Bridge 契约、原生路由对接说明和验证记录。

### 验证

- 先按 TDD 新增 `hybrid-navigation` 测试并确认非 settings 原生页仍发送旧 `native_page` payload 时失败。
- `pnpm exec vitest run src/lib/navigation/hybrid-navigation.test.ts src/lib/bridge/protocol-bridge.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx`：通过，3 files / 12 tests。
- `pnpm test`：通过，44 files / 225 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

## 2026-06-12 - Java 后端来源 Header

### 变更

- `createBackendClient()` 对所有 Java / mall 后端出站请求统一注入 `source: "1"`。
- 调用方传入其它 `source` 值时，backend client 会覆盖为 App 来源 `1`。
- Python 后端请求不携带 `source` header。
- 更新 H5 BFF HTTP 鉴权契约、API 规范、项目状态和变更记录。

### 验证

- `pnpm exec vitest run src/server/http/backend-client.test.ts`：先按 TDD 确认缺少 / 错误 `source` 时失败。
- `pnpm exec vitest run src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/product/product-real-flow.test.tsx src/features/home/home-real-api.test.ts`：通过，4 files / 38 tests。
- `pnpm test`：通过，44 files / 224 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

## 2026-06-12 - 个人中心二级页静态高保真

### 变更

- 新增 `mine-secondary` 功能模块，集中维护钱包、收藏/足迹、优惠券和订单的本地 mock 数据与页面组件。
- 新增 `/wallet`、`/footprints`、`/coupons` 路由，重做 `/favorites/products` 和 `/orders` 页面。
- 钱包页实现余额卡、提现入口、结算 tab、筛选条、月度汇总和流水列表。
- 钱包页结算 tab 已改为页面内 state 切换，不再输出 `/wallet?tab=...` 链接；切换时 tab 横线和下方汇总/流水列表带过渡动画。
- 钱包页顶部导航补回 Figma 中的“历史钱包”入口和钱包图标样式。
- 订单页状态 tab 已改为页面内 state 切换，不再输出 `/orders?status=...` 链接；保留 URL query 作为首次进入页面的初始状态，页内点击不再触发路由事件。
- 我的收藏/我的足迹复用横向商品卡，支持编辑态选择、全选、取消、删除和未选择删除提示。
- 我的收藏/我的足迹编辑态删除已补确认框；有选中商品时先弹“确认删除”，取消关闭弹窗，确认后本地移除已选 mock 商品。
- 我的优惠券页实现可使用数量和三张券卡；订单页实现搜索、五个状态 tab、订单卡和空状态。
- `/mine` 钱包余额、优惠券和足迹入口已连接到对应二级页。
- 本次未修改商品详情、订单确认、BFF、Native Bridge、manifest 或发布链路。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts`：通过，2 files / 12 tests。
- `pnpm typecheck`：通过。
- Node HTTP smoke：`/hybird/wallet`、`/hybird/favorites/products`、`/hybird/favorites/products?edit=1`、`/hybird/footprints`、`/hybird/coupons`、`/hybird/orders?status=all`、`/hybird/orders?status=pending-receipt`、`/hybird/orders?status=empty`、`/hybird/mine` 均返回 200。
- Chrome headless 截图检查已覆盖 390px 和 430px 视口；430px 完整 WebView 容器下钱包、收藏和订单首屏正常，390px 截图存在本机 headless 容器裁切偏差。
- Chrome DevTools 点击验证：点击钱包“待结算”后 URL 保持 `http://localhost:3109/hybird/wallet`，选中 tab 变为“待结算”，页面出现待结算数据。
- Chrome DevTools 点击验证：点击订单“待收货”后 URL 保持 `http://localhost:3109/hybird/orders`，选中 tab 变为“待收货”，订单卡从 4 条切到 1 条。
- Chrome DevTools 点击验证：`/hybird/favorites/products?edit=1` 点击底部“删除”后出现 `role="dialog"` 确认框，文案为“确定删除已选的 8 个商品吗？”。

## 2026-06-12 - 我的页达人等级图片徽章

### 变更

- 新增 `/mine` 昵称旁 V1-V5 达人等级横条 PNG 资源，放入 `public/assets/mine/level-badges/`。
- 注册 `mine.levelBadge.v1-v5` 本地资源 key，并补充 basePath 回归测试。
- 我的页 profile mock 增加 `levelBadgeAssetKey`，页面从文字胶囊改为渲染等级图片，保留 `alt` 文本。
- 更新本地资源说明和根级独立任务 `TASK-2026-0612-011-mine-level-badge-images`。

### 验证

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts`：通过，1 file / 7 tests。
- `pnpm typecheck`：通过。
- 本地 HTTP smoke：`/hybird/mine` 返回 200，HTML 包含 `/hybird/assets/mine/level-badges/level-badge-v3.png`；该图片资源返回 200。
- Chrome headless 390x844 截图已生成到 `/tmp/meumall-mine-level-badge.png`，昵称后的 V3 图片横条可见。
- Playwright 不在当前 H5 项目依赖中，截图验证改用本机 Chrome headless。

## 2026-06-12 - 商品详情店铺与评论概要

### 变更

- `/api/bff/product-detail` 在商品主数据成功后尽量聚合 Java `/shop/headInfo`、`/prod/prodCommData` 和 `/prod/prodCommPageByProd`。
- 商品详情 mapper 新增 `view.shop`、`modules.shopInfo`、`modules.commentSummary` 和 `modules.commentPage`。
- 商品详情页不再展示店铺卡片，该位置按 Figma 展示评价模块；店铺头部只保留在 modules。
- 评论概要改为真实接口数据：展示评价数量、好评率、评价标签和最多前两条评论。
- 评价模块无评论时也固定展示空态。
- 商品主图迁移旧 `prod-imgs-video` 语义：支持视频首帧 + 图片混合轮播、切换、预览和播放。
- 商品主图轮播新增触屏横滑和鼠标拖拽切换；横向位移超过阈值且大于纵向位移时才切换，避免误伤页面上下滚动。
- 商品主图切换改为横向轨道 `translate3d` 动画，使用 280ms cubic-bezier 过渡。
- 售后保障按 `afterSaleType`、`afterSaleContent` 映射，资质条按 `prodCertificateRecordDtoList` 映射；无字段时不展示静态兜底。
- 评论图片相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接，完整 URL 保持原样。
- 店铺或评论辅助接口失败时对应模块隐藏，不影响商品主信息、SKU 和立即购买。
- 更新商品详情 API 契约、API 规范、项目状态、TODO 和变更记录。

### 验证

- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/product-detail.test.tsx`：通过，2 files / 13 tests。
- `pnpm test`：通过，43 files / 218 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run build`：通过。
- 本地 BFF smoke：`/hybird/api/bff/product-detail?prodId=1000054&addrId=0&dvyType=1` 返回 200。
- 本地浏览器 smoke：`/hybird/product/1000054` 渲染真实商品、评论概要和详情图；店铺卡片不可见；主图可切换。
- 本地浏览器 drag smoke：在主图真实坐标内鼠标左滑后，角标从 `1/6` 切到 `2/6`。
- 本地浏览器 animation smoke：媒体轨道存在 transform transition，切换后轨道平移到 `-430px`。

## 2026-06-12 - 商品详情富文本内容渲染

### 变更

- 新增 `ProductRichContent` 组件，使用 `html-react-parser` 将清洗后的商品详情 HTML 渲染为 React 节点。
- 新增 `src/features/product/rich-content.ts`，使用 `sanitize-html` 白名单清洗 `/prod/prodInfo.content`，移除 `script`、事件属性和危险协议。
- 商品详情 mapper 将后端 `content` 转为 `view.detail.richContentHtml`；富文本图片相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接。
- 商品详情内容区优先渲染富文本，缺失时回退原有详情描述和占位图。
- 更新商品详情 API 契约、API 规范、项目状态、TODO 和变更记录。

### 验证

- `pnpm exec vitest run src/features/product/product-rich-content.test.tsx src/features/product/product-real-flow.test.tsx`：通过，2 files / 11 tests。
- `pnpm test`：通过，43 files / 214 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run build`：通过。

## 2026-06-11 - 商品详情真实接口与订单确认实时校验

### 变更

- 新增 `/api/bff/product-detail?prodId=<prodId>`，由 H5 BFF 调 Java `/prod/prodInfo?prodId=<prodId>&addrId=0&dvyType=1`，用于普通商品快递详情。
- 新增 `/api/bff/order-confirm?productId=<prodId>&skuId=<skuId>&quantity=<n>`，订单确认页重新请求商品详情并校验 SKU、库存、价格和数量，不信任 URL 中的商品快照。
- 新增 `src/features/product/server/product-real-service.ts`，集中维护 Java 商品详情 envelope、商品/SKU mapper、OSS 图片拼接、默认 SKU 选择和订单确认 view model。
- 新增 `src/features/product/api.ts`，浏览器端只请求 H5 BFF endpoint，不直接请求 Java 后端或读取 token。
- `/product/[id]` 对数字商品 ID 渲染远程商品加载壳，客户端通过 BFF 拉取真实商品；本地 mock `p-1001` 仍保持静态高保真验证入口。
- `/order-confirm` 对真实 `productId + skuId` 参数渲染订单实时确认壳，客户端校验成功后展示订单，失败时禁用交易。
- 订单确认成功态保留真实 `productId`，顶部返回使用对应商品详情页作为 fallback，避免真实链路返回静态样例商品。
- 商品详情首图支持后端返回的真实图片 URL；相对图片路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接，完整 URL 保持原样。
- 购买弹窗增加空 SKU / 无库存兜底，避免真实接口尚未返回 SKU 时崩溃。
- 新增根级工作项、对接说明和 API 契约：
  - `.ai-workspace/tasks/TASK-2026-0611-008-h5-product-detail-real-flow.md`
  - `.ai-workspace/integration-briefs/BRIEF-2026-0611-008-h5-product-detail-real-flow.md`
  - `.ai-workspace/contracts/api/h5-product-detail-real-flow-contract.md`

### 验证

- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx`：通过，2 files / 11 tests。
- `pnpm exec vitest run src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx`：通过，5 tests。
- `pnpm test`：通过，42 files / 212 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run build`：通过，构建产物包含 `/api/bff/product-detail`、`/api/bff/order-confirm`、`/product/[id]` 和 `/order-confirm`。
- 本地已有 dev server `http://localhost:3109`；`/hybird/product/1000054` 和 `/hybird/order-confirm?productId=1000054&skuId=6001&quantity=1` 均返回 HTTP 200。

## 2026-06-11 - 首页推荐商品与相似推荐商品页接口修正

### 变更

- `/api/bff/home` 从“首页核心 + 为您推荐分页”的顺序聚合，调整为只请求 Java `/p/app/home/index`，降低首屏被分页接口拖慢的风险。
- 新增 `/api/bff/home/recommend-products?current=<current>&size=<size>`，独立请求 Java `/p/app/home/recommendProds`，用于首页“为您推荐”商品区。
- 保留 `/api/bff/home/for-you-products?current=<current>&size=<size>`，独立请求 Java `/p/app/home/forYouProds`，用于新页面 `/home/recommend-products` 的“相似推荐商品”列表。
- 首页“为您推荐”右侧“更多”现在跳转 `/home/recommend-products`；新页面包含顶部导航、搜索栏、筛选条件和商品列表，结构与 `/search` 的结果列表相似。
- 相似推荐商品页新增底部自动加载更多：sentinel 进入视口后按 `current + 1` 请求下一页，成功后追加商品，失败时保留已加载商品。
- 首页“为您推荐”区新增相同的底部自动加载更多能力，请求 `/api/bff/home/recommend-products` 下一页；加载到第 2 页后显示“顶部”按钮，点击平滑回到页面顶部。
- 分页 BFF 原始模块字段按场景拆分：首页推荐返回 `recommendProducts/recommendPage`，相似推荐页返回 `forYouProducts/forYouPage`，避免后续联调误判字段来源。
- 首页客户端并发请求首页核心和首页推荐商品分页；分页失败只影响推荐商品区，首页核心仍可展示。
- 根据本地 Apifox OpenAPI 核对并补全首页字段保留策略：`modules` 保留 `hotCategory.top3`、`seckillModule.products`、优惠券、佣金、多规格和后续新增字段。
- 更新首页 API 规范、根级 API 契约、页面盘点、任务、项目状态和测试报告。

### 验证

- `pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx src/features/home/home-recommend-products.test.tsx`：通过，6 files / 42 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - 首页 BFF 响应结构扩展

### 变更

- `/api/bff/home` 成功响应从单一 `HomeExperienceData` 调整为 `HomeBffData`：`view` 用于当前首页渲染，`modules` 保留 Java 首页业务模块字段。
- `/api/bff/home` 的 `modules` 常规返回 `banners`、`hotCategory`、`categoryTop8` 和 `seckillModule`；分页 BFF 按接口场景分别返回 `recommendProducts/recommendPage` 或 `forYouProducts/forYouPage`，避免联调阶段字段被过度裁剪。
- 新增 `debugRaw`：仅 `GET /api/bff/home?debugRaw=1` 且 `APP_ENV=local/test` 时返回 Java 原始 envelope，正式环境不返回。
- 首页客户端改为读取 `result.data.view`，现有页面渲染不直接依赖 Java VO。
- 更新首页 API 规范、根级 API 契约和任务说明。

### 验证

- `pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，5 files / 35 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - BFF 后端响应日志完整展开

### 变更

- `[h5-bff-backend-call]` 控制台输出改为格式化 JSON，避免 Node 默认把嵌套响应折叠成 `[Array]` / `[Object]`。
- 单测覆盖 `responseBody.data.banners` 和 `hotCategory` 的嵌套输出，确保联调时能看到 Java 原始响应明细。
- API 规范补充说明：本地和测试环境查看后端原始数据时，以启动 H5 的终端日志为准。

### 验证

- `pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts`：通过，4 files / 23 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - BFF 后端业务码日志增强

### 变更

- `[h5-bff-backend-call]` 日志补充 `backendBusinessCode`、`backendBusinessMessage` 和 `backendBusinessSuccess`。
- API 规范补充说明：`backendStatus=200` 只代表 HTTP 成功，不代表后端业务成功；Java 返回 `success:false/code:A00004` 时，BFF 会转换成 `AUTH_FAILED`。
- 增加 HTTP 200 + 业务失败响应的日志回归测试。

### 验证

- `pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/home/home-real-api.test.ts`：通过，3 files / 12 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - H5 本地 token 兜底

### 变更

- `cookie-auth` 增加 local-only token fallback：`APP_ENV=local` 且 Cookie 缺失时，Java 使用 `H5_LOCAL_JAVA_TOKEN`，Python 使用 `H5_LOCAL_PYTHON_TOKEN`。
- Cookie 仍然优先于本地 env token；`APP_ENV=test/prod` 时忽略 `H5_LOCAL_*_TOKEN`。
- `createBffRequestContext()` 增加 `authEnv` 注入点，便于测试 local fallback。
- `.env.example`、API 规范和 BFF 鉴权契约补充本地 token 用法和安全边界。

### 验证

- `pnpm test src/server/auth/cookie-auth.test.ts src/server/http/bff-context.test.ts src/server/http/backend-client.test.ts src/features/home/home-real-api.test.ts`：通过，4 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - H5 正式迁移说明与 BFF 排错补齐

### 变更

- 首页停止请求旧 `GET /api/h5/home/config/active?environment=prod`，避免线上 404 噪音。
- 清理首页旧远程配置 fetch helper，首页模块配置改为使用本地默认配置或缓存；首页业务数据继续走 `/api/bff/home`。
- 首页 BFF route 捕获自身异常时输出 `[h5-bff-route-error]`，与已有 `[h5-bff-backend-call]` 后端调用日志形成两层排查链路。
- API 规范补充正式环境迁移清单、BFF 日志前缀、字段和 requestId 排查方式。
- 发布规范补充正式迁移的配置层和发布层边界。

### 验证

- `pnpm test src/features/home/home.test.tsx src/features/home/home-real-api.test.ts src/server/http/bff-context.test.ts`：通过，3 files / 16 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - H5 三套环境配置收敛

### 变更

- 新增 `config/env/h5.local.env`、`config/env/h5.test.env`、`config/env/h5.prod.env`，本地、测试、正式占位三套 profile 均指向当前测试 H5 配置 `https://hybird.aigcpop.com`。
- Java 后端统一配置为 `https://test.aigcpop.com/mini_h5`，Python 后端统一配置为 `https://test.aigcpop.com/api`。
- 根目录 `dev:h5` 和 H5 项目 `dev:local` / `dev:test` / `dev:prod` 启动命令改为读取 tracked profile。
- `scripts/root/dev-all.sh` 支持通过 `H5_ENV` / `H5_ENV_FILE` 加载 H5 环境文件，并把 Java / Python 后端地址注入 H5 dev server。
- 更新 `.env.example`、API 规范、发布规范、BFF 鉴权契约、首页对接说明、项目状态和 TODO。

### 验证

- package JSON 解析：通过。
- `bash -n scripts/root/dev-all.sh`：通过。
- `pnpm run test:dev-script`：通过。
- `pnpm test src/server/http/backend-registry.test.ts src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/home/home-real-api.test.ts`：通过，4 files / 12 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - 首页真实接口首批接入

### 变更

- 新增 `/api/bff/home`，由 H5 BFF 调 Java `/p/app/home/index` 和 `/p/app/home/forYouProds?current=1&size=10`。
- 新增首页真实接口 mapper，将 Apifox 字段转换为 `HomeExperienceData`。
- 首页客户端优先通过 `createHomeApi(createH5Client()).getHome()` 请求真实数据；早期失败回落 `homeExperienceData` 的策略已在后续正式联调阶段移除。
- 首页支持后端返回远程 banner、分类 icon 和商品图；缺图时保留本地资源/占位。
- `.env.example` 补充 `JAVA_API_BASE_URL` 和 `PYTHON_API_BASE_URL`。
- 更新首页 API 契约、对接说明、任务、API 规范和项目状态。

### 验证

- `pnpm test src/features/home/home-real-api.test.ts src/features/home/home.test.tsx src/lib/http/h5-client.test.ts src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts`：通过，5 files / 24 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 直接请求 Java 测试环境无 token 返回 `A00004 Unauthorized`，已确认首页接口需要 `mallToken`。
- 当前本地已有 3000 dev server 未带 `JAVA_API_BASE_URL`，`/api/bff/home` 返回 `JAVA_API_BASE_URL is required`，需要按 `.env.example` 重启并注入 `mallToken` 后看真实数据。

## 2026-06-11 - H5 HTTP 请求架构补齐

### 变更

- 新增 `src/lib/http/request-diagnostics.ts`，维护 `pageSessionId`、最近请求记录、最近失败 requestId 和诊断快照。
- `createH5Client()` 在浏览器环境下合并默认客户端上下文，并在请求成功、业务失败和网络异常时记录请求诊断。
- 新增 `src/server/http/bff-context.ts`，统一 BFF route 的 Cookie auth、客户端上下文、backend client 和安全 backend call logger。
- `/api/bff/user/profile` 示例 route 迁移到 `createBffRequestContext()`。
- 新增 `src/features/home/runtime-api.ts`，首页 Runtime 面板不再直接拼 BFF path。
- 新增 `src/features/promotion/api.ts`，集中维护推广模块当前 BFF mock 接口路径，作为后续真实接口迁移样板。
- 更新 API 规范、ADR、HTTP 架构宣讲文档和根级任务记录。

### 验证

- `pnpm test src/lib/http/h5-client.test.ts src/lib/http/request-diagnostics.test.ts src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/bff-response.test.ts src/features/home/runtime-api.test.ts src/features/home/home.test.tsx src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts`：通过，9 files / 44 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 2026-06-11 - H5 HTTP 请求观测第一阶段

### 变更

- 新增 `src/lib/http/client-context.ts`，统一定义 App / 设备 / 系统 / WebView 上下文，并映射为安全的 `x-*` header。
- `createH5Client()` 支持传入客户端上下文，请求 BFF 时继续保留 `credentials: "include"` 和 `x-request-id`，并补充 `x-page-session-id`、`x-app-version`、`x-platform`、`x-os-version`、`x-device-model` 等可选 header。
- H5 client 不手动设置浏览器禁止的 `User-Agent`；浏览器到 BFF 使用 WebView 自动 UA，BFF 到后端再透传。
- `createBackendClient()` 支持透传原始 `user-agent` 和客户端上下文 header，并新增结构化 logger hook，用于记录 requestId、backend、path、status、duration、错误码和设备上下文。
- `/api/bff/user/profile` 示例 route 已从浏览器请求头读取客户端上下文，并传给 backend client。
- 更新 H5 API 文档、根级 BFF 鉴权契约、HTTP 架构宣讲文档和根级任务记录。

### 验证

- `pnpm test src/lib/http/h5-client.test.ts src/server/http/backend-client.test.ts src/server/http/bff-response.test.ts`：通过，3 files / 9 tests。
- `pnpm typecheck`：通过。

## 2026-06-10 - 禁止 H5 WebView 页面级缩放

### 变更

- 全局 viewport 增加 `minimumScale: 1`、`maximumScale: 1` 和 `userScalable: false`，禁止 App WebView 双指缩放页面。
- 新增 `DisableViewportZoom` 客户端 runtime，拦截 iOS WebKit `gesturestart/gesturechange/gestureend` 和多指 `touchmove`。
- 全局 CSS 增加移动端 `touch-action: pan-x pan-y` 与文本缩放约束，保留正常单指滚动。
- 抽出 `appViewport` 和缩放判断纯函数，补充回归测试，避免后续改入口时误删缩放限制。

### 验证

- `pnpm exec vitest run src/lib/runtime/viewport-config.test.ts src/lib/runtime/viewport-zoom.test.ts`：通过，2 files / 4 tests。
- `pnpm run typecheck`：通过。

## 2026-06-10 - 分类页切换与分享联调修正

### 变更

- 商品分类页一级分类从 hash 链接切换为页面内 state 切换，点击 tab 不再向地址栏写入 `#level-*`。
- 商品分类页点击不同一级分类时会刷新右侧分类内容，避免“点击没有动静”的体验。
- 推广商品分享 Bridge payload 的 `productId` 临时固定为 `1001`，用于原生 App 联调测试。
- `ProductImagePlaceholder` 移除内部白色圆点，只保留灰色缺省底图。

### 验证

- `pnpm exec vitest run src/app/category/page.test.tsx src/features/promotion/promotion-products.test.tsx src/design-system/components/product-image-placeholder.test.tsx`：通过，3 files / 8 tests。
- `pnpm exec vitest run src/app/category/page.test.tsx src/features/promotion/promotion-products.test.tsx src/features/search/search.test.tsx src/features/seckill/seckill.test.tsx src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx src/design-system/components/product-image-placeholder.test.tsx`：通过，7 files / 23 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm run build`：通过。

## 2026-06-10 - 统一商品卡片缺省图组件

### 变更

- 新增 design-system 公共组件 `ProductImagePlaceholder`，用于商品卡片、订单商品行和购买弹窗的灰色商品图占位。
- 推广商品列表、搜索热榜商品、搜索结果商品、限时秒杀商品、商品购买弹窗和提交订单商品行已统一替换为该组件。
- 清理上述页面旧的手写渐变/伪元素商品图占位，业务 CSS 只保留尺寸、圆角和布局。
- 更新 design-system 使用说明，后续未接真实商品图片前统一使用 `ProductImagePlaceholder`。

### 验证

- `pnpm exec vitest run src/design-system/components/product-image-placeholder.test.tsx src/features/promotion/promotion-products.test.tsx src/features/search/search.test.tsx src/features/seckill/seckill.test.tsx src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx`：通过，6 files / 22 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm test -- --runInBand`：通过，32 files / 154 tests。
- `pnpm run build`：通过。

## 2026-06-10 - 商品详情购买弹窗与提交订单静态页

### 变更

- 商品详情页“立即购买”改为打开底部购买弹窗，不再直接跳转低保真订单页。
- 新增 `ProductPurchaseSheet`，按 Figma 实现遮罩、底部圆角弹层、商品摘要、规格选项、配送方式、数量步进器和确认按钮。
- 商品详情 mock 补充规格、库存、默认数量和配送方式数据，购买确认链接会携带 `productId`、`skuId` 和 `quantity`。
- `/order-confirm` 已替换为高保真提交订单页，支持默认地址态和未填写收货信息态。
- 新增订单确认 mock service，统一生成地址、商品行、配送/优惠/实付款明细和底部结算栏；当前仍为 H5 静态 mock 阶段，真实价格、库存、地址、优惠券和提交接口待后端联调。

### 验证

- `pnpm exec vitest run src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx`：通过，2 files / 5 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm test -- --runInBand`：通过，31 files / 150 tests。
- `pnpm run build`：通过。

## 2026-06-10 - 统一 DropdownFilterBar 筛选交互

### 变更

- `DropdownFilterBar` 新增公共状态 hook `useDropdownFilterBarState()`，统一管理激活筛选、展开项、选中项和关闭行为。
- `DropdownFilterBar` 支持根据当前激活项的 `selectedOptionKey` 自动展示已选选项文案，例如“商品分类”选中后展示“保健品”，“分类”选中后展示“生鲜熟食”。
- `/search` 搜索结果页和 `/promotion/products` 推广商品页已迁移到同一套筛选状态逻辑。
- 保留主流筛选交互：未展开时点击筛选项展开；点击具体选项后自动关闭；蒙层点击关闭；展开时底部列表不可滚动。

### 验证

- `pnpm exec vitest run src/design-system/components/dropdown-filter-bar.test.tsx src/features/search/search.test.tsx src/features/promotion/promotion-products.test.tsx`：通过，3 files / 14 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。

## 2026-06-10 - 限时秒杀背景与推广分享 Bridge

### 变更

- 新增限时秒杀背景资源 `seckill.heroBg`，文件位于 `public/assets/seckill/seckill-hero-bg.png`。
- 限时秒杀页头部从 CSS 手绘渐变切换为设计图背景图片，并保留无障碍标题。
- 推广商品页“推广”按钮接入 `event/share` Native Bridge 事件。
- 分享 payload 包含 `productId`、`title` 和 `source: "promotion_products"`；Web 环境 Bridge 不可用时安全 no-op。
- 更新 Native Bridge 文档，补充 `event/share` payload 和 H5 使用场景。

### 验证

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/seckill/seckill.test.tsx src/features/promotion/promotion-products.test.tsx src/lib/bridge/protocol-bridge.test.ts`：通过，4 files / 14 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm test -- --runInBand`：通过，30 files / 143 tests。
- `pnpm run build`：通过。
- 本地浏览器验证：`/seckill` 已渲染 `seckill-hero-bg.png`，页面无横向溢出；推广商品分享 Bridge 通过单测验证事件发送。

## 2026-06-10 - 搜索与推广商品图标切换为本地静态资源

### 变更

- 新增通用图标资源：`common.icon.search`、`common.icon.close`、`common.icon.delete`，文件位于 `public/assets/common/icons/`。
- 新增推广商品图标资源：`promotion.icon.share`、`promotion.icon.collect`，文件位于 `public/assets/promotion/icons/`。
- 搜索页搜索图标、清除历史图标和搜索结果清空词图标改为通过 `localAssetUrl()` 引用本地 PNG。
- 首页搜索入口和推广商品页搜索栏复用同一个 `common.icon.search`。
- 推广商品页“推广”和“收藏”按钮改为使用本地分享/收藏 PNG，去掉文字符号占位。

### 验证

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/search/search.test.tsx src/features/promotion/promotion-products.test.tsx src/features/home/home.test.tsx`：通过，4 files / 24 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm test -- --runInBand`：通过，29 files / 140 tests。
- `pnpm run build`：通过。
- 本地浏览器验证：`/search` 已渲染 search/delete PNG，`/search?q=短袖` 已渲染 search/close PNG，`/promotion/products` 已渲染 search/share/collect PNG，页面无横向溢出。

## 2026-06-10 - 修复搜索与筛选交互污染路由历史

### 变更

- 搜索页热榜 tab 从 query 跳转改为页面内 state 切换，点击“喵呜热榜 / 生鲜 / 饮料”等 tab 不再改变 URL。
- 搜索结果页筛选从 query 跳转改为页面内 state 切换，销量、价格、分类和下拉选项不再向 WebView history 追加记录。
- 推广商品页筛选同步改为页面内 state 切换，商品分类、佣金属性、商品属性、销量和价格筛选不再污染路由栈。
- 搜索提交改为替换式跳转，连续搜索不会堆积多条历史记录。
- tab、筛选项和列表增加选中态、下划线、箭头旋转与 fade-up 列表切换反馈，点击后能看到当前筛选和数据变化。
- 筛选组件拆分“选中态”和“展开态”，支持点击蒙层收起；选择下拉条件后自动收起，同时保留当前筛选选中态。
- 新增回归测试，防止搜索热榜 tab、搜索筛选和推广商品筛选重新输出 `?ranking=` / `?filter=` 链接。

### 验证

- `pnpm exec vitest run src/features/search/search.test.tsx src/features/promotion/promotion-products.test.tsx`：通过，2 files / 5 tests。
- `pnpm run typecheck`：通过。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm test -- --runInBand`：通过，28 files / 136 tests。
- `pnpm run build`：通过。
- 本地浏览器验证：`/search` 点击“生鲜”后 URL 保持 `/search`，选中态和榜单数据变化；`/search?q=短袖` 点击“分类”后 URL 保持不变，弹出分类选项并刷新列表；`/promotion/products` 点击“佣金属性”后 URL 保持不变，弹出佣金选项并刷新列表；搜索按钮提交进入结果页。
- 本地浏览器验证：搜索结果页和推广商品页的筛选展开后，点击蒙层会关闭下拉；重新展开并选择某个条件后，下拉会自动关闭，URL 仍保持不变。

## 2026-06-10 - v1.2.0 首批静态页面开发

### 变更

- 按 Figma v1.2.0 范围完成搜索首页、清除历史弹窗、搜索结果页、搜索筛选弹层和完整热榜页。
- 新增 `DropdownFilterBar` 公共筛选组件，统一搜索结果和推广商品页的筛选行、激活态和下拉选项层。
- 重做推广商品页静态高保真结构，补充顶部达人公告、搜索栏、商品分类/佣金属性/商品属性/销量/价格筛选和横向商品卡。
- 首页“推广带货”活动入口改为 `/promotion/products`，符合 Tab 根页进入二级 H5 页面时新开 WebView 的容器策略。
- 重做限时秒杀页静态高保真结构，补充透明导航、渐变头图、横向秒杀商品卡、倒计时、进度和秒杀按钮。
- 新增 `/search/ranking` 完整热榜路由；商品图片按本阶段要求使用灰色色块占位，不引入正式商品图。

### 验证

- `pnpm run typecheck`：通过。
- `pnpm test -- --runInBand`：通过，27 files / 133 tests。
- `pnpm run lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm run build`：通过。
- 本地浏览器 smoke：`/hybird/search`、`/hybird/search?clear=1`、`/hybird/search?q=短袖&filter=category`、`/hybird/search/ranking`、`/hybird/promotion/products?filter=commission`、`/hybird/seckill` 均可访问，390px 视口未发现横向溢出。

## 2026-06-09 - 发布 H5 v1.0.11

### 变更

- 将 `package.json` 版本升级为 `1.0.11`，创建并推送 `h5/v1.0.11` tag。
- 使用根目录正式多版本发布脚本部署 `meu-mall/h5:v1.0.11`。
- 注册 release `21f40cdf-6e6e-4a96-a261-c0a9e9a6d3e5`，并 promote 为 prod active。
- active manifest 从 `v1.0.10` 切换到 `v1.0.11`，rollbackVersion 为 `v1.0.10`。
- 删除旧 `/member` 页面，并从 manifest 路由清单中移除 `/member`。

### 验证

- 发布前：`pnpm test` 通过，27 files / 133 tests。
- 发布前：`pnpm typecheck` 通过。
- 发布前：`pnpm lint` 通过，存在 4 条历史 `<img>` warning，无 error。
- 发布前：`H5_BASE_PATH=/h5-v/v1.0.11 NEXT_PUBLIC_H5_BASE_PATH=/h5-v/v1.0.11 H5_RELEASE_LABEL=v1.0.11 H5_RELEASE_VARIANT=green pnpm build` 通过。
- 线上发布脚本 remote smoke 通过：HTTP/HTTPS `/h5-v/v1.0.11/api/health` 与 `/h5-v/v1.0.11/` 可访问。
- 公网复核：active manifest `stableVersion=v1.0.11`，`rollbackVersion=v1.0.10`，`/h5-v/v1.0.11/promotion`、`/mine`、`/search` 返回 200，`/h5-v/v1.0.11/member` 返回 404。

## 2026-06-09 - H5 与原生路由跳转基础闭环

### 变更

- 扩展统一 Bridge route：`tab`、`close_webview`，并新增 `event/route_changed` 路由变化上报；原生页后续收敛为直接 route。
- 新增 `src/lib/navigation`：`HybridLink`、`createHybridNavigator()`、`HybridRouteReporter`，业务页不再直接拼 Bridge 信封。
- `TopNavigation` 的返回按钮改为调用 H5/Native 统一返回策略：原生容器优先回退 WebView history，退不动再关闭当前二级 WebView；Web 环境 fallback 到浏览器 history 或指定 fallback 路由。
- 首页入口接入容器策略：搜索、消息、分类、秒杀、商品详情默认新开 H5 WebView；首页切推广 Tab 使用 `tab` route。
- 我的页入口接入容器策略：权益中心、订单、收藏、客服等新开 H5 WebView；设置入口走原生页 route；未实现入口暂不跳转。
- 推广首页入口接入容器策略：活动中心、榜单中心、佣金收益、推广商品等新开 H5 WebView；头像、昵称、徽章不再跳权益中心。
- 搜索页商品卡片保持当前 WebView 内 H5 push，符合“二级页内部下钻不再新开 WebView”的原则。

### 验证

- `pnpm exec vitest run src/lib/navigation/hybrid-navigation.test.ts src/lib/bridge/protocol-bridge.test.ts src/design-system/components/navigation.test.tsx src/features/home/home.test.tsx src/features/search/search.test.tsx src/features/product/product-detail.test.tsx`：通过，6 files / 31 tests。
- `pnpm typecheck`：通过。

## 2026-06-05 - 修复本地 dev 权益中心图片丢失

### 根因

- 本地 `http://localhost:3109/hybird/promotion/benefits?level=v3` 服务端 HTML 会输出 `/hybird/assets/...`，图片文件本身也能通过 `/hybird/assets/...` 访问。
- 但根目录 `dev:h5` 和 `dev-all.sh` 只设置了 `H5_BASE_PATH=/hybird`，没有设置 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`。
- 权益中心是客户端组件，hydrate 或切换等级后会在浏览器端重新执行 `localAssetUrl()`；浏览器端无法读取非公开的 `H5_BASE_PATH`，因此可能退回裸 `/assets/...`，而裸 `/assets/...` 在当前 basePath 下是 404。

### 变更

- 根目录 `package.json` 的 `dev:h5` 增加 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`。
- `scripts/root/dev-all.sh` 启动 H5 时同步传入 `NEXT_PUBLIC_H5_BASE_PATH="${H5_BASE_PATH}"`。
- `next.config.ts` 改为优先读取 `NEXT_PUBLIC_H5_BASE_PATH`，确保 Next basePath 和客户端资源 helper 使用同一个公开变量。
- `asset-url.test.ts` 增加 `next.config.ts` 防回归检查，确保 Next basePath 继续包含 `process.env.NEXT_PUBLIC_H5_BASE_PATH`。

### 验证

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`：通过，2 files / 20 tests。
- `pnpm typecheck`：通过。
- 使用 `H5_BASE_PATH=/hybird NEXT_PUBLIC_H5_BASE_PATH=/hybird pnpm exec next dev -H localhost -p 3109` 启动后，`/hybird/promotion/benefits?level=v3` 返回 200。
- `curl http://localhost:3109/hybird/promotion/benefits?level=v3`：HTML 中权益中心背景、徽章、箭头、icon 均为 `/hybird/assets/...`，未发现裸 `src="/assets/` 或 `url(/assets/`。
- `/hybird/assets/promotion/equity/equity-bg-v3.png` 返回 200；裸 `/assets/promotion/equity/equity-bg-v3.png` 返回 404，符合 basePath 预期。

## 2026-06-05 - 排行榜共享背景和领奖台布局修正

### 变更

- 新增共享浅绿顶部背景资源 `shared.greenHeroBg`，路径为 `public/assets/shared/green-hero-bg.png`。
- `mine.hero.background`、`promotion.rewardRecordsBg` 和 `promotion.rankingHeroBg` 均复用同一张共享背景，避免我的页、奖励记录和排行榜重复维护相同图片。
- 排行榜顶部背景从手写渐变改为 `localAssetUrl("promotion.rankingHeroBg")` 图片背景，并保留 `background-size: 100% 100%`。
- 排行榜领奖台三张卡改为 360px 容器内贴合居中排列，避免 430px 调试宽度下中间间隙过大。
- 排行榜皇冠位置改到头像顶部右侧，保持皇冠、头像和领奖台的层级关系。
- 确认排行榜顶部导航使用项目公共预设 `TransparentNavPage`，底层组合 `TopNavigation`。
- 删除已跟踪的旧奖励记录专属背景 `public/assets/promotion/reward-records/reward-records-bg.png`，避免与共享背景重复维护。

### 验证

- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts`：通过，2 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm build`：通过。
- 本地 `curl http://localhost:3109/hybird/promotion/ranking/amount`：HTML 中已输出 `/hybird/assets/shared/green-hero-bg.png`，并保留 `TransparentNavPage` / `TopNavigation` 结构。

## 2026-06-05 - 排行榜销量榜和销售额榜按最新 Figma 重做

### 变更

- 重新拉取 Figma 节点 `270:5973`、`277:6570`，将达人销量榜和达人销售额榜从旧橙色头图方案调整为最新浅绿渐变背景方案。
- 排行榜顶部改为三榜 tab：达人销量榜、达人销售额榜、达人激励榜；周期切换改为绿色描边分段控件。
- 领奖台按 375 设计稿精确落位：第 1 名 120x133，第 2/3 名 120x111，并继续使用 `localAssetUrl()` 引用本地领奖台背景和皇冠资源。
- 列表和底部当前用户栏改为白底浮层 + `fill-muted` 卡片样式，销售额榜默认激活周榜。
- 设计体系补充 `brand.normal` token，对应 Figma 品牌色常规 `#A8F156`。
- mock 榜单数据更新为最新设计稿展示姓名、销量和销售额。

### 验证

- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts src/design-system/tokens/design-tokens.test.ts`：通过，3 files / 22 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- `pnpm build`：通过。
- CDP 移动端 375x812 smoke：`/hybird/promotion/ranking/sales` 和 `/hybird/promotion/ranking/amount` 均无横向溢出，`innerWidth/clientWidth/scrollWidth/bodyScrollWidth` 均为 375；销售额榜默认 active 为“达人销售额榜 / 周榜”。

## 2026-06-05 - 修复客户端静态资源 basePath 丢失

### 变更

- `assetUrl()` 从动态 `process.env[key]` 读取改为显式 `process.env.NEXT_PUBLIC_H5_ASSET_BASE_URL` / `process.env.NEXT_PUBLIC_H5_BASE_PATH`，确保 Next 客户端 bundle 能稳定内联版本 basePath。
- `asset-url.test.ts` 增加保护性测试，禁止资源工具重新出现动态 `process.env[` 读取。
- 同步更新 `AGENTS.md`、release spec、ADR、`public/assets` README 和推广页面开发规范，明确客户端组件切换状态时也必须保留 `/h5-v/<version>` 资源前缀。

### 验证

- 已先运行 `pnpm exec vitest run src/lib/assets/asset-url.test.ts`，新增测试按预期失败；修复后通过，1 file / 6 tests。
- `pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`：通过，2 files / 18 tests。
- `H5_BASE_PATH=/h5-v/v-check NEXT_PUBLIC_H5_BASE_PATH=/h5-v/v-check pnpm build`：通过。
- 干净构建后扫描 `.next/static .next/server .next/standalone`：未发现 `process.env[`。
- 构建产物片段确认客户端 bundle 已内联 `e.basePath ?? "/h5-v/v-check"`。
- 本地 standalone 请求 `/h5-v/v-check/promotion/benefits?level=v2`：HTML 中裸 `src="/assets/`、`href="/assets/`、`url(/assets/` 均为 0，`/h5-v/v-check/assets/promotion` 出现 19 次。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` 性能 warning，无 error。

## 2026-06-05 - 本地静态资源版本 basePath 约束

### 变更

- `AGENTS.md` 新增 H5 静态资源约束：业务组件禁止直接写 `/assets/...`、`/_next/...` 根路径，本地图片必须注册到 `local-assets.ts` 并通过 `localAssetUrl()` 解析。
- 推广模块页面开发总则补充本地图片资源规范，要求 mock 和业务数据保存 `LocalAssetKey`，组件渲染时再转换为 URL。
- 活动中心 icon、活动详情顶部背景、奖励记录背景和记录 icon 统一改为 `LocalAssetKey` + `localAssetUrl()`。
- 推广首页达人头像、昵称区域和徽章增加到权益中心 `/promotion/benefits?level=<level>` 的入口。
- 补充推广页面渲染测试，在 `NEXT_PUBLIC_H5_BASE_PATH=/h5-v/v1.0.9` 场景下断言图片地址带版本前缀，并检查不出现裸 `src="/assets/`、`href="/assets/` 或 `url(/assets/`。

### 验证

- `rg 'src="/assets|href="/assets|url\(/assets|heroBackgroundSrc' -n src/features/promotion src/lib/assets AGENTS.md`：业务源码未发现裸本地资源引用，剩余命中为文档规则和测试禁止项。
- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts`：通过，2 files / 17 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条 Next `<img>` 性能 warning，无 error。

### 后续

- 本轮未发布线上；线上图片修复需要后续按 H5 release 流程发布新版本并切 active。

## 2026-06-05 - 权益中心本地资源与滑动动效

### 变更

- 将权益中心 V1-V5 顶部背景、左右切换箭头和 9 个权益 icon 放入 `public/assets/promotion/equity/`。
- `local-assets.ts` 新增 `promotion.equity*` 资源 key，权益页资源继续通过 `localAssetUrl()` 解析 H5 basePath。
- `PromotionIcon` 优先渲染已注册的本地 PNG icon，未注册时保留文字色块 fallback。
- 权益中心页面入口改为一次准备 V1-V5 五档数据，新增客户端 `PromotionBenefitsCarousel` 支持左右滑、箭头切换和 query 同步。
- 新增 GSAP / `@gsap/react`，等级切换时对头图内容、徽章、等级进度和权益项做 transform/opacity 动效，并尊重 `prefers-reduced-motion`。

### 验证

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`：通过，2 files / 10 tests。
- `pnpm typecheck`：通过。
- `pnpm test`：通过，23 files / 112 tests。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- 本地 `http://localhost:3112/promotion/benefits?level=v1-v5` smoke：均返回 200。
- 本地新增权益资源 smoke：`equity-bg-v1-v5.png`、`equity-arrow-next.png`、`equity-arrow-prev.png`、`equity-icon-money.png`、`equity-icon-ai.png` 均返回 200。

### 后续

- Figma Connector 当前仍返回旧的 `token_expired`，后续工具会话恢复后需要再对权益中心节点做一轮像素级细调。

## 2026-06-04 - 推广首页达人背景和汇总卡背景图片接入

### 变更

- 将 V1-V5 推广首页达人背景图和汇总卡背景图放入 `public/assets/promotion/talent-badges/`。
- `local-assets.ts` 新增 `promotion.talentHeroBg.*` 和 `promotion.talentSummaryCard.*` 资源 key。
- `TalentHero` 从等级渐变背景切换为本地背景图片，并保留原渐变作为加载兜底。
- `TalentSummaryCard` 从渐变/色块背景切换为本地汇总卡背景图片，并保留原渐变作为加载兜底。

### 验证

- `file public/assets/promotion/talent-badges/talent-hero-bg-v*.png public/assets/promotion/talent-badges/talent-summary-card-v*.png`：确认 hero 背景为 1125x798 RGBA PNG，汇总卡背景为 1053x342 RGBA PNG。
- `pnpm test src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`：通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `curl` smoke：10 张新增背景图片均返回 200。
- `/promotion?level=v4` HTML 检查：已引用 `talent-hero-bg-v4.png` 和 `talent-summary-card-v4.png`。

### 后续

- 后续如果等级视觉继续补充图片资源，优先沿用 `promotion.talent*` key 命名体系。

## 2026-06-04 - 达人徽章本地图片资源接入

### 变更

- 将 V1-V5 达人徽章 PNG 放入 `public/assets/promotion/talent-badges/`。
- 新增 `src/lib/assets/local-assets.ts`，通过本地资源 key 统一解析 H5 basePath 或 CDN 前缀。
- `TalentBadge` 改为读取本地图片资源，推广首页和权益中心继续通过 `theme.badgeAssetKey` 使用徽章配置。
- 更新静态资源目录规范和 design-system 说明，保留后续本地配置图片扩展方式。

### 验证

- `file public/assets/promotion/talent-badges/*.png`：确认 5 张图片均为 348x348 RGBA PNG。
- `pnpm test src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`：通过，2 files / 9 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。

### 后续

- 后续新增本地稳定图片时，先放入 `public/assets/<domain>/`，再注册到 `local-assets.ts`，页面只消费资源 key。

## 2026-06-04 - 推广二级页 Design System 迁移

### 变更

- 新增 `src/features/promotion/theme/promotion-page-theme.ts`，集中维护活动状态、榜单卡片、榜单详情和权益中心的业务视觉参数。
- `PromotionShell` 接入全局 `AppScreen`，`PromotionStates` 接入 `StateView`、`Skeleton` 和 `Button`。
- 活动中心、榜单中心、榜单详情和权益中心迁移为 design-system token class，不再在页面 JSX 中写直接十六进制颜色 class。
- 更新设计体系说明、项目状态、TODO、变更记录和本轮测试报告。

### 验证

- `pnpm test src/features/promotion/promotion-service.test.ts src/design-system/tokens/design-tokens.test.ts`：通过，2 files / 7 tests。
- `pnpm test`：通过，21 files / 96 tests。
- `pnpm lint`：通过。
- `pnpm typecheck`：通过。
- `rg` 检查推广页面和 design-system：未发现直接十六进制颜色 class。
- `pnpm build`：通过。
- `curl` smoke：`/promotion/activities`、`/promotion/rank-center`、`/promotion/ranking/sales`、`/promotion/ranking/amount`、`/promotion/benefits` 均返回 200。

### 后续

- 后续推广模块重点转向真实后端接口、达人等级规则、活动状态和榜单刷新策略确认。

## 2026-06-04 - H5 Design System 基础与推广首页重构

### 变更

- 新增 `src/design-system`，沉淀 Figma 色彩 token、Tailwind 语义色、圆角、阴影、字号、间距和基础 UI primitives。
- Tailwind 扫描范围补充 `src/features` 和 `src/design-system`。
- 默认 light 主题变量切换为 Figma 色板口径，旧 `bg/fg/primary` token 继续作为兼容入口。
- 推广首页拆分为页面编排、达人头图、带货汇总、快捷入口、指标宫格、推广工具和达人主题配置。
- 新增中文设计体系说明、主题规范、编码规则和 ADR。

### 验证

- `pnpm test src/lib/theme/__tests__/tokens.test.ts src/features/promotion/promotion-service.test.ts`：通过，2 files / 6 tests。
- `pnpm test`：通过，21 files / 96 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `rg` 检查推广首页和 design-system 新增组件：未发现直接十六进制颜色 class。
- `curl -I http://localhost:3112/promotion`：200 OK。

### 后续

- 活动中心、榜单中心、榜单详情和权益中心仍需按同一模式逐步迁移。

## 2026-06-04 - 推广模块首批页面与 BFF Mock 实现

### 变更

- 新增推广模块类型、mock 数据、server service 和 H5 BFF route。
- 实现 `/promotion`、`/promotion/activities`、`/promotion/rank-center`、`/promotion/ranking/sales`、`/promotion/ranking/amount`、`/promotion/benefits` 首批页面。
- 首页支持 V1-V5 达人等级主题，活动、榜单、权益页面使用可替换的图片和 icon 占位组件，不引入 Figma 临时资源。
- 更新推广模块工作项、BFF mock 契约、项目状态和 TODO。

### 验证

- `pnpm test src/features/promotion/promotion-service.test.ts`：通过，1 file / 4 tests。
- `pnpm typecheck`：通过。
- `pnpm test`：通过，20 files / 93 tests。
- `pnpm build`：通过。
- 本地 H5 dev server `http://localhost:3112` 路由 smoke：推广页面和 BFF mock 均返回 200。

### 后续

- 继续确认真实后端接口、达人等级规则、活动状态和榜单刷新策略。

## 2026-06-04 - 推广模块页面开发总则和 BFF Mock 契约

### 变更

- 新增推广模块页面开发总则 `src/features/promotion/PAGE_DEVELOPMENT_GUIDE.md`。
- 根级新增 H5 页面开发工作流 `.ai-workspace/H5_PAGE_DEVELOPMENT_WORKFLOW.md`。
- 根级新增推广模块工作项、对接说明和 BFF mock 契约，明确首批页面路由、SSR 策略、mock 字段、Figma 节点和资产占位规则。

### 验证

- 本轮为文档和需求准备，不涉及业务代码构建。
- 已检查新增文档路径存在，并确认路由、BFF、SSR、Figma node、底部 Tab 剥离等关键规则可检索。

### 后续

- 按 `TASK-2026-0604-002-promotion-pages-bff-foundation.md` 实现推广模块 BFF mock 和高保真页面。
- 页面实现后需要运行 `pnpm test`、`pnpm typecheck` 和 `pnpm build`。

## 2026-06-04 - 原生 Cookie 双 token 与状态栏高度

### 变更

- `src/server/auth/cookie-auth.ts` 改为读取 `pythonToken`、`mallToken` 和 `statusHeight`。
- 新增 `getBackendAuthToken(auth, backend)`，Python 后端使用 `pythonToken`，Java / mall 后端使用 `mallToken`。
- `src/app/api/bff/user/profile/route.ts` 示例 Java BFF 改用 `mallToken`。
- `src/server/runtime/native-context.ts` 和首页原生传参面板展示 Python Token、Mall Token、状态栏高度。
- `statusHeight` 写入 `--native-status-height` CSS 变量，供顶部安全区处理。
- 更新 H5 API 文档和根级 H5 BFF 鉴权契约。

### 验证

- `pnpm test src/server/auth/cookie-auth.test.ts src/server/runtime/native-context.test.ts src/server/http/backend-client.test.ts`：通过，3 files / 9 tests。
- `pnpm typecheck`：通过。
- `pnpm test`：通过，19 files / 89 tests。
- `pnpm build`：通过。

### 后续

- 原生 App 需要确认 `statusHeight` 单位是否为 CSS px。
- 原生 App 需要确认 `pythonToken` / `mallToken` 的 Cookie 属性。

## 2026-06-03 - 建立 H5 BFF HTTP 鉴权基础

### 变更

- 新增 `src/server/auth/cookie-auth.ts`，服务端读取原生 App 写入的 `meu_access_token` Cookie。
- 新增 `src/server/http/backend-registry.ts` 和 `backend-client.ts`，按环境选择 Java / Python 后端，并将 Cookie token 转为 `Authorization: Bearer <token>`。
- 新增 `src/lib/http/h5-client.ts`，浏览器端只请求自身 BFF，自动处理版本 basePath 和 `credentials: "include"`。
- 新增 `src/server/http/bff-response.ts` 和示例 route `src/app/api/bff/user/profile/route.ts`。
- 新增 `src/server/runtime/native-context.ts` 和 `/api/bff/runtime/context`，用于返回原生传参调试信息。
- 首页新增 `NativeRuntimePanel`，展示完整 Cookie 值、页面配置、URL 参数和 H5 环境信息；该面板仅限内部联调。
- 更新 API 文档，明确 SSR / BFF / CSR 调用边界。

### 验证

- 已先运行目标测试，确认新模块缺失导致失败。
- `pnpm test src/server/http/bff-response.test.ts src/server/auth/cookie-auth.test.ts src/server/http/backend-registry.test.ts src/server/http/backend-client.test.ts src/lib/http/h5-client.test.ts`：通过。
- `pnpm test src/server/runtime/native-context.test.ts`：通过。

## 2026-06-03 - 首页增加 Bridge 调试面板

### 变更

- 新增 `src/lib/bridge/protocol-bridge.ts`，实现统一信封 Bridge 调试 runtime。
- 首页新增 `Hybrid Bridge 调试` 面板，可测试 `getDeviceInfo`、`getTokens`、导航、token 失效、分享、logout 监听和模拟 logout。
- 更新 Native Bridge 文档，明确新旧 Bridge 入口并存，当前为调试链路，不代表原生真实业务能力完成。

### 验证

- 已先运行 `pnpm test src/lib/bridge/protocol-bridge.test.ts`，确认模块缺失导致测试失败。
- `pnpm test src/lib/bridge/protocol-bridge.test.ts`：通过。
- `pnpm typecheck`：通过。
- `pnpm build`：通过。
- 本地 H5 dev server `http://localhost:3109/hybird` 返回 200。

## 2026-06-03 - 同步 App 对接路由和 H5 版本标识

### 变更

- 删除 H5 旧兼容页面文件。
- 移除 H5 mock 入口中的智能体 H5 占位入口。
- 将右上角版本标识改为显式 DOM 节点，来源为 `H5_RELEASE_LABEL` 或 `H5_VERSION`。

### 验证

- `pnpm test -- src/lib/commerce/mock-data.test.ts`：通过。
- `pnpm typecheck`：通过。首次失败是 `.next` 缓存仍引用已删除页面，清理 `.next` 后通过。

## 2026-05-16 - 本地 Jenkins H5 构建链路修复

### 变更

- 修复本地 Jenkins `mac-studio` agent 离线问题，将 agent 接入 launchd 守护。
- 将 Jenkins Pipeline 调整为启动本机 detached 构建脚本，避免长时间 Docker 构建导致 remoting channel 不稳定。
- 为 `/Users/mac/person_code/meu-mall/meumall-ci/ops/hybird-local-deploy.sh` 增加本地 Git mirror 缓存：网络可用时刷新 GitHub，网络不可用时使用本地缓存继续构建。
- 将本地 Jenkins/CI 运行路径统一到 `/Users/mac/person_code/meu-mall/meumall-ci`，移除对旧软链接路径的运行时依赖。
- 为 launchd 启动的 Jenkins agent 固化代理环境，解决后台 GitHub 直连超时。
- release 注册改为通过 SSH tunnel 访问服务器本机 FastAPI，避免 CI 走公网 nginx 管理鉴权入口。
- H5 激活后的 smoke 检查增加重试等待，避免容器刚重启时短暂 502 导致 Jenkins 误判失败。
- 修复服务器 nginx 中 `/hybird` 与 `/hybird/` 的重定向循环，避免首页打开 `ERR_TOO_MANY_REDIRECTS`。
- 保留 Jenkins 参数化构建入口，可指定分支、版本、服务器地址、SSH key、是否注册 release 和是否激活部署。

### 验证

- Jenkins build #7 成功，版本 `2026.05.16-local-smoke-007`。
- Jenkins build #11 成功，版本 `2026.05.16-local-11`。
- 已完成 `pnpm install`、`pnpm build` 和 `pnpm run ai:prepare-standalone-assets`。
- 已完成 `pnpm test` 和 `pnpm typecheck`。
- 已上传 standalone SSR 产物到服务器 `/opt/meumall/releases/hybird/2026.05.16-local-11`。
- 已通过 SSH tunnel 注册 candidate release `2026.05.16-local-11`。
- 已激活远端 `/opt/meumall/current/hybird -> /opt/meumall/releases/hybird/2026.05.16-local-11`。
- 已验证公网 `http://118.196.24.12/hybird/api/health` 和 `/hybird/category` 可访问。
- 已验证 `http://118.196.24.12/hybird` 直接返回 200，`/hybird/` 只跳转一次后返回 200。

### 后续

- 长期生产化建议为 server-meumall 增加独立 CI token，替代 SSH tunnel 作为外部 CI 的 release 注册认证方式。

## 2026-05-16 - 本地多版本 H5 切换演练

### 变更

- H5 根布局新增 `H5_RELEASE_VARIANT` 和 `H5_RELEASE_LABEL` 支持，页面右上角展示可肉眼识别的版本标识。
- 全局样式新增 blue、green、rose 三套本地演练主题。
- 打包并启动三份 standalone SSR 服务：blue `3109`、green `3110`、rose `3111`。
- 在 `server-meumall` 中创建 `H5 BLUE/GREEN/ROSE 2026.05.16` 三份 manifest 配置，当前 active 恢复为 blue。
- iOS App 增加 manifest 刷新调试入口，便于 admin 切 active 后在 WebView 中立即重新拉取配置。

### 验证

- 已通过 `pnpm typecheck`、`pnpm lint`、`H5_BASE_PATH=/hybird pnpm build` 和 `pnpm run ai:prepare-standalone-assets`。
- 已验证 `3109/3110/3111` 三个 H5 SSR 服务均返回 200，并分别输出 `BLUE/GREEN/ROSE 2026.05.16` 标识。
- 已通过 server publish smoke：green active 切换成功后恢复 blue active。
- 已通过 iOS `Info.plist` / entitlements 校验和 `git diff --check`。

### 后续

- 真机调试时需要把 manifest URL 和各 H5 `serviceBaseUrl` 从 `127.0.0.1` 切换为 Mac 局域网 IP。

## 2026-05-15 - 修复 standalone SSR 静态资源 404

### 变更

- 定位 `/hybird/_next/static/chunks/0fhdp5vz98u_y.css` 404 根因：standalone 运行目录缺少 `.next/standalone/.next/static`。
- 新增 `ai:prepare-standalone-assets`，将 `.next/static` 和 `public` 复制到 `.next/standalone` 运行目录。
- 更新发布规范和 AI 工作流文档，明确直接运行 `.next/standalone/server.js` 前必须准备静态资源。

### 验证

- 已复制当前构建产物静态资源并重启 standalone SSR 服务。
- 已验证 CSS chunk、页面引用的前 10 个 `_next/static` 资源和 `/hybird/category` 均返回 200。
- 已通过 `pnpm run ai:prepare-standalone-assets`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- CI/CD 在部署 standalone 产物前应执行 `pnpm run ai:prepare-standalone-assets` 或在打包步骤中等价复制 `.next/static` 与 `public`。

## 2026-05-15 - 跑通本地配置中心闭环

### 变更

- 在 `server-meumall` 落地 Python FastAPI + SQLite manifest 配置中心，支持配置 CRUD、发布 active 和 H5 只读 active manifest。
- 在 `admin-meumall` 落地 Vite + React 配置发布后台，支持编辑 manifest JSON、保存、发布和删除。
- 修正 server seed manifest 和 admin 默认 manifest 为 hybird 当前 `ManifestFile` 对象结构，保证 `grayRules`、`routes`、`assets` 与 H5 schema 一致。
- 修正 admin 对 server snake_case 时间字段和 FastAPI `detail` 错误字段的兼容。

### 验证

- 已通过 `server-meumall` 的 `. .venv/bin/activate && pytest`。
- 已通过 `admin-meumall` 的 `pnpm test` 和 `pnpm build`。
- 已通过 `hybird-meumall` 的 `pnpm exec vitest run src/lib/manifest/server-fetcher.test.ts`、`pnpm typecheck` 和 `pnpm lint`。
- 已通过临时 SQLite 数据库的 HTTP smoke：读取 active manifest、创建 draft、发布 active、重新读取 active。
- 已启动本地联调服务：server `4100`、admin `5173`、hybird SSR `3109`，并验证 active manifest、admin 首页和 `/hybird/category` 均可访问。

### 后续

- 生产化时补充登录权限、审批流、审计日志、配置 diff 和生产数据库迁移。

## 2026-05-15 - 接入 server-meumall active manifest fetcher

### 变更

- 新增 `src/lib/manifest/server-fetcher.ts`，提供 `createHttpManifestFetcher()` 和默认 manifest URL 读取 helper。
- 新增 `src/lib/manifest/server-fetcher.test.ts`，覆盖成功拉取、非 2xx、JSON 解析失败和环境变量优先级。
- 更新 `.env.example`，增加 `NEXT_PUBLIC_H5_MANIFEST_URL` 和 `H5_MANIFEST_URL`，默认指向 server-meumall 本地 active manifest endpoint。
- 更新发布/API 文档、项目状态、TODO、变更记录和决策记录，明确 active manifest 由 server-meumall 提供。

### 验证

- 已先运行 `pnpm test -- src/lib/manifest/server-fetcher.test.ts` 确认新增测试因模块缺失失败。
- 已通过 `pnpm test -- src/lib/manifest/server-fetcher.test.ts`。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 使用真实 server-meumall 环境验证 active manifest endpoint、CORS 和 WebView 访问策略。

## 2026-05-15 - SSR 切流与回滚本地演练

### 变更

- 新增 `ai:resolve-manifest`，用于本地观察 manifest 在不同用户、路由和当前版本下的命中结果。
- 新增 `archives/releases/2026.05.15-switch-drill/`，包含 stable、gray、rollback 三份演练 manifest 和操作 README。
- 新增 `.ai/test-reports/2026-05-15-ssr-switch-rollback-drill.md`，记录切流和回滚验证过程。

### 验证

- 已通过本地 SSR 服务 `http://127.0.0.1:3109/hybird` 的 smoke 检查。
- stable manifest 命中 `2026.05.15-001`。
- gray manifest 中 `demo-gray` 命中 `2026.05.15-002`，`demo-stable` 留在 `2026.05.15-001`。
- rollback manifest 将当前异常版本 `2026.05.15-002` 切回 `2026.05.15-001`。

### 后续

- 真实 App 接入后，需要把 `ai:resolve-manifest` 对应的观察结果映射到 WebView 实际加载日志。

## 2026-05-15 - 收敛为 SSR-only 发布与回滚

### 变更

- 将 `ManifestFile.assets` 从静态 CDN 目录模型改为 SSR 服务模型：`serviceBaseUrl`、`basePath`、`staticAssetPath`、`healthCheckPath`。
- 更新 manifest runtime，远程路由 URL 由 SSR 服务地址和路由 path 拼接，不再拼版本目录。
- 更新 `ai:release-prepare`、`ai:update-manifest` 和 `ai:rollback`，发布与回滚只面向 SSR manifest。
- 新增 `config/ssr-release.config.example.json`、`ai:prepare-ssr-release` 和 `ai:smoke-ssr-release`。
- 新增 `/api/health` 健康检查接口。
- 删除默认配置面的 OSS 配置模板、OSS 配置测试、OSS release ops 测试和 OSS 发布脚本；`.env.example` 改为 SSR 服务变量。
- 更新 GitHub Actions、发布规范、架构、编码规则、AI 工作流、状态、TODO、变更记录和决策文档。

### 验证

- 已通过 `H5_BASE_PATH=/hybird pnpm build`，构建输出确认当前路由均为 `ƒ (Dynamic) server-rendered on demand`，且未生成 `out/`。
- 已通过 `ai:release-prepare` 生成 SSR manifest 草案。
- 已通过 `ai:prepare-ssr-release` 生成 SSR 发布计划。
- 已通过本地 standalone 服务和 `ai:smoke-ssr-release`，健康检查和 4 个核心页面 smoke 通过。
- 已通过 `pnpm test`、脚本 Vitest、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 需要接入真实 SSR 部署平台和 manifest active 发布审批。

## 2026-05-15 - 切回 Next.js SSR 发布模式

### 变更

- 更新 `next.config.ts`，移除静态导出，改为 `output: "standalone"` 的 SSR 构建。
- 更新 `src/app/layout.tsx` 和商品详情页，显式强制当前 App Router 路由动态渲染，并移除商品详情静态参数预生成。
- 更新 `package.json`，补充 `pnpm start`。
- 更新 `.github/workflows/h5-release.yml`，从 `out/` OSS 静态上传流水线改为 SSR standalone 产物归档流水线。
- 更新架构、发布规范、AI 工作流、项目状态、TODO、变更记录和决策文档，明确 OSS 静态上传只保留给静态包、fallback 或独立 CDN 静态资源。

### 验证

- 已通过 `rm -rf .next out && pnpm build && test -f .next/standalone/server.js && test -d .next/static && test ! -d out`，构建输出确认当前路由均为 `ƒ (Dynamic) server-rendered on demand`。
- 已通过 `PORT=3106 HOSTNAME=127.0.0.1 pnpm start` 启动本地 standalone 服务，并用 `curl -I` 验证 `/`、`/category`、`/product/p-1001` 均返回 `200 OK` 和 `text/html`。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 和 `git diff --check`。

### 后续

- 需要确认 SSR 部署平台、`H5_ORIGIN`、健康检查、日志采集和 active manifest 发布审批。

## 2026-05-15 - 完善 static smoke manifest 草案

### 变更

- 修正 `ai:release-prepare` 和 `ai:update-manifest` 的 assets 生成逻辑，避免 `cdnBaseUrl` 和 `immutablePathPattern` 重复包含 `/hybird/h5/prod`。
- 完善 `archives/releases/2026.05.15-static-smoke/manifest.draft.json`：
  - `cdnBaseUrl` 调整为 OSS 公网域名根。
  - 远程路由 `path` 指向真实静态导出对象，例如 `index.html`、`category/index.html`。
  - 补全 6 个商品详情静态路由。
  - 补全 `/offline`、`/not-found`、`/error`、`/maintenance` 本地 fallback 路由。
  - 补充灰度平台范围、最低 App 版本和远程 fallback URL。
- 更新 release note、build metadata、发布规范、变更记录和决策文档。
- 已重新生成 manifest 发布计划，并同步上传 candidate manifest，不覆盖 active `manifest.json`。

### 验证

- 已先运行 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts` 并确认旧 assets 生成逻辑导致测试失败。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`。
- 已通过 manifest 草案结构和 route URL 拼接检查。
- 已通过 `pnpm run ai:publish-oss-manifest ... --stage candidate --execute` 上传 2 个 candidate manifest 对象。
- 已通过公网读取 `manifest.candidate.json`，确认 `routeCount = 14` 且 `/` 拼接到 `.../index.html`。

### 后续

- active manifest 仍未覆盖，需发布审批后执行。
- OSS/CDN 强制下载响应头仍需在外部平台侧修复。

## 2026-05-15 - 补齐发布运维脚本和手动 CI/CD

### 变更

- 新增 `ai:smoke-oss-release`，读取 `oss-upload-plan.json` 后检查关键 HTML、CSS 和 JS 的公网可访问性、content-type、cache-control 和强制下载头。
- 新增 `ai:publish-oss-manifest`，生成 manifest candidate/active 发布计划，并支持显式 `--execute` 上传到 OSS。
- 新增 `ai:prepare-release-pointers`，生成 `latest/` 辅助指针计划，只覆盖 HTML、config 和 fallback，不镜像 `_next/static` 不可变资源。
- 新增 `ai:refresh-cdn`，生成 CDN 刷新计划，并可构造阿里云 CDN `RefreshObjectCaches` 签名请求。
- 新增 `.github/workflows/h5-release.yml` 手动发布流水线，串联质量检查、静态构建、OSS 上传、smoke、candidate manifest、latest 指针计划和 CDN 刷新计划。
- 为 release ops 增加 Vitest 回归测试。
- 已对 `2026.05.15-static-smoke` 生成 release pointer/CDN refresh/manifest publish 计划，并真实上传 candidate manifest。

### 验证

- 已先运行 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-ops.test.ts` 并确认新增脚本缺失导致失败。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-ops.test.ts`，5 个测试通过。
- 已通过 `pnpm run ai:smoke-oss-release --plan archives/releases/2026.05.15-static-smoke/oss-upload-plan.json --routes index.html,category/index.html --allow-force-download`，4 个关键资源返回 200。
- 严格 `ai:smoke-oss-release` 已验证会因当前 OSS 强制下载响应头失败，可作为 CI 阻断门禁。
- 已通过 `pnpm run ai:prepare-release-pointers ...` 和 `pnpm run ai:refresh-cdn ...` 生成计划。
- 已通过 `pnpm run ai:publish-oss-manifest ... --stage candidate --execute` 上传 2 个 manifest 对象。
- 已通过公网 `curl` 验证 `manifest.candidate.json` 返回 200 且内容可解析。
- 已通过 `pnpm test`、`pnpm typecheck` 和 `pnpm lint`。

### 后续

- 关闭 OSS/CDN 强制下载响应头后，CI smoke 可改为严格通过并阻断错误平台配置。
- 配置 GitHub Actions secrets、受保护环境和 CDN 刷新权限后，再执行远端 workflow。
- active manifest 覆盖仍需人工审批，不在本次自动执行。

## 2026-05-15 - 补构建静态产物并上传 OSS smoke 版本

### 变更

- 更新 `next.config.ts`，启用 `output: "export"`，并支持通过 `H5_BASE_PATH`、`H5_ASSET_PREFIX` 构建可部署到 OSS 版本目录的静态产物。
- 更新 `.env.example` 和 `config/oss.config.example.json`，使 `OSS_PUBLIC_BASE_URL`/`publicBaseUrl` 对齐 bucket 内目录 `/hybird/h5`。
- 更新 `ai:prepare-oss-release` 上传计划和 PutObject 元数据，记录并尝试写入 `contentDisposition: "inline"`。
- 重新构建 `out/` 并上传真实 OSS smoke 版本 `2026.05.15-static-smoke`。
- 更新发布规范、变更记录、决策文档和验证报告。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm run ai:prepare-oss-release --version 2026.05.15-static-smoke --environment prod --env-file .env.example --check-config`。
- 已通过带 `H5_BASE_PATH` 和 `H5_ASSET_PREFIX` 的 `pnpm build`。
- 已通过 `ai:prepare-oss-release --execute` 上传 112 个对象到 OSS。
- 已通过公网 `curl -I` 验证 `index.html`、`category/index.html` 和 `_next/static` JS 资源返回 200。
- 已验证远程 HTML 内容包含版本目录下的 `_next/static` 资源前缀和站内链接前缀。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint` 和 `pnpm run ai:check-workflow --strict`。

### 后续

- OSS 当前仍返回 `Content-Disposition: attachment` 和 `x-oss-force-download: true`，需要在 OSS bucket 或 CDN 侧关闭强制下载/覆盖响应头。
- 接入 CDN 刷新和正式 manifest 发布审批。

## 2026-05-15 - 落地版本发布与回滚基础机制

### 变更

- 新增客户端 manifest runtime，支持远程拉取、schema 校验、last-known-good 缓存、版本解析和路由加载结果。
- 统一 `ai:release-prepare`、`ai:update-manifest` 和 `ai:rollback` 输出/修改的 manifest 草案为 `ManifestFile` schema。
- 新增 `ai:prepare-oss-release`，基于 OSS 配置和本地构建目录生成 `oss-upload-plan.json`。
- 更新 `config/oss.config.example.json` 的 `remotePrefix` 为 `h5`，避免 OSS 对象路径重复环境名。
- 更新发布、架构、编码规则、AI 工作流、变更记录和决策文档。
- 新增 `.ai/tasks/2026-05-15-release-rollback-system-implementation.md`。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已通过 release prepare、prepare OSS release 和 rollback CLI 烟测。

### 后续

- 接入真实 OSS 上传、CDN 刷新和 manifest 发布审批。
- 明确 manifest 最终由原生 App、H5 runtime 或两者共同拉取。

## 2026-05-15 - 接入真实 OSS 平台参数体检

### 变更

- 为 `ai:prepare-oss-release` 增加 `--check-config` 参数体检模式。
- 为 `ai:prepare-oss-release` 增加 `--env-file` 支持，从 `.env.local` 或 `.env.example` 读取 OSS 参数并覆盖配置模板。
- 为 `ai:prepare-oss-release` 增加显式 `--execute` 真实 OSS PutObject 上传入口。
- 增加 OSS V1 Authorization Header 签名构造、STS token header 支持和 Cache-Control 对象元数据写入。
- 更新发布规范、AI 工作流、变更记录和 AI 状态文件。

### 验证

- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已运行 `pnpm run ai:prepare-oss-release --version 2026.05.15-verify --environment prod --env-file .env.example --check-config`。
- 当前体检结果：AK/SK 已可读取，但 `OSS_BUCKET`、`OSS_REGION`、`OSS_ENDPOINT` 和 `OSS_PUBLIC_BASE_URL`/CDN public base URL 仍缺真实值或仍为占位符。
- 已通过 `pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm build` 和 `pnpm run ai:check-workflow --strict`。

### 后续

- 补齐真实 OSS bucket、region、root endpoint 和 CDN public base URL 后，再执行 `--check-config`。
- 体检通过后，可使用 `--execute` 执行真实 OSS 上传。

## 2026-05-15 - 补充 OSS bucket 内目录配置

### 变更

- 更新 `config/oss.config.example.json`，新增 `ossDirectory: "/hybird"`。
- 更新 `config/oss-config.test.ts`，覆盖 OSS 配置模板 bucket 内目录字段。
- 更新 `docs/03_RELEASE_SPEC.md`、`docs/08_CHANGELOG.md`、`docs/09_DECISIONS.md` 和 AI 状态文件。

### 验证

- 已先运行 `pnpm test -- config/oss-config.test.ts` 并确认测试因缺少 `ossDirectory` 失败。
- 已通过 `pnpm test -- config/oss-config.test.ts`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续实现真实 OSS 上传脚本时，应继续区分 `ossDirectory`、`publicBaseUrl` 和 `remotePrefix`。

## 2026-05-15 - 接入 Git 提交信息规范检查

### 变更

- 新增 `commitlint.config.cjs`，采用 `@commitlint/config-conventional` 并允许中文提交描述。
- 新增 `.husky/commit-msg`，提交时自动执行 commitlint。
- 更新 `package.json`，增加 `prepare` 和 `lint:commit` 脚本。
- 更新 `docs/06_CODING_RULES.md`、`docs/07_AI_WORKFLOW.md` 和 `.ai/PROJECT_STATE.md`。

### 验证

- 已通过规范提交信息样例：`chore(git): 接入提交信息规范检查`。
- 已确认非规范提交信息样例会失败：`接入提交信息规范检查`。
- 已通过 `.husky/commit-msg` 正反向检查。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续可按需接入 commitizen 或 changelog 生成工具。

## 2026-05-15 - 实现模拟电商页面、静态缺省页与 OSS 配置模板

### 变更

- 新增本地电商 mock 数据和测试。
- 新增首页、分类页、商品详情页、购物车页和我的页。
- 新增电商共享组件：页面壳、底部导航、商品卡片和色块 icon 占位。
- 新增 `public/static/fallback/` 下的 offline、not-found、error、maintenance 静态 HTML。
- 新增 `config/oss.config.example.json` 和 `.env.example`。
- 更新发布、架构、编码规则和决策文档。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/lib/commerce/mock-data.test.ts config/oss-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm build`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已通过浏览器抽查 `/`、`/category`、`/product/p-1001`、`/cart`、`/profile` 和 `/static/fallback/offline.html`。

### 后续

- 后续可接入真实 icon、真实业务接口和 OSS 上传脚本。

## 2026-05-15 - 创建模拟电商页面与静态资源任务

### 变更

- 新增 `.ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md`。
- 更新 `.ai/TODO.md`，将模拟电商页面、静态缺省页与 OSS 配置模板加入 Active。

### 验证

- 任务创建阶段未修改业务实现。

### 后续

- 按任务计划实现模拟页面、静态缺省资源和 OSS 配置模板。

## 2026-05-15 - 实现监控、白屏检测与性能埋点基础

### 变更

- 新增 `src/lib/telemetry/types.ts`，定义错误、性能、白屏和通用埋点事件类型。
- 新增 `src/lib/telemetry/reporter.ts`，实现 `TelemetryReporter` interface、noop reporter 和 telemetry client。
- 新增 `src/lib/telemetry/white-screen.ts`，实现白屏采样评估纯函数。
- 新增 `src/lib/telemetry/performance.ts`，实现首屏性能事件构造。
- 新增 `src/lib/telemetry/index.ts`，统一导出 telemetry 模块边界。
- 新增 `src/lib/telemetry/telemetry.test.ts`，覆盖事件类型、noop reporter、client 上报、错误归一化、白屏阈值和首屏性能事件。
- 更新 `docs/01_ARCHITECTURE.md`、`docs/06_CODING_RULES.md` 和 `docs/09_DECISIONS.md`，记录 telemetry 边界、白屏策略和首版 noop reporter 决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/telemetry/telemetry.test.ts` 并确认测试因 `./index` 缺失失败。
- 已通过 `pnpm test -- src/lib/telemetry/telemetry.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 Sentry/埋点平台、白屏采样点、采样率和隐私脱敏策略。

## 2026-05-15 - 实现 API Client、鉴权与请求追踪

### 变更

- 新增 `src/lib/api/types.ts`，定义 `ApiResult<T>`、`ApiError`、`RequestMeta`、client 配置和请求选项。
- 新增 `src/lib/api/errors.ts`，实现统一 API 错误构造。
- 新增 `src/lib/api/client.ts`，实现 base URL 拼接、requestId/header 注入、Bridge token 来源、JSON 请求、超时和错误归一化。
- 更新 `src/lib/api/index.ts`，统一导出 API client、错误和类型。
- 新增 `src/lib/api/client.test.ts`，覆盖成功、base URL、requestId、Bridge token、token 缺失、鉴权失败、网络失败和超时。
- 更新 `docs/05_API_SPEC.md` 和 `docs/09_DECISIONS.md`，记录首版 API client 行为和架构决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/api/client.test.ts` 并确认测试因 `./client` 缺失失败。
- 已通过 `pnpm test -- src/lib/api/client.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm run ai:check-workflow --strict`。

### 后续

- 后续需确认真实 base URL、token 刷新、重新登录和原生代理策略。

## 2026-05-15 - 实现 Theme Runtime 与 Light/Dark 切换

### 变更

- 更新 `src/lib/theme/tokens.ts`，新增 light/dark 主题变量和变量 allowlist。
- 新增 `src/lib/theme/runtime.ts`，实现 `getThemeConfig`、`sanitizeThemeVariables` 和 `applyTheme`。
- 更新 `src/lib/theme/index.ts`，统一导出主题 runtime API。
- 更新 `src/styles/globals.css`，补充 `[data-theme="dark"]` CSS fallback。
- 新增 `src/lib/theme/runtime.test.ts`，覆盖 light、dark、fallback、allowlist 和变量应用。
- 更新 `docs/04_THEME_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/theme/runtime.test.ts` 并确认测试因 runtime API 缺失失败。
- 已通过 `pnpm test -- src/lib/theme/runtime.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 后续可补充品牌主题、远程主题拉取、用户偏好持久化和对比度检查。

## 2026-05-15 - 实现 Manifest Schema 与远程配置中心

### 变更

- 新增 `src/config/remote-config.ts`，定义 `ManifestFile`、`AppConfigFile`、`ThemeConfigFile` 和本地校验函数。
- 新增 `src/config/remote-config.test.ts`，覆盖合法 manifest、缺字段、版本黑名单、灰度配置、路由交付、敏感配置拒绝和 theme config。
- 更新 `docs/03_RELEASE_SPEC.md`，记录 manifest/app-config/theme-config 结构、三类版本、不可变资源目录、`latest` 指针和客户端非敏感配置边界。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/remote-config.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/remote-config.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 确认 manifest 托管、缓存、灰度归属，以及由 H5 还是原生负责拉取 manifest。

## 2026-05-15 - 实现 Native Bridge 协议与 Web Mock

### 变更

- 新增 `src/lib/bridge/types.ts`，定义首批 Bridge 方法、请求/响应类型、`BridgeResult<T>` 和 `BridgeError`。
- 新增 `src/lib/bridge/errors.ts`，统一 Bridge 错误构造。
- 新增 `src/lib/bridge/web-mock.ts`，提供 Web mock adapter。
- 新增 `src/lib/bridge/native-adapter.ts`，封装 `window.MeumallNativeBridge.call`。
- 更新 `src/lib/bridge/index.ts`，导出 `nativeBridge`、adapter factory、类型和默认边界信息。
- 新增 `src/lib/bridge/bridge.test.ts`，覆盖 Web mock、方法不存在、Bridge 不可用、超时、原生异常和 window adapter。
- 更新 `docs/02_NATIVE_BRIDGE_SPEC.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/lib/bridge/bridge.test.ts` 并确认测试因能力缺失失败。
- 已通过 `pnpm test -- src/lib/bridge/bridge.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 与原生团队确认最终 namespace、通信协议和首批方法最低 App 版本。

## 2026-05-15 - 创建第一批运行时基础能力任务

### 变更

- 新增 `.ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md`。
- 新增 `.ai/tasks/2026-05-15-manifest-schema-and-remote-config.md`。
- 新增 `.ai/tasks/2026-05-15-theme-runtime-light-dark.md`。
- 新增 `.ai/tasks/2026-05-15-api-client-auth-tracing.md`。
- 新增 `.ai/tasks/2026-05-15-telemetry-white-screen-performance.md`。
- 更新 `.ai/TODO.md`，将第一批基础能力任务加入 Active，并将静态包、离线兜底、业务目录和 UI 组件库事项放入 Backlog。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 逐个使用 `task-plan` 为第一批任务制定实现计划。

## 2026-05-15 - 实现 Root Manifest Resolver

### 变更

- 新增 `src/config/manifest.ts`，导出 `RootManifest`、`GrayRules`、`ResolveH5VersionContext` 和 `resolveH5Version(ctx, manifest)`。
- 新增 `src/config/manifest.test.ts`，覆盖 stable、gray、force、blacklist、rollback 和 fallback 行为。
- 更新 `docs/03_RELEASE_SPEC.md`，记录本地版本解析优先级和 fallback 规则。
- 更新 `docs/09_DECISIONS.md`，记录 Root Manifest 本地版本解析优先级决策。
- 更新 `.ai/PROJECT_STATE.md`、`.ai/TODO.md` 和 `docs/08_CHANGELOG.md`。

### 验证

- 已先运行 `pnpm test -- src/config/manifest.test.ts` 并确认测试因模块缺失失败。
- 已通过 `pnpm test -- src/config/manifest.test.ts`。
- 已通过 `pnpm test`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。

### 后续

- 补充 manifest schema 校验任务，统一字段名和发布平台结构。

## 2026-05-15 - 实现 H5 基础工程架构

### 变更

- 初始化 Next.js App Router、React、TypeScript、Tailwind CSS、pnpm 和 Vitest 工程骨架。
- 新增 `src/app` 最小 App Shell、`src/styles/globals.css` 默认主题变量和 `src/lib/*` 运行时模块边界。
- 新增 Tailwind、PostCSS、Vitest、ESLint、TypeScript 和 Next.js 配置。
- 新增 `.gitignore` 和 `pnpm-lock.yaml`。
- 更新架构、主题、编码规则、AI 工作流、变更记录、决策记录和项目状态。

### 验证

- 已通过 `pnpm install --frozen-lockfile`。
- 已通过 `pnpm build`。
- 已通过 `pnpm typecheck`。
- 已通过 `pnpm lint`。
- 已通过 `pnpm test`。
- 已通过 `pnpm run ai:check-workflow --strict`。
- 已启动 `pnpm dev`，并通过 `curl -I http://localhost:3000` 确认返回 200。

### 后续

- 使用 `task-test` 和 `task-review` 完成任务验证与审查记录后归档。

## 2026-05-15 - 规划 H5 基础工程架构任务

### 变更

- 更新 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`，补充 `## 计划` 章节。
- 明确基础工程架构任务的影响范围、文件影响、实施步骤、验证计划、风险和待确认问题。

### 验证

- 计划阶段未修改业务代码或工程实现。

### 后续

- 使用 `task-implement` 按计划初始化 Next.js App Router、pnpm、Tailwind 和 Vitest 工程骨架。

## 2026-05-15 - 创建 H5 基础工程架构任务

### 变更

- 新增 `.ai/tasks/2026-05-15-h5-foundation-architecture.md`。
- 将 H5 基础工程架构任务加入 `.ai/TODO.md`。
- 记录已确认技术选型：Next.js App Router、pnpm、Vitest。

### 验证

- 仅创建任务文档和 TODO 记录，未修改业务代码或实现文件。

### 后续

- 使用 `task-plan` 为 H5 基础工程架构任务制定实现计划。

## 2026-05-15 - 完善 AI 工作流自动化

### 变更

- 新增 `scripts/ai/check-workflow.ts`。
- 新增 `scripts/ai/plan-task.ts`、`scripts/ai/test-task.ts`、`scripts/ai/review-task.ts`。
- 新增 `scripts/ai/release-prepare.ts`，可一次性生成发布草案三件套。
- 增强 `scripts/ai/archive-task.ts`，要求验证和审查通过且验收项完成后才能归档。
- 更新 `package.json`，补充新增 `ai:*` 命令。
- 更新 `docs/07_AI_WORKFLOW.md`，补充完整任务闭环和辅助脚本说明。
- 更新 `.ai/PROJECT_STATE.md` 和 `.ai/TODO.md`。

### 验证

- 已通过 `node` 源码语法解析检查所有 `scripts/ai/*.ts`。
- 已通过 `npm run ai:check-docs-sync -- --strict`。
- 已通过 `npm run ai:check-workflow -- --strict`。
- 已通过新增脚本 help 检查。
- 已通过 `ai:release-prepare` 本地烟测，生成 `build.json`、`release-note.md`、`manifest.draft.json`。
- 已验证 `ai:archive-task` 在验证状态非 passed 时非 0 退出。
- 已通过 `ai:test-task` 和 `ai:review-task` 生成本任务验证/审查记录。

### 后续

- 选择正式业务测试运行器，并在 Next.js 项目初始化后接入。

## 2026-05-15 - 创建 AI 工作流完善与演练任务

### 变更

- 新增 `.ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md`。
- 将 AI 工作流自动化完善任务加入 `.ai/TODO.md`。

### 验证

- 作为本轮完整工作流演练的起点，后续会在任务内记录验证和归档结果。

### 后续

- 按任务计划实现并归档本任务。

## 2026-05-15 - 升级 task-create 为对话式任务创建

### 变更

- 更新 `.codex/skills/task-create/SKILL.md`。
- 明确自然语言输入时先多轮澄清，不立即落盘。
- 增加任务草案确认流程。
- 增加“可以落盘 / 不能落盘”的判断规则。
- 增加对话式示例。

### 验证

- 已检查 `task-create` Skill 包含对话式流程、确认后落盘规则和示例。
- 已运行 `npm run ai:check-docs-sync -- --strict`。

### 后续

- 后续使用 `task-create` 时，应先汇总草案并等待用户确认。

## 2026-05-15 - 中文化协作文档

### 变更

- 将 `AGENTS.md` 和 `docs/*.md` 转换为中文。
- 将 `.ai/*.md` 和当前任务文件转换为中文。
- 将项目级 Codex Skills 转换为中文。
- 保留代码标识符、文件名、命令名、类型名和 JSON 字段英文。

### 验证

- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已运行代表性脚本 `--help` 检查，确认输出中文用法。
- 已完成所有 `scripts/ai/*.ts` 源码语法解析检查。
- 已验证 `generate-diff-summary` 生成中文模板。
- 已验证 `create-task` 缺参时非 0 退出并输出中文错误。

### 后续

- 后续新增协作文档默认使用中文。

## 2026-05-15 - 创建 Root Manifest Resolver 任务

### 变更

- 添加 `.ai/tasks/2026-05-15-root-manifest-version-resolver.md`，用于后续实现 Root Manifest 类型和版本解析函数。
- 将 manifest resolver 任务加入 `.ai/TODO.md`。

### 验证

- 仅创建任务文档，未修改业务代码或实现文件。

### 后续

- 实现前先运行 `task-plan`。

## 2026-05-15 - 添加 AI 辅助脚本骨架

### 变更

- 添加 `scripts/ai/` 下的最小可运行 CLI 脚本。
- 添加共享工具文件 `scripts/ai/_utils.ts`。
- 添加包含 `ai:*` 命令的 `package.json`。

### 验证

- 已运行所有 8 个脚本的 `--help`。
- 已运行 `npm run ai:check-docs-sync -- --strict`。
- 已在 `/tmp` 目录完成 diff summary、build JSON、manifest draft、rollback draft 烟测。
- 已确认非法参数会非 0 退出。

### 后续

- 选择测试运行器后添加正式测试。

## 2026-05-15 - 添加项目级 Codex Skills

### 变更

- 添加 `.codex/skills/` 下的任务生命周期、发布准备和回滚 Skills。
- 定义每个 Skill 的输入、步骤和输出。

### 验证

- 已确认 8 个 `SKILL.md` 存在。
- 已确认每个 Skill 包含必需工作流章节。

### 后续

- 用一个示例任务验证 Skills。

## 2026-05-15 - 初始化 AI 工作流文档

### 变更

- 添加项目级 `AGENTS.md`。
- 添加 Hybrid App H5 架构、Bridge、发布、主题、API、编码、AI 工作流、变更记录和决策文档。
- 添加 AI 状态文件和归档目录。

### 验证

- 文档脚手架创建完成。

### 后续

- 确认 Bridge、manifest、主题和静态打包细节。
## 2026-05-15 - 归档任务 2026-05-15-ai-workflow-hardening-and-rehearsal.md

### 变更

- 已将 .ai/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md 归档到 archives/tasks/2026-05-15-ai-workflow-hardening-and-rehearsal.md。

### 验证

- 语法检查、docs sync、workflow check、release-prepare 烟测、archive-task 失败路径、task-test 和 task-review 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-h5-foundation-architecture.md

### 变更

- 已将 .ai/tasks/2026-05-15-h5-foundation-architecture.md 归档到 archives/tasks/2026-05-15-h5-foundation-architecture.md。

### 验证

- pnpm install --frozen-lockfile、pnpm build、pnpm typecheck、pnpm lint、pnpm test、pnpm run ai:check-workflow --strict、dev server 200 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-root-manifest-version-resolver.md

### 变更

- 已将 .ai/tasks/2026-05-15-root-manifest-version-resolver.md 归档到 archives/tasks/2026-05-15-root-manifest-version-resolver.md。

### 验证

- pnpm test -- src/config/manifest.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-native-bridge-adapter-and-web-mock.md

### 变更

- 已将 .ai/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md 归档到 archives/tasks/2026-05-15-native-bridge-adapter-and-web-mock.md。

### 验证

- pnpm test -- src/lib/bridge/bridge.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-manifest-schema-and-remote-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-manifest-schema-and-remote-config.md 归档到 archives/tasks/2026-05-15-manifest-schema-and-remote-config.md。

### 验证

- pnpm test -- src/config/remote-config.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-theme-runtime-light-dark.md

### 变更

- 已将 .ai/tasks/2026-05-15-theme-runtime-light-dark.md 归档到 archives/tasks/2026-05-15-theme-runtime-light-dark.md。

### 验证

- pnpm test -- src/lib/theme/runtime.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-api-client-auth-tracing.md

### 变更

- 已将 .ai/tasks/2026-05-15-api-client-auth-tracing.md 归档到 archives/tasks/2026-05-15-api-client-auth-tracing.md。

### 验证

- pnpm test -- src/lib/api/client.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-telemetry-white-screen-performance.md

### 变更

- 已将 .ai/tasks/2026-05-15-telemetry-white-screen-performance.md 归档到 archives/tasks/2026-05-15-telemetry-white-screen-performance.md。

### 验证

- pnpm test -- src/lib/telemetry/telemetry.test.ts、pnpm test、pnpm typecheck、pnpm lint、pnpm run ai:check-workflow --strict 均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-commerce-mock-pages-static-fallback-oss-config.md

### 变更

- 已将 .ai/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md 归档到 archives/tasks/2026-05-15-commerce-mock-pages-static-fallback-oss-config.md。

### 验证

- pnpm test、pnpm typecheck、pnpm lint、pnpm build、pnpm run ai:check-workflow --strict 和浏览器抽查均通过

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-release-rollback-system-implementation.md

### 变更

- 已将 .ai/tasks/2026-05-15-release-rollback-system-implementation.md 归档到 archives/tasks/2026-05-15-release-rollback-system-implementation.md。

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-release-cli-smoke-passed

### 后续

- 暂无。
## 2026-05-15 - 归档任务 2026-05-15-real-oss-platform-integration.md

### 变更

- 已将 .ai/tasks/2026-05-15-real-oss-platform-integration.md 归档到 archives/tasks/2026-05-15-real-oss-platform-integration.md。

### 验证

- pnpm-test-typecheck-lint-build-workflow-and-oss-config-check-passed

### 后续

- 暂无。
## 2026-05-16 - 本地发布 2026.05.16-003

### 变更

- 启动 server-meumall、admin-meumall 和 H5 SSR 新版本服务。
- 生成 `archives/releases/2026.05.16-003/` 发布草案、SSR 发布计划和验证记录。
- 将 `2026.05.16-003` 注册为 candidate release，并发布为 prod active。

### 验证

- `GET /api/health`、admin 首页和 H5 `/hybird/category` 均返回 200。
- `pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.16-003/ssr-release-plan.json` 通过。
- active manifest 已指向 `http://127.0.0.1:3112/hybird/category`。

### 后续

- iOS Simulator 点击“刷新配置”后可看到 `NEW 2026.05.16-003` 绿色标识。

## 2026-05-16 - 落地正式发版入口

### 变更

- 新增 `scripts/ai/register-release.ts` 和 `ai:register-release`，支持生成 release 注册草案，并在 `--execute` 时提交到 server-meumall。
- 更新 `.github/workflows/h5-release.yml`，增加可选 `register_release` 输入和 candidate release 注册步骤。
- 扩展 server-meumall release API，支持 CI 参数式注册、完整 manifest 注册、发布 active、设置灰度和回滚。
- 扩展 admin-meumall 正式发版操作区，展示 release 列表并支持发布、灰度和回滚。
- 更新发布规范、AI 工作流、server/admin README 和项目状态记录。

### 验证

- server-meumall：`. .venv/bin/activate && pytest` 通过，10 tests。
- admin-meumall：`pnpm test && pnpm build` 通过。
- hybird-meumall：`pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`、`pnpm test`、`pnpm typecheck`、`pnpm lint`、`pnpm run ai:check-workflow --strict` 均通过。
- 本地 HTTP smoke：`ai:register-release --execute` 成功注册 candidate，随后通过 release API 完成 promote、gray 和 rollback，active manifest 指针符合预期。

### 后续

- 在真实 CI 中配置 `H5_RELEASE_SERVER_URL` 并验证受保护环境注册链路。

## 2026-06-04 - 建立 H5 顶部导航公共组件

### 变更

- 新增状态栏高度 CSS 变量体系，根布局基于 `statusHeight` 注入 `--meu-status-bar-height`、`--meu-nav-height` 和 `--meu-top-bar-height`。
- 新增 `TopNavigation`、`StandardNavPage`、`TransparentNavPage` 和 `TransparentActionNavPage`，统一常规白底导航、透明返回导航和透明右侧操作导航。
- 推广模块活动中心、榜单中心、榜单详情和权益中心接入公共导航组件，移除旧 `PromotionNav`。
- 收敛排行榜底部固定浮层到 H5 最大宽度容器，并移除迁移过程中保留的历史投影样式。
- 更新推广页面开发总则、编码规则和顶部导航设计规格。

### 验证

- `pnpm exec vitest run src/design-system/components/navigation.test.tsx` 通过。
- `pnpm typecheck` 通过。

### 后续

- 后续新增 H5 页面优先复用页面导航预设；如出现滚动变色、搜索栏或多操作区，再在 design-system 中扩展导航变体。

## 2026-06-11 - 补充 BFF 后端请求快照日志

### 变更

- 新增 `JAVA_OSS_ASSET_BASE_URL` 环境变量，三套 H5 profile 当前均配置为 `https://awu-mall-file.oss-cn-guangzhou.aliyuncs.com/`。
- 首页真实接口 mapper 对 Java 返回的相对图片路径拼接 OSS base URL；完整 `http(s)` 图片 URL 原样保留。
- `[h5-bff-backend-call]` 增加 `requestUrl`、`requestQuery`、`requestBody` 和 `requestHeaders`，用于联调查看 Java / Python 出站请求。
- `[h5-bff-backend-call]` 增加可开关的 `responseBody`、`responseBodySize`、`responseBodyTruncated`，用于本地/测试查看 Java 原始响应。
- `Authorization`、Cookie、token 和 secret 类字段统一掩码，只保留格式、首尾片段和长度。
- response body 日志会对 token、mobile、phone、address 等字段掩码，并按 `H5_BFF_BACKEND_RESPONSE_LOG_LIMIT` 截断。
- 按 Java 联调结果修正后端鉴权 header：Java / mall 使用裸 `Authorization: <mallToken>`，Python 继续使用 `Authorization: Bearer <pythonToken>`。
- 整合 Java `ResponseEnum` 启用码表，新增 `java-response-codes` 映射；`A00004` 转 `AUTH_FAILED`，`A00005` 转 `HTTP_ERROR`。
- 首页真实接口服务在首页聚合接口业务鉴权失败时停止后续推荐商品请求。
- 更新 API 规范中的 BFF 日志排查说明。

### 验证

- `pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts` 通过，4 files / 23 tests。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过，存在 4 条历史 `<img>` warning，无 error。

### 后续

- 用有效 `mallToken` 重新触发 `/api/bff/home`，根据 `requestHeaders.Authorization` 的格式和长度继续定位 Java 鉴权失败原因。

## 2026-06-24 - 首页分类联调口径修正

### 变更

- 通过 Apifox `main` 分支确认 `/p/app/home/index` 中 `hotCategory` 为喵呜热榜 TOP3 预览，`categoryTop8` 为首页普通分类来源。
- 首页 mapper 调整为：`hotCategory` 固定放首页分类第一位，点击 `/search/ranking`；`categoryTop8` 从第二位开始填充，分类入口最多 10 个。
- 更新首页 API 契约、对接 brief、任务记录和项目状态，避免后续恢复上下文时误认为首页分类只来自 `categoryTop8`。

### 验证

- `pnpm test src/features/home/home-real-api.test.ts` 通过，1 file / 12 tests。
- `pnpm typecheck` 通过。

### 后续

- App 注入有效 `mallToken` 后，继续用真实响应验证首页分类首位、普通分类顺序和点击跳转。

## 2026-06-24 - 秒杀和推广商品真实分页联调

### 变更

- 通过 Apifox `main` 分支确认「首页秒杀商品分页」为 Java `GET /p/app/home/seckillProds`。
- 通过 Apifox `main` 分支确认「推广商品页分页列表」为 Java `GET /p/distribution/prod/productPage`。
- 新增 H5 BFF：`/api/bff/seckill/products` 和 `/api/bff/promotion/products`。
- `/seckill` 接入真实秒杀商品分页，展示商品图、价格、原价、销量、库存、限购和剩余时间；商品卡和秒杀按钮进入 `/product/<prodId>`。
- `/promotion/products` 接入真实推广商品分页，支持商品名搜索和销量/价格/佣金排序参数；商品卡进入 `/product/<prodId>`。
- 推广商品分享 payload 从临时固定 `productId=1001` 改为真实商品 `prodId`。
- 链调阶段移除两个页面的本地 mock fallback；接口失败或无可用记录时展示空态或可恢复加载状态。

### 验证

- `pnpm test src/features/seckill/seckill.test.tsx src/features/promotion/promotion-products.test.tsx` 通过，2 files / 15 tests。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

### 后续

- 用 App 注入有效 `mallToken` 做真实环境联调，确认 Java 返回字段、图片、分页和分享 payload。

## 2026-06-27 - 退货退款独立页面修正

### 变更

- 将退货退款从 `/orders?status=refund` 订单 tab 中拆出为独立 `/refunds` 页面。
- 新增 `/refunds/[refundSn]` 退款详情路由；旧 `/orders/refunds/[refundSn]` 保留兼容重定向。
- `/orders?status=refund` 服务端重定向到 `/refunds`，避免历史入口进入普通订单页。
- 我的页真实 mapper 和 mock 入口均改为 `/refunds`。
- 普通订单页只保留全部、待付款、待发货、待收货、已完成五个状态。
- 订单详情页“查看物流”从 no-op 改为滚动到详情页物流信息区；独立物流详情页仍后置。
- 更新 H5 文档、根级页面清单、任务、对接说明、API 契约，并同步飞书知识库。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/features/mine-secondary/orders-real-service.test.ts src/features/mine-secondary/orders-api.test.ts` 通过，3 files / 12 tests。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- HTTP 冒烟：`/hybird/refunds` 200，`/hybird/refunds/RF20260627001` 200，`/hybird/orders?status=refund` 307 到 `/hybird/refunds`。

### 后续

- 评价、发票、退款申请、退款撤销、平台介入、修改退款金额、填写退货物流和独立物流详情页仍为后置范围。

## 2026-06-27 - 我的收藏和我的足迹真实接口迁移

### 变更

- 新增收藏/足迹真实接口契约、对接说明和工作项。
- 新增 `collections-real-service`，复刻旧 uni-app 收藏商品、取消收藏、足迹列表和删除足迹接口参数。
- 新增 `/api/bff/favorites/products`、`/api/bff/favorites/products/cancel`、`/api/bff/footprints`、`/api/bff/footprints/delete`。
- `/favorites/products` 和 `/footprints` 改为真实 BFF 数据源，移除本地 mock 兜底，保留编辑态选择、全选和确认删除。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/collections-real-service.test.ts src/features/mine-secondary/collections-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx` 通过。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- HTTP 冒烟：`/hybird/favorites/products` 200，`/hybird/footprints` 200。
- 飞书知识库已同步：页面清单 revision 38，API/BFF 对接说明 revision 10。

### 后续

- 用 App 注入的真实 `mallToken` 联调收藏/足迹列表和删除动作。

## 2026-06-30 - 钱包和银行卡真实接口联调

### 变更

- 新增根级工作项、对接说明和 API 契约，记录 Apifox main 分支钱包、推广订单、银行卡查询和解绑接口。
- 新增 `/api/bff/wallet`、`/api/bff/wallet/bank-cards` 和 `/api/bff/wallet/bank-cards/unbind`。
- `/wallet` 改为真实 BFF 数据源，按 Figma 更新余额卡、账户/银行卡入口、结算 tab 和推广订单列表；联调阶段不回退 mock。
- 新增 `/wallet/bank-cards` 银行卡管理页，支持已绑卡列表、无卡态和解绑确认弹窗。

### 验证

- `pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx` 通过，3 files / 15 tests。
- `pnpm typecheck` 通过。
- `curl -I http://localhost:3109/hybird/wallet` 返回 200。
- `curl -I http://localhost:3109/hybird/wallet/bank-cards` 返回 200。
- Playwright + 本机 Chrome 拦截 BFF 成功态截图验证钱包、银行卡列表和解绑弹窗，375 宽度无横向溢出。

### 后续

- 用 App 注入的真实 `mallToken` 和 `userInfo` Cookie 联调 Java 返回数据，重点确认推广订单 `userId=userInfo.phone` 和解绑银行卡 `signNum` 取值。
