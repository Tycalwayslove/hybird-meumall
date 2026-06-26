# 2026-06-24 秒杀和推广商品真实分页联调验证

## 范围

- `/api/bff/seckill/products` -> Java `/p/app/home/seckillProds`
- `/api/bff/promotion/products` -> Java `/p/distribution/prod/productPage`
- `/seckill`
- `/promotion/products`

## 验证命令

```bash
pnpm test src/features/seckill/seckill.test.tsx src/features/promotion/promotion-products.test.tsx
pnpm typecheck
pnpm lint
```

## 结果

- `pnpm test src/features/seckill/seckill.test.tsx src/features/promotion/promotion-products.test.tsx`：通过，2 files / 15 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。

## 说明

- lint warning 均来自既有 promotion 页面 `<img>` 使用，不是本次新增错误。
- 链调阶段已覆盖 Java 空列表不拼接本地 mock，页面展示空态。
- 尚未执行真实 App WebView token 人工联调；需要 App 注入有效 `mallToken` 后继续验证真实响应、分页和图片。
