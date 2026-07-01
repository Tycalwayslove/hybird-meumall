# 验证：钱包 BFF 拆分与订单分页加载

## 日期

2026-07-01

## 范围

- 钱包汇总 BFF `/api/bff/wallet/summary`。
- 推广订单分页 BFF `/api/bff/wallet/orders?state=&current=&size=`。
- `/wallet` 页面结算 tab 切换重置订单第一页。
- 推广订单触底加载更多和按钮兜底。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
```

## 结果

- Vitest 通过，3 files / 16 tests。
- TypeScript typecheck 通过。

## 备注

- 旧 `/api/bff/wallet` 保留为钱包汇总兼容入口，不再聚合推广订单。
- 仍需在 App WebView 中用真实 `mallToken` 和 `userInfo.phone` 验证订单分页返回。
