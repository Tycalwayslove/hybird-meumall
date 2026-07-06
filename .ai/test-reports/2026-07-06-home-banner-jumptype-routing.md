# 首页 banner jumpType 跳转验证记录

## 范围

- Apifox 首页聚合接口 banner `jumpType` 消费。
- 首页 BFF mapper 跳转分流。
- 首页 banner 组件导航策略。

## 验证命令

```bash
pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm exec eslint src/features/home/home-page-data.ts src/features/home/components/HomeExperience.tsx src/features/home/server/home-real-service.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx
git diff --check
```

## 结果

- `pnpm exec vitest run src/features/home/home.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 30 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint src/features/home/home-page-data.ts src/features/home/components/HomeExperience.tsx src/features/home/server/home-real-service.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过。
- `git diff --check`：通过（根目录和 `hybird-meumall`）。
- 飞书同步：页面盘点 revision 76，关键词核验通过。

## 备注

`jumpType=3` 纯业务 ID 场景当前只进入 `/promotion/activities?activityId=<id>`，避免误调用达人激励活动详情接口；后续确认商城活动详情页后需要补对应路由。
