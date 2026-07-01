# 2026-07-01 钱包添加银行卡与解绑入参调整验证

## 范围

- `/wallet/bank-cards/add` 添加银行卡页。
- `/api/bff/wallet/bank-cards/apply` -> Java `/p/allinpay/member/createMemberApply`。
- `/api/bff/wallet/bank-cards/unbind` -> Java `/p/allinpay/member/unbindBankCardV2`。

## 验证命令

```bash
pnpm exec vitest run src/features/mine-secondary/wallet-real-service.test.ts src/features/mine-secondary/wallet-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
```

## 结果

- Vitest 通过，3 files / 20 tests。
- TypeScript 类型检查通过。

## 覆盖点

- 添加银行卡 BFF 只向 Java 传 `acctNum/cerNum/phone`，不传 `signNum/name`。
- 解绑银行卡 BFF 只向 Java 传 `acctNum`，不传 `signNum`。
- 银行卡管理页添加入口可跳转 `/wallet/bank-cards/add`。
- 添加页只渲染银行卡号、身份证号、手机号三个输入。
- 添加成功回到银行卡管理页后可展示“添加成功”提示。

## 未验证项

- 尚未在 App WebView 内使用真实 `mallToken` 验证 Java 实际创建会员申请和解绑动作。
