# 2026-07-03 卖手活动商品设置页样式调整验证

## 范围

- `/seller/activities/[activityId]/products/[prodId]` 商品设置页。
- 商品横卡价格信息、提示文案、活动时间/限购设置组、SKU 秒杀价格和佣金设置组、底部双按钮。

## 验证命令

- `pnpm exec vitest run src/features/seller-activity/seller-activity.test.tsx`
- `pnpm exec eslint src/features/seller-activity/components/SellerActivityScreens.tsx src/features/seller-activity/seller-activity.test.tsx`
- `pnpm typecheck`
- `git diff --check`

## 结果

- Vitest 通过：1 file / 11 tests。
- ESLint 通过。
- TypeScript 类型检查通过。
- Diff 空白检查通过。
