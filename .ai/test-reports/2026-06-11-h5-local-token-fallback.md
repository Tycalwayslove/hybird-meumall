# H5 本地 token 兜底验证记录

## 范围

- `src/server/auth/cookie-auth.ts`
- `src/server/http/bff-context.ts`
- 本地 `.env.local` token fallback 文档

## 验证命令

```bash
cd hybird-meumall
pnpm test src/server/auth/cookie-auth.test.ts src/server/http/bff-context.test.ts src/server/http/backend-client.test.ts src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- 目标测试：通过，4 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 规则确认

- Cookie 中存在 `mallToken` / `pythonToken` 时，Cookie 优先。
- `APP_ENV=local` 且 Cookie 缺失时，BFF 使用 `H5_LOCAL_JAVA_TOKEN` / `H5_LOCAL_PYTHON_TOKEN`。
- `APP_ENV=test/prod` 时忽略 `H5_LOCAL_*_TOKEN`。

## 剩余风险

- 开发者必须只在本机 `.env.local` 放真实 token，不得写入 tracked profile 或文档。
