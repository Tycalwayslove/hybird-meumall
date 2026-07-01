# 验证：钱包账户管理与认证信息页

## 范围

- 钱包页“帐户管理”入口。
- `/wallet/account` 账户管理页。
- `/wallet/account/certification` 认证信息页。
- `/api/bff/wallet/member-info` -> Java `/p/allinpay/member/getMemberBasicInfoV2`。
- 认证信息页复用 `/api/bff/wallet/bank-cards` 展示银行卡列表入口。

## 验证命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
git diff --check
```

## 结果

- `wallet-real-service.test.ts` 覆盖会员信息接口路径和姓名、身份证号脱敏映射。
- `wallet-api.test.ts` 覆盖浏览器端 adapter 到 `/api/bff/wallet/member-info` 的路径映射。
- `mine-secondary-pages.test.tsx` 覆盖账户管理页、认证信息页、银行卡列表跳转和不展示“实名登记”。

## 未验证

- 尚未在 App WebView 内用真实 `mallToken` 验证 `/p/allinpay/member/getMemberBasicInfoV2` 返回。
- 尚未验证真实接口返回的 `cerNum` 是否已加密；H5 当前只做展示脱敏，不做解密。
