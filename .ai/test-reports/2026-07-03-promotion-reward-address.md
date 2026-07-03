# 激励活动奖励领取页视觉和地址领取验证

- 日期：2026-07-03
- 范围：`/promotion/activities/[id]/reward?mode=receive` 顶部视觉、快递配送实物奖励地址弹窗、地址选择流。

## Apifox 确认

- 项目：`4403987`
- 分支：`main`
- 激励奖励详情：`GET /p/app/distribution/incentive/reward/detail/{id}`
- 领取激励活动奖励：`PATCH /p/app/distribution/incentive/reward/receive/{recordId}`
- `deliverType`：`1` 现场领取，`2` 快递配送。
- `addressId`：仅实物奖励且需邮寄时必填。

## 验证命令

```bash
pnpm exec vitest run src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts src/features/mine-secondary/address-flow.test.ts src/lib/assets/asset-url.test.ts
pnpm typecheck
pnpm exec eslint src/features/promotion/components/PromotionActivityRewardScreen.tsx src/features/promotion/types.ts src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/promotion-service.test.ts src/features/mine-secondary/address-flow.ts src/features/mine-secondary/address-flow.test.ts src/lib/assets/local-assets.ts src/lib/assets/asset-url.test.ts
git diff --check
```

## 结果

- 单测通过：5 files / 49 tests。
- TypeScript 类型检查通过。
- 定向 ESLint 通过。
- diff 空白检查通过。

## 备注

- 新增和修改地址都先进入地址列表选择；地址列表为空时由地址列表页进入新增地址。
- 本次不调整奖励详情接口路径或领取接口路径。
