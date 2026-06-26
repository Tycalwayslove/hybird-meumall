# 2026-06-26 商品详情下单链路与 orderFlowLogParam 验证记录

## 范围

- 商品详情进入时记录旧 uni-app 同源的订单流上下文。
- 订单确认页加载后记录确认页上下文。
- 提交订单时向 `/p/order/submit` 透传 H5 客户端生成的 `orderFlowLogParam`。
- 订单确认 BFF 补齐 `/p/order/confirm` 的 `couponParams: []`，并在确认成功后补调 `/p/score/scoreInfo`。
- 普通快递链路对齐旧 uni-app：`/p/order/confirm.submitOrder=0` 不作为 H5 按钮置灰或提交阻断条件，最终以 `/p/order/submit` 返回为准。

## 验证命令

```bash
npm test -- src/features/product/order-flow-log.test.ts src/features/product/product-real-flow.test.tsx
npm test -- src/features/product/product-real-flow.test.tsx
npm test -- src/features/product/order-flow-log.test.ts src/features/product/order-confirm.test.tsx
npm test -- src/features/product src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts
npm run typecheck
npm run lint -- src/features/product/order-flow-log.ts src/features/product/order-flow-log.test.ts src/features/product/api.ts src/features/product/components/OrderConfirmScreen.tsx src/features/product/components/ProductDetailScreen.tsx src/app/api/bff/order-submit/route.ts src/features/product/server/product-real-service.ts src/features/product/product-real-flow.test.tsx
npm run lint -- src/features/product/server/product-real-service.ts src/features/product/product-real-flow.test.tsx
```

## 结果

- 单点测试：2 个测试文件、15 个用例通过；补充置灰修复后，商品真实链路单文件 16 个用例通过。
- 商品/地址相关回归：7 个测试文件、36 个用例通过。
- TypeScript 类型检查通过。
- Lint 命令退出码为 0；项目内仍存在既有 `@next/next/no-img-element` warning，位于推广相关页面，和本次修改无关。

## 飞书同步

- 公司知识库页面：新款 app 开发资料 / 前端知识库页面清单。
- 同步链接：https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre
- 写入后 revision：31。
- 已验证关键词：`2026-06-26 商品详情下单链路补充同步`、`orderFlowLogParam`、`scoreInfo`、`submitOrder=0`、`置灰`。
