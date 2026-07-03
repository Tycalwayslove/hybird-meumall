# 2026-06-29 收银台真实支付发起验证记录

## 范围

- `/api/bff/order-pay-info` 读取订单支付信息、支付开关和 `paySettlementType`。
- `/api/bff/order-pay` 调 Java `/p/order/pay` 并按普通 App SDK / 通联支付分流。
- `paySettlementType=1 + payType=8` 时，`/api/bff/order-pay` 将通联微信 `result=0 + chnlFrontParamInfo` 映射为 `paymentStartWechat` 的 `paymentMode=allinpay-mini-program-bridge` payload，并把解析后的 `chnlFrontParamInfo` 对象传给原生。
- `paySettlementType=1 + payType=7` 时，`/api/bff/order-pay` 将通联支付宝映射为 `paymentStartAlipay + paymentMode=allinpay-url + paymentUrl`，并继续透传完整 `sdkPayload`。
- `/api/bff/allinpay-order-status` 回查通联支付状态。
- `/pay-way` 按渠道调用 `rpc/paymentStartAlipay` / `rpc/paymentStartWechat`，旧 App 返回 `unsupported` 时 fallback 到 `rpc/paymentStartCashier`，发起后进入 `/pay-result`。
- `/pay-result` 展示成功、失败、待确认、重试付款和查看订单。
- 2026-07-02 追加：新增 `/api/bff/order-is-paid` 对接 Java `/p/order/isPay/{payEntry}/{orderNumbers}`，支付结果页固定 `payEntry=0` 按订单号查询是否已支付；订单确认进入收银台、收银台进入支付结果页均使用 `replace`。

## 验证命令

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`
- `pnpm typecheck`
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`
- 2026-06-30 追加：同上三条命令，用于验证微信默认 payType 和 `sdkPayload` Bridge 字段。
- 2026-06-30 追加：同上三条命令，用于验证 `/pay-way` 收银台视觉优化未破坏支付发起、支付结果跳转和 Bridge payload。
- 2026-06-30 追加：同上三条命令，用于验证 `/p/order/pay` 专属日志和 local/test `debugRaw.orderPayRequest` 调试字段。
- 2026-06-30 追加：同上三条命令，用于验证通联微信 `paymentMode=wechat-mini-program`、`chnlFrontParamInfo`、`miniProgram.originalId/path` 和 `provider=allinpay` Bridge payload；该链路口径已于 2026-07-01 修正为喵呜小程序支付桥。
- 2026-06-30 追加：同上三条命令，用于验证支付 RPC `sdkPayload` 透传 Java `/p/order/pay` 完整 `data`。
- 2026-07-01 追加：同上三条命令，用于验证无点 action `paymentStartCashier`、`paymentMode=allinpay-mini-program-bridge`、喵呜小程序支付桥 `miniProgram.appId/path/extraData`。
- 2026-07-02 追加：`pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`。
- 2026-07-02 追加：`pnpm typecheck`。
- 2026-07-02 追加：`pnpm exec eslint src/features/payment src/features/product/components/OrderConfirmScreen.tsx src/app/api/bff/order-is-paid/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/app/api/bff/order-pay/route.ts src/app/pay-result/page.tsx src/app/pay-way/page.tsx src/lib/bridge/protocol-bridge.ts`。
- 2026-07-02 追加：`pnpm run ai:check-docs-sync --strict`。
- 2026-07-02 追加：根目录 `git diff --check`。
- 2026-07-03 追加：同上聚焦测试、`pnpm typecheck`、支付相关 ESLint、`pnpm run ai:check-docs-sync --strict` 和根目录 `git diff --check`，用于验证支付宝/微信专属 Bridge action、旧 action fallback、通联支付宝 `allinpay-url` 和通联微信小程序收银台 payload。

## 结果

- 通过，支付聚焦测试 2 files / 16 tests。
- 通过，TypeScript `tsc --noEmit` 无错误。
- 通过，支付相关 ESLint 无错误。
- 2026-06-30 追加：通过，支付聚焦测试 2 files / 18 tests；新增覆盖微信可用时默认 `payType=8`，以及 Java `/p/order/pay` body 原样提交 `payType: 8`。
- 2026-06-30 追加：通过，TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：收银台视觉优化后通过，支付聚焦测试 2 files / 18 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：支付调试日志增强后通过，支付聚焦测试 2 files / 18 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：通联微信 Bridge payload 验证通过，支付聚焦测试 2 files / 19 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过。
- 2026-06-30 追加：支付 RPC `sdkPayload` 完整透传和 `chnlFrontParamInfo` 解析传参验证通过，支付聚焦测试 2 files / 21 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过。
- 2026-07-01 追加：`paymentStartCashier` 无点 action 和喵呜小程序支付桥 payload 验证通过，支付聚焦测试 2 files / 21 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过。
- 2026-07-02 追加：订单号支付状态回查、`replace` 路由和结果页双按钮验证通过，支付聚焦测试 2 files / 23 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过；`git diff --check` 通过。
- 2026-07-03 追加：支付宝/微信专属 Bridge action 验证通过，支付聚焦测试 2 files / 23 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过；根目录 `git diff --check` 通过；飞书同步已完成，原生对接说明 revision 132，BFF/API 对接说明 revision 28，页面清单 revision 68。

## 剩余风险

- 需要 App 注入真实 `mallToken` 和真实待支付订单验证 Java 环境返回字段。
- `rpc/paymentStartAlipay` / `rpc/paymentStartWechat` 需要 iOS / Android 接入正式支付宝/微信 SDK handler；旧 `rpc/paymentStartCashier` 仅作为兼容 fallback。
- `paymentStartWechat` 在 `paymentMode=allinpay-mini-program-bridge` 时，需要原生按 `sdkPayload/chnlFrontParamInfo` 直开通联小程序收银台。
- 通联微信支付打开成功、取消、失败和结果未知的原生回调口径仍需真机联调确认。
