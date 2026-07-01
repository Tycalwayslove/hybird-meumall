# 验证：钱包提现记录页真实接口

## 日期

2026-07-01

## 范围

- `/wallet` 提现记录入口跳转。
- `/wallet/withdraw-records` 页面 loading、success、empty、load more。
- `/api/bff/wallet/withdraw-records` 到 Java `/p/userWithdraw/pageDateUserWithdrawCash` 的分页请求和 mapper。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
```

## 结果

- Vitest 通过，3 files / 18 tests。
- TypeScript typecheck 通过。

## 备注

- Apifox 查询使用 Project `4403987`、Branch `main`。
- 尚未在 App WebView 内用真实 `mallToken` 验证提现记录接口返回。
