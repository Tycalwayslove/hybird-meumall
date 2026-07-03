# 2026-07-03 推广商品搜索筛选排序统一验证

## 范围

- `/promotion/products` 推广带货商品页。
- `/seller/activities/[activityId]/products` 卖手活动选择商品页。
- 推广商品分页接口参数：`keyword`、`categoryId`、`orderBy`、`incentiveId`。

## 验证命令

- `pnpm exec vitest run src/features/promotion/promotion-products.test.tsx src/features/promotion/api.test.ts src/features/seller-activity/seller-activity.test.tsx src/features/promotion/promotion-incentive-activities-real-service.test.ts`
- `pnpm exec eslint src/features/promotion/components/PromotionProductsScreen.tsx src/features/promotion/components/PromotionProductQueryControls.tsx src/features/promotion/promotion-product-query.ts src/features/promotion/api.ts src/app/api/bff/promotion/products/route.ts src/features/promotion/server/promotion-products-real-service.ts src/features/seller-activity/components/SellerActivityScreens.tsx src/features/seller-activity/api.ts src/features/seller-activity/server/seller-activity-service.ts src/app/promotion/products/page.tsx 'src/app/seller/activities/[activityId]/products/page.tsx'`
- `pnpm typecheck`
- `git diff --check`

## 结果

- Vitest 通过：4 files / 36 tests。
- ESLint 通过。
- TypeScript 类型检查通过。
- Diff 空白检查通过。
