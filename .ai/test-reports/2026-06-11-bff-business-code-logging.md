# BFF 后端业务码日志增强验证记录

## 范围

- `src/server/http/backend-client.ts`
- `[h5-bff-backend-call]` 日志字段
- `docs/05_API_SPEC.md`

## 验证命令

```bash
cd hybird-meumall
pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- 目标测试：通过，3 files / 12 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。

## 规则确认

- `backendStatus` 表示 HTTP 状态。
- `backendBusinessCode` / `backendBusinessSuccess` 表示后端响应体里的业务状态。
- HTTP 200 + `success:false/code:A00004` 会继续被首页 service 转换为 BFF `AUTH_FAILED`。
