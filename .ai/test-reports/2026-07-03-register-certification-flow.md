# 2026-07-03 注册后实名认证流程验证

## 范围

- 注册成功后跳转认证入口。
- 认证入口页、真实姓名页、认证结果页。
- 认证 BFF：开户链接和会员信息查询。
- App Bridge：打开外部认证 WebView、认证成功跳首页 Tab。

## 接口契约

- Apifox project：`4403987`
- branch：`main`
- 开户 H5：`GET /p/allinpay/member/getCreateMemberApplyUrl`
- 查询会员信息：`GET /p/allinpay/member/getMemberBasicInfoV2`

## 验证命令

```bash
pnpm exec vitest run src/features/certification/server/certification-service.test.ts src/features/register/server/register-service.test.ts
pnpm typecheck
pnpm exec eslint src/features/certification src/app/register/certification src/app/api/bff/certification src/features/register/components/RegisterScreen.tsx src/lib/assets/local-assets.ts
pnpm build
```

## 结果

- Vitest：通过，2 files / 4 tests。
- TypeScript：通过。
- ESLint：通过。
- Next build：通过，路由表包含认证页面和认证 BFF。

## 备注

- 结果页成功条件为 `phone` 存在、`isRealNameAuth=1`、`isWithdraw=1`。
- 独立 H5 URL `token` 通过 `x-meumall-auth-token` 传给 BFF，避免进入 Java query。
