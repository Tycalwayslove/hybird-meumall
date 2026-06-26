# 验证：商品详情骨架和图片空态

## 日期

2026-06-24

## 范围

- `/product/<number>` 远程真实商品首屏加载态。
- 商品详情主图区无媒体图片时的空态。
- `ProductImagePlaceholder` 标准属性透传。
- 商品详情、真实商品链路、订单确认和商品图片空态相邻测试。

## 行为

- 数字商品 ID 进入详情页时，首屏展示 `data-product-detail-skeleton="true"` 骨架屏，不展示“正在加载商品”和 `￥0` 等假商品信息。
- BFF 返回真实商品详情后，页面继续渲染真实商品、SKU、评价、富文本和购买链路。
- 主图区没有 `mediaItems` / `heroImageUrls` 时，使用 `ProductImagePlaceholder` 通用商品图片空态，并带 `data-product-hero-empty-image="true"`。

## 命令

```bash
pnpm test src/features/product/product-detail.test.tsx src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx src/design-system/components/product-image-placeholder.test.tsx
pnpm typecheck
pnpm lint
```

## 结果

- `pnpm test src/features/product/product-detail.test.tsx src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx src/design-system/components/product-image-placeholder.test.tsx`：通过，4 files / 25 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。

## 备注

- 本次未修改商品详情 BFF、Java 接口、Native Bridge 或 manifest。
- 真实商品详情数据仍依赖 App/WebView 注入有效 `mallToken`。
