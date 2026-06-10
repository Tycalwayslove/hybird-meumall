# 2026-06-10 分类页切换与推广分享联调验证记录

## 范围

- 商品分类页一级分类点击改为页面内状态切换，不再写入 `#level-*` hash。
- 推广商品分享 Bridge payload 的 `productId` 临时固定为 `1001`。
- 商品卡片缺省图去掉内部白色圆点。

## 验证命令

```bash
pnpm exec vitest run src/app/category/page.test.tsx src/features/promotion/promotion-products.test.tsx src/design-system/components/product-image-placeholder.test.tsx
pnpm exec vitest run src/app/category/page.test.tsx src/features/promotion/promotion-products.test.tsx src/features/search/search.test.tsx src/features/seckill/seckill.test.tsx src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx src/design-system/components/product-image-placeholder.test.tsx
pnpm run typecheck
pnpm run lint
pnpm run build
```

## 验证结果

- 回归测试通过：3 files / 8 tests。
- 相关页面测试通过：7 files / 23 tests。
- TypeScript 类型检查通过。
- ESLint 通过，存在 4 条历史 `<img>` warning，无 error。
- Next.js production build 通过。

## 剩余风险

- 分类页右侧内容仍为静态 mock，只是为当前静态开发阶段提供切换反馈；后续真实分类接口确认后需要改为按一级分类拉取或映射真实二级/三级分类。
- 推广分享 `productId=1001` 是原生联调临时口径，正式接真实商品数据时需要按契约恢复为真实商品 id。
