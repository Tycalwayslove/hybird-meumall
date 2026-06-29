# 验证：地址模块路由选择流优化

## 日期

2026-06-29

## 范围

地址选择流 helper、地址列表/编辑页、商品详情配送地址选择、订单确认地址选择和交易链路回归。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx src/features/product/product-real-flow.test.tsx
pnpm typecheck
pnpm exec eslint src/features/mine-secondary/address-flow.ts src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/components/AddressScreens.tsx src/app/address/page.tsx src/app/address/edit/page.tsx src/features/product/components/ProductDetailScreen.tsx src/features/product/components/OrderConfirmScreen.tsx 'src/app/product/[id]/page.tsx'
```

## 结果

- Vitest：通过，6 files / 37 tests。
- TypeScript：通过。
- 本次改动文件 ESLint：通过。

## 备注

自动化验证覆盖 URL 生成、选择态参数保留、一次性地址选择结果和交易相关页面回归。App WebView 系统手势返回仍需真机或模拟器人工验证。

`pnpm lint -- <paths>` 会执行项目脚本中的 `eslint .`，因此扫描到既有 `OrdersScreen`、`ProductCollectionScreen`、`RefundsScreen` 的 `react-hooks/set-state-in-effect` 错误；这些文件不是本次地址流改动范围，已改用 `pnpm exec eslint <本次文件>` 做聚焦验证。
