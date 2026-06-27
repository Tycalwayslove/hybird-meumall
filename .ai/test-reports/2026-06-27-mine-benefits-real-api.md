# 验证：我的页与权益中心真实接口联调

## 日期

2026-06-27

## 范围

- `/mine`
- `/api/bff/mine/summary`
- `/promotion/benefits`
- `/api/bff/promotion/benefits`

## 命令

```bash
pnpm exec vitest run src/features/mine/mine-real-api.test.tsx src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts
pnpm typecheck
pnpm run ai:check-docs-sync --strict
pnpm lint -- src/features/mine src/app/mine/page.tsx src/app/api/bff/mine/summary/route.ts src/features/promotion/server/promotion-level-real-service.ts src/app/api/bff/promotion/benefits/route.ts src/app/promotion/benefits/page.tsx src/features/promotion/components/PromotionBenefitsCarousel.tsx src/features/promotion/api.ts src/features/promotion/promotion-service.test.ts
```

## 结果

- Vitest 通过：3 files / 20 tests。
- TypeScript 类型检查通过。
- 文档同步检查通过：15 个核心文件。
- Lint 通过：0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

## 备注

尚未在 App WebView 中用有效 `mallToken` 验证真实接口返回；该项保留在任务和 TODO 中继续跟进。
