# H5 HTTP 请求架构补齐验证记录

## 范围

- H5 client 页面会话和最近请求诊断。
- BFF request context。
- backend client 回归。
- Runtime feature API adapter。
- Promotion feature API adapter。
- 首页和 Promotion service 回归。

## 验证命令

```bash
cd hybird-meumall
pnpm test src/lib/http/h5-client.test.ts src/lib/http/request-diagnostics.test.ts src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/bff-response.test.ts src/features/home/runtime-api.test.ts src/features/home/home.test.tsx src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts
pnpm typecheck
pnpm lint
cd ..
pnpm run check
```

## 验证结果

- `pnpm test ...`：通过，9 files / 44 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过，所有 MeuMall workflow checks passed。

## 说明

- H5 client 已验证请求成功、业务失败和网络异常都会写入最近请求诊断。
- 请求诊断已验证可生成稳定 `pageSessionId` 和诊断快照。
- BFF context 已验证可统一读取 Cookie auth、客户端上下文、后端 token，并创建带 logger 的 backend client。
- Runtime adapter 已验证 BFF path 和 `sourceSearch` 编码。
- Promotion adapter 已验证首页、榜单等 BFF path 和可选 query 参数。

## 剩余风险

- Java / Python 后端仍需接入同一批 requestId 和客户端上下文日志。
- 原生 App 仍需确认设备、系统、App 版本和 WebView 版本来源。
- 真实业务接口迁移时还需要补 server service / mapper 和联调验收用例。
