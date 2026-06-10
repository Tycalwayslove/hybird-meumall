# 2026-06-10 商品卡片缺省图组件验证记录

## 范围

- 新增 `ProductImagePlaceholder` 公共商品缩略图缺省组件。
- 覆盖推广商品列表、搜索热榜商品、搜索结果商品、限时秒杀商品、商品购买弹窗和提交订单商品行。
- 本次不接入真实商品图片，也不修改商品详情主图高保真展示。

## 验证命令

```bash
pnpm exec vitest run src/design-system/components/product-image-placeholder.test.tsx src/features/promotion/promotion-products.test.tsx src/features/search/search.test.tsx src/features/seckill/seckill.test.tsx src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx
pnpm run typecheck
pnpm run lint
pnpm test -- --runInBand
pnpm run build
```

## 验证结果

- 组件与相关页面测试通过：6 files / 22 tests。
- TypeScript 类型检查通过。
- ESLint 通过，存在 4 条历史 `<img>` warning，无 error。
- 全量测试通过：32 files / 154 tests。
- Next.js production build 通过。

## 剩余风险

- 当前仍是静态灰色占位图阶段，真实商品图片字段、CDN 地址、加载失败兜底和图片比例规则需要等后端/运营图片来源确认后再接入。
