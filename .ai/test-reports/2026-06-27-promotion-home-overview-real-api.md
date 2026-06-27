# 验证：推广首页概览真实接口联调

## 日期

2026-06-27

## 范围

- `/promotion`
- `/api/bff/promotion/home`
- `src/features/promotion/server/promotion-home-real-service.ts`

## 命令

```bash
pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-products.test.tsx
pnpm typecheck
pnpm run ai:check-docs-sync --strict
pnpm lint -- src/features/promotion/server/promotion-home-real-service.ts src/app/api/bff/promotion/home/route.ts src/app/promotion/page.tsx src/features/promotion/components/PromotionAssetPlaceholder.tsx src/features/promotion/components/TalentHero.tsx src/features/promotion/promotion-service.test.ts
```

## 结果

- Vitest 通过：3 files / 27 tests。
- TypeScript 类型检查通过。
- 文档同步检查通过：15 个核心文件。
- Lint 通过：0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

## 备注

尚未在 App WebView 中用有效 `mallToken` 验证真实接口返回；该项保留在任务和 TODO 中继续跟进。
