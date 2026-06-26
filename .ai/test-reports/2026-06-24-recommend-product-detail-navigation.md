# 验证：相似推荐商品详情跳转修复

## 日期

2026-06-24

## 范围

- `/home/recommend-products` 相似推荐商品卡进入商品详情。
- 首页商品 mapper 继续产出 `/product/<prodId>`。
- 商品详情页数字商品 ID 继续进入真实商品加载态，不回到静态 404。

## 问题定位

- 首页商品列表跳转正常，因为首页商品卡使用 `HybridLink strategy="new-webview"`。
- 相似推荐商品卡原先使用普通 `next/link` + `buildClientHref(product.href)`，在 App WebView 内没有触发原生新开 H5 WebView 的容器策略。
- 商品详情页本身对数字 ID 的行为正常：`/product/<number>` 在无本地 mock 商品时会渲染真实商品加载态，由客户端 BFF 拉取 `/api/bff/product-detail?prodId=<number>`。

## 命令

```bash
pnpm test src/features/home/home-recommend-products.test.tsx src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
```

## 结果

- `pnpm test src/features/home/home-recommend-products.test.tsx src/features/home/home-real-api.test.ts`：通过，2 files / 19 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 备注

- 本次未修改商品详情 BFF、Java 接口、Native Bridge 契约或 manifest。
- 后续仍需使用 App 注入的有效 `mallToken` 在真实 WebView 中验证商品详情接口数据返回。
