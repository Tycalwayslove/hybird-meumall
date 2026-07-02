# 2026-07-02 推广激励奖励领取/查看页

## 范围

- `/promotion/activities/[id]/reward?mode=receive|view`
- `/api/bff/promotion/activities/[id]/reward`
- `PATCH /api/bff/promotion/activities/rewards/[recordId]/receive`

## 变更

- 活动详情 `displayState=4` 的“去领奖”跳转到奖励页 `mode=receive`，导航标题为“领取奖励”。
- 活动详情 `displayState=5` 的“查看奖励”跳转到奖励页 `mode=view`，导航标题为“查看奖励”。
- 奖励页单独调用奖励详情 BFF，使用 `incentiveTitle/incentiveType/saleCount/gmv/saleRank/gmvRank` 生成顶部完成文案。
- 奖励列表展示 `details` 全部奖励，使用本地礼盒图标 `promotion.rewardGiftIcon`。
- `deliverState=0` 展示“领取”，调用领取 BFF；`deliverState=1/2` 展示“查看”，打开底部奖励详情弹层。

## 验证

- `pnpm exec vitest run src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts`：通过，3 files / 36 tests。
- `pnpm typecheck`：通过。

## 飞书同步

- 页面清单 `WgaqwTRRUitnRNkCtNPcOcDnnre` 已更新活动详情备注，revision `66`。
- H5 BFF/API 对接说明 `GPhdwjQ87iQAQskeS6lc9bMOnte` 已追加奖励领取/查看页说明，当前 fetch revision `25`。
- lark-cli 提示当前版本 `1.0.48`，最新 `1.0.61`。
