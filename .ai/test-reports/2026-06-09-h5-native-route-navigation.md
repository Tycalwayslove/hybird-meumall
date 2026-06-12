# 2026-06-09 H5 与原生路由跳转验证记录

## 背景

基于《H5 与原生 App 路由跳转、WebView 容器和返回规则》对接说明，H5 侧补齐统一跳转封装和首批页面入口改造。

## 覆盖范围

- Bridge route 类型扩展：`tab`、`close_webview`；原生页后续收敛为直接 route（如 `settings`），不再使用 `native_page` 包装。
- Bridge event 扩展：`route_changed`。
- `src/lib/navigation`：
  - `HybridLink`
  - `createHybridNavigator()`
  - `HybridRouteReporter`
- `TopNavigation` 返回按钮接入 Native/Web 双环境 fallback。
- 首页、推广首页、我的页核心入口改造。
- 搜索页商品详情保持当前 WebView 内 push。

## 验证命令

```bash
pnpm exec vitest run \
  src/lib/navigation/hybrid-navigation.test.ts \
  src/lib/bridge/protocol-bridge.test.ts \
  src/design-system/components/navigation.test.tsx \
  src/features/home/home.test.tsx \
  src/features/search/search.test.tsx \
  src/features/product/product-detail.test.tsx

pnpm typecheck
```

## 结果

- 单测通过：6 files / 31 tests。
- 类型检查通过。

## 仍需联调

- iOS / Android 需要确认正式 `router/navigate` payload 和 URL 白名单。
- Android 尚未在当前仓库落地调试接收器。
- 原生设置页、分享、登录重认证仍是占位或待正式实现能力。
