# 2026-06-03 H5 BFF HTTP 鉴权基础验证

## 背景

建立 App Cookie 登录态、Next BFF、Python / Java Authorization 鉴权之间的统一 HTTP 请求体系。

## 验证范围

- `src/server/auth/cookie-auth.ts`
- `src/server/http/backend-registry.ts`
- `src/server/http/backend-client.ts`
- `src/server/http/bff-response.ts`
- `src/lib/http/h5-client.ts`
- `src/server/runtime/native-context.ts`，当前按内部调试口径返回完整 Cookie 值。
- `src/app/api/bff/user/profile/route.ts`
- `src/app/api/bff/runtime/context/route.ts`
- `src/features/home/NativeRuntimePanel.tsx`

## RED 记录

先运行：

```bash
pnpm test src/server/auth/cookie-auth.test.ts src/server/http/backend-registry.test.ts src/server/http/backend-client.test.ts src/lib/http/h5-client.test.ts
```

结果：失败，原因是 `cookie-auth`、`backend-registry`、`backend-client`、`h5-client` 模块尚不存在。

随后运行：

```bash
pnpm test src/server/http/bff-response.test.ts
```

结果：失败，原因是 `bff-response` 模块尚不存在。

新增首页原生传参展示前运行：

```bash
pnpm test src/server/runtime/native-context.test.ts
```

结果：失败，原因是 `native-context` 模块尚不存在。

## GREEN 记录

```bash
pnpm test src/server/http/bff-response.test.ts src/server/auth/cookie-auth.test.ts src/server/http/backend-registry.test.ts src/server/http/backend-client.test.ts src/lib/http/h5-client.test.ts
```

结果：通过，5 个测试文件，11 个测试。

```bash
pnpm test src/server/runtime/native-context.test.ts
```

结果：通过，1 个测试文件，2 个测试。

## 完整验证

```bash
pnpm typecheck
pnpm test
pnpm build
pnpm run ai:check-workflow
```

结果：

- `pnpm typecheck`：通过。
- `pnpm test`：通过，18 个测试文件，85 个测试。
- `pnpm build`：通过，生产构建包含 `/api/bff/user/profile`。
- `pnpm run ai:check-workflow`：通过。

## 风险

- Java / Python 真实 base URL 尚未确认。
- 原生 App 写 Cookie 的 SameSite、Domain、Path 和 WebView 生效行为尚未真机验证。
- 示例 `user/profile` route 只展示 BFF 调用链路，真实业务接口路径和响应字段后续需单独建 API 契约。
