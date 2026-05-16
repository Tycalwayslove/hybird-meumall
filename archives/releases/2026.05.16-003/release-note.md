# Release 2026.05.16-003

## 摘要

- 本地发布演练版本，启动在 `http://127.0.0.1:3112`。
- 页面右上角显示 `NEW 2026.05.16-003`，样式使用 `green` 变体，便于在 iOS WebView 中区分。

## 渠道

- stable

## 灰度

- 类型：percentage
- 比例：0

## 路由

| Route | Delivery | Notes |
| --- | --- | --- |
| / | remote |  |
| /category | remote |  |
| /cart | remote |  |
| /profile | remote |  |

## SSR 产物

- Runtime：.next/standalone/server.js
- Static：.next/static
- Public：public

## Manifest 草案

- manifest.draft.json

## 验证

- `pnpm run ai:prepare-ssr-release --version 2026.05.16-003 --environment prod --service-base-url http://127.0.0.1:3112 --base-path /hybird` 通过。
- `pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.16-003/ssr-release-plan.json` 通过，检查 5 个 URL。
- `pnpm run ai:register-release --version 2026.05.16-003 ... --execute` 已注册 candidate。
- `POST /api/releases/{id}/promote` 已发布为 active。
- active manifest 已指向 `http://127.0.0.1:3112/hybird/category`。

## 回滚方案

- 回滚目标：2026.05.16-green

## 风险

- 当前为本地 SSR 服务，不代表真实生产部署平台。
- iOS 真机若不能访问 `127.0.0.1`，需要将 manifest 中的 `serviceBaseUrl` 换成 Mac 局域网 IP。
