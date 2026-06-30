# 2026-06-30 卖手活动真实接口联调验证记录

## 范围

- H5 页面：`/seller/activities`、`/seller/activities/[activityId]`、`/seller/activities/[activityId]/products`、`/seller/activities/[activityId]/products/[prodId]`。
- H5 BFF：`/api/bff/seller-activities/**`。
- 服务层：`src/features/seller-activity/server/seller-activity-service.ts`。
- 客户端 API adapter：`src/features/seller-activity/api.ts`。

## 自动化验证

```bash
pnpm exec vitest run src/features/seller-activity/seller-activity.test.tsx
```

结果：通过，1 file / 7 tests。

```bash
pnpm typecheck
```

结果：通过。

```bash
pnpm exec eslint src/features/seller-activity src/app/seller src/app/api/bff/seller-activities
```

结果：通过。

## 覆盖点

- `createSellerActivityApi` 统一封装卖手活动 BFF path 和 mutation method。
- `fetchSellerActivitiesData` 映射 `/p/sellerActivity/availableList` 为营销活动卡片。
- `fetchSellerActivityProductsData` 按 `activityId/status/current/size` 请求 `/p/sellerActivity/page` 并映射活动商品。
- `fetchSellerAvailableProductsData` 使用 `/p/distribution/prod/productPage` 作为新增活动商品来源。
- `batchUpdateSellerActivityStatus` 和 `saveSellerActivity` 使用 Java POST 接口。
- 页面空态不展示 mock 业务卡片，活动配置页保留 `/seller/activities/[activityId]/products` 新增入口。

## 未验证项

- 需要 App 注入有效 `mallToken` 后做真实接口联调。
- `/p/sellerActivity/detail` 对未配置商品是否返回商品基础信息仍待后端确认。
- `saveOrUpdate` 的活动时间必填策略和 SKU 活动价校验仍以后端真实错误码为准。
