# 2026-07-01 钱包提现申请验证

## 范围

- `/wallet` 提现弹窗。
- `/api/bff/wallet/withdraw` -> Java `/p/allinpay/member/memberWithdrawApply`。
- 提现金额前端和 BFF 校验。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
git diff --check
```

## 结果

- 通过，3 files / 23 tests。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- 服务层验证提现申请前会读取钱包汇总，并在金额超过 `settledAmount` 时返回 `PARSE_ERROR`，不会调用通联提现接口。
- 服务层验证通联提现请求体只包含 `{ amount }`，不传 `signNum/notifyUrl`。
- 页面渲染验证提现弹窗只展示金额输入。
- 飞书同步验证通过：页面清单 revision 50，H5 BFF/API 对接说明 revision 21。

## 未验证

- 尚未在 App WebView 内使用真实 `mallToken` 验证提现申请接口返回。
