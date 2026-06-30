# 2026-06-29 收银台真实支付发起验证记录

## 范围

- `/api/bff/order-pay-info` 读取订单支付信息、支付开关和 `paySettlementType`。
- `/api/bff/order-pay` 调 Java `/p/order/pay` 并按普通 App SDK / 通联支付分流。
- `paySettlementType=1 + payType=8` 时，`/api/bff/order-pay` 将通联微信支付字段归一化为 `payment.pay` 的 `paymentMode=wechat-mini-program` payload。
- `/api/bff/allinpay-order-status` 回查通联支付状态。
- `/pay-way` 调用 `rpc/payment.pay` / `rpc/payment.openUrl` 并进入 `/pay-result`。
- `/pay-result` 展示成功、失败、待确认、重试付款和查看订单。

## 验证命令

- `pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx src/lib/bridge/protocol-bridge.test.ts`
- `pnpm typecheck`
- `pnpm exec eslint src/features/payment src/app/pay-way/page.tsx src/app/pay-result/page.tsx src/app/api/bff/order-pay/route.ts src/app/api/bff/allinpay-order-status/route.ts src/app/api/bff/order-pay-info/route.ts src/lib/bridge/protocol-bridge.ts`
- 2026-06-30 追加：同上三条命令，用于验证微信默认 payType 和 `sdkPayload` Bridge 字段。
- 2026-06-30 追加：同上三条命令，用于验证 `/pay-way` 收银台视觉优化未破坏支付发起、支付结果跳转和 Bridge payload。
- 2026-06-30 追加：同上三条命令，用于验证 `/p/order/pay` 专属日志和 local/test `debugRaw.orderPayRequest` 调试字段。
- 2026-06-30 追加：同上三条命令，用于验证通联微信 `paymentMode=wechat-mini-program`、`miniProgram.originalId/path` 和 `provider=allinpay` Bridge payload。

## 结果

- 通过，支付聚焦测试 2 files / 16 tests。
- 通过，TypeScript `tsc --noEmit` 无错误。
- 通过，支付相关 ESLint 无错误。
- 2026-06-30 追加：通过，支付聚焦测试 2 files / 18 tests；新增覆盖微信可用时默认 `payType=8`，以及 Java `/p/order/pay` body 原样提交 `payType: 8`。
- 2026-06-30 追加：通过，TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：收银台视觉优化后通过，支付聚焦测试 2 files / 18 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：支付调试日志增强后通过，支付聚焦测试 2 files / 18 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误。
- 2026-06-30 追加：通联微信 Bridge payload 验证通过，支付聚焦测试 2 files / 19 tests；TypeScript `tsc --noEmit` 无错误；支付相关 ESLint 无错误；H5 文档同步检查通过。

## 剩余风险

- 需要 App 注入真实 `mallToken` 和真实待支付订单验证 Java 环境返回字段。
- `rpc/payment.pay` 需要 iOS / Android 接入正式支付宝/微信 SDK handler，以及 `paymentMode=wechat-mini-program` 的微信 OpenSDK 小程序拉起逻辑。
- 通联微信支付打开成功、取消、失败和结果未知的原生回调口径仍需真机联调确认。
