# 2026-06-29 推广激励活动真实接口联调验证

## 范围

- `/promotion/activities`
- `/promotion/activities/[id]`
- `/api/bff/promotion/activities`
- `/api/bff/promotion/activities/[id]`
- `/api/bff/promotion/activities/[id]/reward`
- `/api/bff/promotion/activities/rewards/[recordId]/receive`

## 验证命令

```bash
pnpm exec vitest run src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts
pnpm typecheck
pnpm exec eslint src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/components/PromotionActivitiesScreen.tsx src/features/promotion/components/PromotionActivityDetailScreen.tsx src/app/promotion/activities/page.tsx 'src/app/promotion/activities/[slug]/page.tsx' src/app/api/bff/promotion/activities/route.ts 'src/app/api/bff/promotion/activities/[id]/route.ts' 'src/app/api/bff/promotion/activities/[id]/reward/route.ts' 'src/app/api/bff/promotion/activities/rewards/[recordId]/receive/route.ts' src/features/promotion/api.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts
pnpm run ai:check-docs-sync --strict
```

## 结果

- Vitest：通过，3 files / 29 tests。
- Typecheck：通过。
- 精确 ESLint：通过，0 errors，2 warnings；warning 为活动页既有 `<img>` 规则提示。
- 文档同步检查：通过，15 个文件。

## 覆盖点

- 活动列表 mapper 覆盖销量达标、GMV 达标、销量排行、GMV 排行。
- 活动详情聚合 detail + reward detail，展示活动 banner、个人进度、奖励规则和奖励状态。
- 领取奖励 BFF 使用 PATCH，并透传可选 `addressId`。
- 统一 Promotion API 新增活动列表、活动详情和奖励详情 endpoint。

## 未验证项

- 未使用真实 App WebView `mallToken` 访问 Java 测试环境；需要联调时在 App 或 `/debug-login` 写入有效 token 后验证。
- 实物奖励领取的地址选择前端交互后置，本次只完成 BFF `addressId` 转发能力。
