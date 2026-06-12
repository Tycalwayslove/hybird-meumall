# 2026-06-12 商品详情店铺与评论概要

## 范围

- 扩展 `/api/bff/product-detail`，商品主数据成功后尽量聚合：
  - Java `/shop/headInfo`
  - Java `/prod/prodCommData`
  - Java `/prod/prodCommPageByProd`
- 商品详情 view model 保留店铺头部 modules，但页面不展示店铺卡片。
- 页面展示评价数量、好评率、评价标签和前两条评论；无评论时也展示评价模块空态。
- 商品主图支持视频首帧 + 图片混合轮播、切换、预览和播放。
- 商品主图支持触屏横滑和鼠标拖拽切换。
- 商品主图切换使用横向轨道 `translate3d` 过渡动画，避免生硬替换。
- 售后保障按 `afterSaleType`、`afterSaleContent` 映射；资质条按 `prodCertificateRecordDtoList` 映射。
- 评论图片相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接。
- 店铺或评论接口失败时隐藏对应模块，不影响商品主信息。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/product-detail.test.tsx
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
curl http://localhost:3109/hybird/api/bff/product-detail?prodId=1000054\&addrId=0\&dvyType=1
Browser: http://localhost:3109/hybird/product/1000054
```

## 当前结果

- `pnpm exec vitest run src/features/product/product-real-flow.test.tsx src/features/product/product-detail.test.tsx`：通过，2 files / 13 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。
- `pnpm test`：通过，43 files / 218 tests。
- `pnpm run build`：通过。
- 本地 BFF smoke：`/hybird/api/bff/product-detail?prodId=1000054&addrId=0&dvyType=1` 返回 200，包含店铺和评论数据。
- 本地浏览器 smoke：`/hybird/product/1000054` 渲染真实商品、评价数量、好评率、前两条评论和富文本详情图；店铺卡片不可见；点击主图下一张后角标从 `1/6` 切到 `2/6`。
- 本地浏览器 drag smoke：在主图真实坐标内鼠标左滑后，角标从 `1/6` 切到 `2/6`。
- 本地浏览器 animation smoke：媒体轨道 transition 为 `transform 0.28s cubic-bezier(0.22, 0.72, 0.22, 1)`，切换后 transform 平移到 `-430px`。

## Lint Warning 说明

`pnpm lint` 剩余 4 条 warning 均来自 promotion 模块既有 `<img>` 使用：

- `src/features/promotion/components/PromotionActivitiesScreen.tsx`
- `src/features/promotion/components/PromotionActivityDetailScreen.tsx`
- `src/features/promotion/components/PromotionRewardRecordsScreen.tsx`

本次商品详情店铺与评论概要改造未新增 lint warning。

## 未覆盖事项

- 未执行带真实 App `mallToken` 的端上联调；后续仍需在测试包 WebView 中打开 `/hybird/product/1000054` 验证原生注入上下文。
- 本期不实现店铺详情跳转、评论完整列表页、店铺收藏或店铺推荐商品。
