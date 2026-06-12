# 2026-06-12 商品详情富文本内容渲染

## 范围

- 新增 `ProductRichContent` 组件。
- 使用 `sanitize-html` 清洗 `/prod/prodInfo.content`。
- 使用 `html-react-parser` 将清洗后的 HTML 渲染为 React 节点。
- 富文本图片相对路径按 `JAVA_OSS_ASSET_BASE_URL` 拼接。
- 商品详情内容区优先展示 `view.detail.richContentHtml`，缺失时回退原有详情描述和占位图。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/product/product-rich-content.test.tsx src/features/product/product-real-flow.test.tsx
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
```

## 结果

- `pnpm exec vitest run src/features/product/product-rich-content.test.tsx src/features/product/product-real-flow.test.tsx`：通过，2 files / 11 tests。
- `pnpm test`：通过，43 files / 214 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。
- `pnpm run build`：通过。

## Lint Warning 说明

`pnpm lint` 剩余 4 条 warning 均来自 promotion 模块既有 `<img>` 使用：

- `src/features/promotion/components/PromotionActivitiesScreen.tsx`
- `src/features/promotion/components/PromotionActivityDetailScreen.tsx`
- `src/features/promotion/components/PromotionRewardRecordsScreen.tsx`

本次商品详情富文本改造未新增 lint warning。

## 未覆盖事项

- 未执行带真实 App `mallToken` 的端上联调；后续需在测试包 WebView 中打开 `/hybird/product/1000054` 验证真实 `content` 富文本展示。
- 富文本安全白名单不包含 `script`、`iframe`、事件属性和危险协议；如果后端或运营内容需要扩展标签，需先更新契约。
