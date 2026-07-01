# 验证：钱包和银行卡真实接口联调

## 日期

2026-06-30

## 范围

- `/wallet` 钱包真实 BFF、mapper、页面 loading/success/empty/error。
- `/wallet/bank-cards` 银行卡列表、无卡态和解绑弹窗。
- H5 BFF 路径、query/body 与 Apifox main 分支接口口径。

## 命令

```bash
cd hybird-meumall
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
curl -I http://localhost:3109/hybird/wallet
curl -I http://localhost:3109/hybird/wallet/bank-cards
```

## 结果

- Vitest 通过，3 files / 15 tests。
- TypeScript typecheck 通过。
- `/hybird/wallet` 返回 200 OK。
- `/hybird/wallet/bank-cards` 返回 200 OK。
- Playwright + 本机 Chrome 拦截 BFF 成功态验证钱包、银行卡列表和解绑弹窗，375 宽度无横向溢出。

## 备注

- 2026-07-01 口径更新：推广订单 `userId` 已改为从原生 Cookie `userInfo.phone` 读取，不再取推广概览 `distributionUserId`。
- 尚未在 App WebView 内用真实 `mallToken` 和 `userInfo` Cookie 验证 Java 返回数据。
- 解绑银行卡 `signNum` 当前取推广概览 `userInfo.cardNo`，需后端确认最终口径。
