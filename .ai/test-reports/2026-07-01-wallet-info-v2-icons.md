# 验证：钱包 infoV2 与入口图标调整

## 日期

2026-07-01

## 范围

- 钱包汇总接口从 Java `/p/distribution/wallet/info` 切换到 `/p/distribution/wallet/infoV2`。
- H5 BFF 从 Cookie `userInfo.phone` 读取手机号并作为 `userMobile` 传给钱包汇总接口。
- 钱包账户余额、可提现金额和提现申请上限统一取 `canWithdrawAmount`。
- 钱包页帐户管理、银行卡管理入口图标样式调整。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
git diff --check
```

## 结果

- 通过，3 files / 24 tests。
- `pnpm typecheck` 通过。
- `git diff --check` 通过。
- 飞书同步完成：页面清单 revision_id=51；H5 BFF/API 对接说明 revision_id=22。

## 备注

- Apifox main 分支 `DistributionUserWalletV2Dto` 暂未包含 `canWithdrawAmount`；H5 已预留字段，字段缺失时按 `0` 展示和校验。
- 尚未在 App WebView 内用真实 `mallToken` 和 `userInfo` Cookie 验证 Java 真实返回。
