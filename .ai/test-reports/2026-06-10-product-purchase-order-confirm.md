# 2026-06-10 商品详情购买弹窗与提交订单页验证记录

## 范围

- 商品详情页“立即购买”打开购买弹窗。
- 购买弹窗展示商品摘要、规格、配送方式、数量步进器和确认入口。
- `/order-confirm` 提交订单页展示默认地址态。
- `/order-confirm?address=missing` 展示未填写收货信息态并禁用提交按钮。

## 验证命令

```bash
pnpm exec vitest run src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx
pnpm run typecheck
pnpm run lint
pnpm test -- --runInBand
pnpm run build
```

## 验证结果

- Product 相关测试通过：2 files / 5 tests。
- TypeScript 类型检查通过。
- ESLint 通过，仍有 4 条历史 `<img>` warning，无 error。
- 全量测试通过：31 files / 150 tests。
- Next.js 构建通过。

## 风险

- 当前仍是 H5 静态 mock 阶段，未接入真实商品、库存、价格、地址、优惠券、发票和提交订单接口。
- 订单底部“共4件”按 Figma 静态稿展示；真实联调时应以后端订单确认接口返回为准。
