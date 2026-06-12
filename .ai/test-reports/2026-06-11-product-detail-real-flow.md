# 2026-06-11 商品详情真实接口与订单确认实时校验

## 范围

- 商品详情页 `/product/[id]` 接入 H5 BFF。
- H5 BFF `/api/bff/product-detail` 调 Java `/prod/prodInfo?prodId=<id>&addrId=0&dvyType=1`。
- 商品详情购买弹窗支持真实 SKU、库存和数量兜底。
- 订单确认页 `/order-confirm` 接收 `productId`、`skuId`、`quantity` 后调用 `/api/bff/order-confirm`。
- 订单确认 BFF 重新请求商品详情并校验 SKU、库存、价格和数量。
- 订单确认成功态保留真实 `productId`，顶部返回使用对应商品详情页作为 fallback。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/product/product-real-flow.test.tsx
pnpm exec vitest run src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
```

## 结果

- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx`：通过，2 files / 11 tests。
- `pnpm exec vitest run src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx`：通过，5 tests。
- `pnpm test`：通过，42 files / 212 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。
- `pnpm run build`：通过。
- `curl http://localhost:3109/hybird/product/1000054`：HTTP 200，首屏返回“正在加载商品”。
- `curl "http://localhost:3109/hybird/order-confirm?productId=1000054&skuId=6001&quantity=1"`：HTTP 200，首屏返回“正在确认订单”。

## Lint Warning 说明

`pnpm lint` 剩余 4 条 warning 均来自 promotion 模块既有 `<img>` 使用：

- `src/features/promotion/components/PromotionActivitiesScreen.tsx`
- `src/features/promotion/components/PromotionActivityDetailScreen.tsx`
- `src/features/promotion/components/PromotionRewardRecordsScreen.tsx`

本次商品详情和订单确认链路未新增 lint warning。

## 未覆盖事项

- 未执行带真实 App `mallToken` 的端上联调；后续需在测试包 WebView 中打开 `/product/1000054` 验证真实接口成功态。
- 本期订单确认只做实时校验和展示，不创建正式订单、不接支付。
- 秒杀、拼团、自提、同城、收藏、优惠券领取、正式下单和支付后置。
