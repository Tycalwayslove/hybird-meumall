# 2026-06-12 独立 H5 调试 Token 登录页验证

## 范围

- `/debug-login` 仅独立浏览器 H5 可见。
- 原生 App WebView 信号下不展示调试页。
- 无 token 首页自动进入调试页。
- 表单只接受 Java Token 和 Python Token，不引入账号密码登录。

## TDD 记录

1. 先新增 `src/features/debug-login/debug-login.test.tsx`，覆盖独立 H5 放行、已有 token 跳转、原生信号拦截和表单字段。
2. 红灯：`pnpm test src/features/debug-login/debug-login.test.tsx`，失败原因为 `Cannot find module './DebugTokenLoginForm'`。
3. 实现 `resolveDebugLoginAccess()`、`DebugTokenLoginForm` 和 `/debug-login` route 后重新验证通过。

## 已执行命令

```bash
pnpm test src/features/debug-login/debug-login.test.tsx
pnpm typecheck
pnpm lint
pnpm run build
```

## 当前结果

- 通过，1 file / 4 tests。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过，保留推广模块 4 条既有 `<img>` warning，无 error。
- `pnpm run build` 通过，构建产物包含动态 SSR route `/debug-login`。

## 待发布后验证

- 无 Cookie 访问线上版本 `/h5-v/<version>/` 应跳转到 `/h5-v/<version>/debug-login?redirect=/`。
- 无 Cookie 访问 `/h5-v/<version>/debug-login` 应返回 200，并展示 Java Token / Python Token 输入框。
- 携带 `statusHeight` 或 App/WebView header 访问 `/h5-v/<version>/debug-login` 应返回 404。
- 携带 `mallToken` 和 `pythonToken` 访问 `/h5-v/<version>/debug-login` 应跳回目标页面。
