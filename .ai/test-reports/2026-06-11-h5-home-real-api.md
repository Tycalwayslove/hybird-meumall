# H5 首页真实接口首批接入验证记录

## 范围

- 首页 BFF route：`/api/bff/home`。
- 首页推荐商品分页 BFF route：`/api/bff/home/recommend-products?current=<current>&size=<size>`。
- 首页“为您推荐”区下滑加载更多：按 `current + 1` 请求下一页并追加商品，加载到第 2 页后显示回到顶部按钮。
- 相似推荐商品页：`/home/recommend-products`。
- 相似推荐商品分页 BFF route：`/api/bff/home/for-you-products?current=<current>&size=<size>`。
- 相似推荐商品页下拉加载更多：按 `current + 1` 请求下一页并追加商品。
- Java 后端接口：
  - `/p/app/home/index`
  - `/p/app/home/recommendProds?current=<current>&size=<size>`
  - `/p/app/home/forYouProds?current=<current>&size=<size>`
- 首页 mapper：Apifox 字段到 `HomeBffData`、`HomeRecommendProductsBffData` 和 `HomeForYouProductsBffData`，其中 `view` 为当前页面渲染模型，`modules` 保留业务模块字段，`debugRaw` 仅 local/test 按需返回 Java 原始 envelope。
- 首页客户端 fallback。

## 验证命令

```bash
cd hybird-meumall
pnpm test src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/server/http/java-response-codes.test.ts src/features/home/home-real-api.test.ts src/features/home/home.test.tsx src/features/home/home-recommend-products.test.tsx
pnpm typecheck
pnpm lint
cd ..
pnpm run check
curl -I --max-time 10 http://localhost:3109/hybird/home/recommend-products
curl -I --max-time 10 http://localhost:3109/hybird
```

## 验证结果

- `pnpm test ...`：通过，6 files / 42 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，存在 4 条历史 `<img>` warning，无 error。
- 根目录 `pnpm run check`：通过。
- `curl -I http://localhost:3109/hybird/home/recommend-products`：返回 HTTP 200。
- `curl -I http://localhost:3109/hybird`：返回 HTTP 200。

## 本轮补充覆盖点

- `/api/bff/home` 首屏核心 service 只请求 `/p/app/home/index`，不再顺序等待 `/p/app/home/forYouProds`。
- 首页推荐分页 service 按 `current/size` 构造 `/p/app/home/recommendProds` 请求，并返回 `page.current`、`page.size`、`page.total`、`page.pages`、`page.hasMore`。
- 首页“为您推荐”区加载下一页时，请求参数为 `current = 当前页 + 1`、`size = 当前页 size`，成功后追加商品；加载到第 2 页后展示“顶部”按钮。
- 相似推荐商品分页 service 按 `current/size` 构造 `/p/app/home/forYouProds` 请求，并返回相同分页信息。
- 首页“为您推荐”右侧“更多”跳转 `/home/recommend-products`；新页面标题为“相似推荐商品”，包含搜索栏、筛选条件、商品列表和下拉加载更多。
- 相似推荐商品页加载下一页时，请求参数为 `current = 当前页 + 1`、`size = 当前页 size`，成功后追加商品并更新 `hasMore`。
- `modules` 保留 `hotCategory.top3`、`seckillModule.products`、`bestCoupon`、`commissionAmount`、`couponDiscountAmount`、`hasMultiSku` 等字段，避免后续首页扩展时找不到 Java 返回字段。

## 接口连通性

直接请求旧 Apifox Java 测试环境：

```bash
curl http://8.134.190.119:8086/p/app/home/index
curl 'http://8.134.190.119:8086/p/app/home/forYouProds?current=1&size=10'
```

结果均返回：

```json
{"code":"A00004","msg":"Unauthorized","data":null,"version":"mall4j.v231225","timestamp":null,"sign":null,"success":false}
```

说明接口需要有效 `mallToken`。

## 本地运行说明

本地 H5 需要带后端环境变量启动：

```bash
pnpm dev:h5
# 或
cd hybird-meumall
pnpm dev:local
```

当前 `config/env/h5.local.env` 会注入：

- `JAVA_API_BASE_URL=https://test.aigcpop.com/mini_h5`
- `PYTHON_API_BASE_URL=https://test.aigcpop.com/api`

当前机器已有一个 3000 dev server 在运行，但启动时未带 `JAVA_API_BASE_URL`，因此 `/api/bff/home` 返回 `JAVA_API_BASE_URL is required`。

## 剩余风险

- 需要 App/WebView 写入真实 `mallToken` Cookie 后验证首页真实数据效果。
- banner `jumpType` 的最终跳转语义还需要后端/产品确认。
- 商品详情和搜索真实接口尚未接入，首页点击后仍可能进入静态页。
