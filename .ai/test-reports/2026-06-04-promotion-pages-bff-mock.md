# 2026-06-04 推广模块首批页面与 BFF Mock 验证记录

## 范围

- `/promotion`
- `/promotion/activities`
- `/promotion/rank-center`
- `/promotion/ranking/sales`
- `/promotion/ranking/amount`
- `/promotion/benefits?level=v1-v5`
- `/api/bff/promotion/**`

## 验证结果

- `pnpm test src/features/promotion/promotion-service.test.ts`：通过，1 file / 4 tests。
- `pnpm typecheck`：通过。
- `pnpm test`：通过。
- `pnpm build`：通过。
- 本地 H5 dev server `http://localhost:3112` smoke：推广页面和 BFF mock 均返回 200。

## Smoke 路由

- `GET /promotion`：200。
- `GET /promotion/activities`：200。
- `GET /promotion/rank-center`：200。
- `GET /promotion/ranking/sales`：200。
- `GET /promotion/ranking/amount`：200。
- `GET /promotion/benefits?level=v5`：200。
- `GET /api/bff/promotion/home?level=v5`：200。
- `GET /api/bff/promotion/activities`：200。
- `GET /api/bff/promotion/rank-center`：200。
- `GET /api/bff/promotion/rankings/sales?period=week`：200。
- `GET /api/bff/promotion/rankings/amount?period=month`：200。
- `GET /api/bff/promotion/benefits?level=v1`：200。

## 说明

- 当前会话未暴露可用的浏览器自动截图工具，且 H5 workspace 未安装 Playwright CLI，因此本轮以 HTTP smoke、类型检查、单测、全量测试和生产构建作为验收依据。
- 页面素材未使用 Figma 临时图片 URL，首版使用可替换的占位组件。
- 真实后端接口、达人等级阈值、活动状态和榜单刷新策略仍需后续确认。
