# 2026-06-25 商品订单确认与提交参数修复验证

## 范围

- 普通商品 + 快递 + SKU + 立即购买。
- `/order-confirm` 加载阶段的 Java `/p/order/confirm` 调用。
- `/api/bff/order-submit` 提交前确认和 `/p/order/submit` 请求体。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/product/product-real-flow.test.tsx
pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx
pnpm typecheck
pnpm lint
pnpm run build
```

## 结果

- `product-real-flow`：1 file / 14 tests 通过。
- `product-real-flow + order-confirm`：2 files / 16 tests 通过。
- TypeScript：通过。
- ESLint：0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示，不属于本次商品/订单修复。
- Next build：通过，路由表包含 `/api/bff/order-confirm`、`/api/bff/order-submit`、`/product/[id]`、`/order-confirm` 和地址相关 BFF。

## 覆盖点

- `/api/bff/order-confirm` 会按顺序调用：
  1. Java `/p/address/addrInfo/0`
  2. Java `/prod/prodInfo?prodId=<productId>&addrId=<resolvedAddrId>&dvyType=1`
  3. Java `/p/order/confirm`
- `/p/order/confirm` 请求体包含旧 uni-app 普通快递 DTO 字段：`addrId`、`dvyTypes[].dvyType`、`lat:null`、`lng:null`、`shopId`、`stationId:0`、`orderItem`、`prodCount`、`isScorePay:0`、`userChangeCoupon:0`、`userUseScore:0`。
- `/api/bff/order-submit` 会提交 `orderFlowLogParam: { step: 1, visitType: 1 }`，并优先从 Java 确认返回的 `shopCartOrders` 生成 `orderShopParams`。
