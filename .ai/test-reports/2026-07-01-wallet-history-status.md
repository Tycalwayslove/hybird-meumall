# 2026-07-01 钱包历史钱包入口验证

## 范围

- 钱包历史状态 BFF `/api/bff/wallet/history-status`。
- Python `GET /user/wallet_state` 响应 `state` 到 H5 view model 的映射。
- 钱包页右上角“历史钱包”入口展示规则。
- Native Bridge `router/navigate route=history-wallet`。

## 结果

| 命令 | 结果 |
| --- | --- |
| `pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/navigation/hybrid-navigation.test.ts` | 通过，4 files / 33 tests |
| `pnpm typecheck` | 通过 |
| `git diff --check` | 通过 |

## 未完成验证

- 尚未在 App WebView 内使用真实 `pythonToken` 验证 `/user/wallet_state` 返回。
- 尚未在 App WebView 内验证点击“历史钱包”后 App 原生打开历史钱包页。
