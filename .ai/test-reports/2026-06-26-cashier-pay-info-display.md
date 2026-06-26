# 验证：收银台支付信息展示链路

## 日期

2026-06-26

## 范围

- `/pay-way` 收银台展示页面。
- `/api/bff/order-pay-info` 到 Java `/p/order/getOrderPayInfoByOrderNumber` 和 `/sys/config/info/getSysPaySwitch` 的只读链路。
- `/order-confirm` 提交订单成功后的收银台跳转。
- 确认付款按钮本期只本地提示“已发起支付”，不调用 `/p/order/pay`。

## 命令

```bash
pnpm exec vitest run src/features/payment/cashier-real-flow.test.tsx
pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx
pnpm typecheck
pnpm lint -- src/features/payment src/app/pay-way/page.tsx src/app/api/bff/order-pay-info/route.ts src/features/product/components/OrderConfirmScreen.tsx
pnpm run build
```

## 结果

- `cashier-real-flow.test.tsx`：通过，1 file / 7 tests。
- `product-real-flow.test.tsx` + `order-confirm.test.tsx`：通过，2 files / 18 tests。
- `pnpm typecheck`：通过。
- scoped lint：通过，0 errors；输出仍包含 promotion 模块既有 `<img>` warnings，与本次收银台变更无关。
- `pnpm run build`：通过，Next 路由表包含 `/pay-way` 和 `/api/bff/order-pay-info`。

## 备注

本期未迁移真正确认付款流程；未调用 Java `/p/order/pay`，未新增支付 Bridge。
