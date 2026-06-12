# 2026-06-12 Java 后端来源 Header

## 范围

- 在 `createBackendClient()` 中为所有 Java / mall 后端出站请求统一添加 `source: "1"`。
- 保证调用方传入其它 `source` 值时仍以 App 来源 `1` 出站。
- 保证 Python 后端请求不携带 `source`。
- 更新 H5 BFF HTTP 鉴权契约、API 规范、项目状态和变更记录。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/server/http/backend-client.test.ts
pnpm exec vitest run src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/product/product-real-flow.test.tsx src/features/home/home-real-api.test.ts
pnpm typecheck
pnpm lint
```

## 当前结果

- TDD 红灯确认：新增 backend client 测试后，`pnpm exec vitest run src/server/http/backend-client.test.ts` 失败，失败点为 Java 请求缺少 `source: "1"`，以及调用方传入 `source: "2"` 未被覆盖。
- `pnpm exec vitest run src/server/http/backend-client.test.ts src/server/http/bff-context.test.ts src/features/product/product-real-flow.test.tsx src/features/home/home-real-api.test.ts`：通过，4 files / 38 tests。
- `pnpm test`：通过，44 files / 224 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。

## Lint Warning 说明

`pnpm lint` 剩余 4 条 warning 均来自 promotion 模块既有 `<img>` 使用：

- `src/features/promotion/components/PromotionActivitiesScreen.tsx`
- `src/features/promotion/components/PromotionActivityDetailScreen.tsx`
- `src/features/promotion/components/PromotionRewardRecordsScreen.tsx`

## 未覆盖事项

- 未执行真实 App WebView 联调；联调时可通过 BFF 后端调用日志确认 Java 出站 `requestHeaders.source` 为 `"1"`。
