# 验证：钱包账户卡片入口布局调整

## 日期

2026-07-01

## 范围

- 钱包账户卡片 `提现` 按钮位置。
- 钱包账户卡片 `提现记录` 入口展示。
- 订单列表保持无筛选、无总述和无详情箭头。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx -t "renders wallet real data"
pnpm typecheck
```

## 结果

- Vitest 通过，1 test。
- TypeScript typecheck 通过。

## 备注

- 本次仅调整钱包页 UI 展示，不涉及 BFF 或后端接口契约。
