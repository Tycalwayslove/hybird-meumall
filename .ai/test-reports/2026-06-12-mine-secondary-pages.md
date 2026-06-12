# 2026-06-12 个人中心二级页静态高保真验证

## 范围

- `/wallet`
- `/favorites/products`
- `/favorites/products?edit=1`
- `/footprints`
- `/coupons`
- `/orders?status=all`
- `/orders?status=pending-receipt`
- `/orders?status=empty`
- `/mine` 入口联动

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts
pnpm typecheck
```

结果：通过，2 files / 12 tests，TypeScript 无错误。

## HTTP Smoke

使用本地 dev server `http://localhost:3109`，Node `fetch` 检查：

```text
200 /hybird/wallet
200 /hybird/favorites/products
200 /hybird/favorites/products?edit=1
200 /hybird/footprints
200 /hybird/coupons
200 /hybird/orders?status=all
200 /hybird/orders?status=pending-receipt
200 /hybird/orders?status=empty
200 /hybird/mine
```

## 截图检查

- Chrome headless 390x844：生成钱包、收藏、收藏编辑、订单、订单空态截图；本机 headless 输出存在 430px WebView 容器被裁到 390px 的偏差。
- Chrome headless 430x844：生成钱包、收藏、订单截图，完整容器下页面结构、卡片、导航、tab、底部操作和金额展示正常。

截图位置：

- `/tmp/meumall-mine-secondary-shots/`
- `/tmp/meumall-mine-secondary-shots-430/`

## 钱包 Tab 回归

2026-06-12 追加验证：

- 钱包“已结算/待结算”切换改为页面内 state，不再渲染 `/wallet?tab=...` 链接。
- 使用 Chrome DevTools 协议点击“待结算”后：
  - URL 保持 `http://localhost:3109/hybird/wallet`
  - `aria-selected="true"` 的 tab 从“已结算”变为“待结算”
  - 页面数据切换到“待结算-商品推广奖励”等待结算 mock 数据
- 追加命令 `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts && pnpm typecheck` 通过。

## 订单 Tab 回归

2026-06-12 追加验证：

- 订单“全部/待付款/待发货/待收货/已完成”切换改为页面内 state，不再渲染 `/orders?status=...` 链接。
- URL query 仍可作为页面首次进入时的初始状态，例如 `/hybird/orders?status=pending-receipt` 返回 200。
- 使用 Chrome DevTools 协议从 `/hybird/orders` 点击“待收货”后：
  - URL 保持 `http://localhost:3109/hybird/orders`
  - `aria-selected="true"` 的 tab 从“全部”变为“待收货”
  - 订单卡数量从 4 条变为 1 条
- 追加命令 `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts && pnpm typecheck` 通过。

## 收藏/足迹删除确认回归

2026-06-12 追加验证：

- 我的收藏/我的足迹编辑态在有选中商品时，点击底部“删除”会打开确认框。
- 使用 Chrome DevTools 协议打开 `/hybird/favorites/products?edit=1` 并点击“删除”后：
  - 页面出现 `role="dialog"`
  - 标题为“确认删除”
  - 文案为“确定删除已选的 8 个商品吗？”
  - 操作按钮为“取消”和“删除”
- 追加命令 `pnpm exec vitest run src/features/mine-secondary/mine-secondary-pages.test.tsx src/lib/assets/asset-url.test.ts && pnpm typecheck` 通过。

## 结论

通过。当前页面为静态 mock 高保真，不含真实钱包流水、收藏/足迹删除、优惠券使用或订单操作业务动作；后续接真实接口时需另建接口契约与联调任务。
