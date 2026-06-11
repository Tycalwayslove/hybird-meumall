# H5 HTTP 请求观测第一阶段验证记录

## 范围

- H5 client 客户端上下文 header。
- backend client 客户端上下文透传。
- backend call logger hook。
- BFF response 回归。

## 验证命令

```bash
cd hybird-meumall
pnpm test src/lib/http/h5-client.test.ts src/server/http/backend-client.test.ts src/server/http/bff-response.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- `pnpm test ...`：通过，3 files / 9 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过，所有 MeuMall workflow checks passed。

## 说明

- H5 client 已验证继续携带 `credentials: "include"` 和 `x-request-id`。
- H5 client 已验证可携带 `x-page-session-id`、`x-app-version`、`x-platform`、`x-os-version`、`x-device-model` 等上下文 header。
- H5 client 已验证不手动设置浏览器禁止的 `User-Agent` header。
- backend client 已验证可透传原始 `user-agent` 和客户端上下文 header。
- backend client 已验证成功和后端错误时都会调用 logger hook，且日志对象不包含 token。

## 剩余风险

- Java / Python 后端尚未适配 `x-request-id` 和客户端上下文入口日志。
- 原生 App 侧 App 版本、build 号、系统版本、设备型号和 WebView 版本来源仍需确认。
