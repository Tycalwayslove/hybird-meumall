# 2026-06-12 收货地址模块验证记录

## 范围

- `/address` 收货地址列表页。
- `/address/edit` 新增/编辑收货地址页。
- 我的页“地址管理”入口。
- 订单确认页地址选择入口。
- `addressId/addrId` 在订单确认和订单提交 BFF 链路中的传递。

## 关键变更

- 地址列表页当前使用本地 mock 地址数据，字段对齐旧 Java 地址对象。
- 地址空态图和定位图标从旧 uni-app 项目复制到 `public/assets/address/`，并通过 `localAssetUrl()` 使用。
- `/order-confirm` 地址卡跳转 `/address?select=1`，地址列表选择后回到 `/order-confirm?addressId=<addrId>`。
- `/api/bff/order-confirm` 支持 query `addrId`，并先通过 Java `/p/address/addrInfo/{addrId|0}` 解析默认/选中地址。
- `/api/bff/order-submit` 支持 body `addrId`，无收货地址时返回 409，不创建订单。
- 新增 `/api/bff/address/list`、`/api/bff/address/info`、`/api/bff/address/save`、`/api/bff/address/default`、`/api/bff/address/delete`，接入旧 Java 地址列表、详情、新增、编辑、设默认和删除接口。
- 地址页不保留本地 mock fallback；真实 App WebView 有 `mallToken` 时以 Bridge/BFF 数据为准，接口无数据时展示空态或错误提示。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/mine-secondary/address-pages.test.tsx
pnpm exec vitest run src/features/mine-secondary/address-real-service.test.ts src/features/mine-secondary/address-pages.test.tsx
pnpm exec vitest run src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/mine-secondary-pages.test.tsx src/features/product/order-confirm.test.tsx src/features/product/product-real-flow.test.tsx
pnpm test
pnpm typecheck
pnpm lint
curl -I http://localhost:3109/hybird/address
pnpm run build
```

## 结果

- 地址模块测试：1 file / 4 tests 通过。
- 地址真实服务和页面测试：2 files / 6 tests 通过。
- 地址、个人中心二级页、订单确认、商品真实链路回归：4 files / 25 tests 通过。
- 全量测试：47 files / 239 tests 通过。
- TypeScript：通过。
- ESLint：0 errors，4 warnings。
- Next build：通过，路由表包含 `/address`、`/address/edit`、`/api/bff/address/*` 和 `/api/bff/order-submit`。
- HTTP smoke：`/hybird/address`、`/hybird/address?state=empty`、`/hybird/address/edit`、`/hybird/order-confirm?productId=p-1001&skuId=shirt-m&quantity=1` 均返回 200 且包含关键文案。
- 地址 BFF smoke：`/hybird/api/bff/address/list` 返回 200 JSON，当前环境地址列表为空。
- 资产 smoke：`/hybird/assets/address/empty-address.png` 和 `/hybird/assets/address/location.png` 均返回 200 `image/png`。
- 浏览器 smoke：`/hybird/address` 可见“收货地址 / 默认地址 / 新增收货地址”；`/hybird/address/edit` 可见“收货人 / 手机号码 / 保存”。

## 已知限制

- 地址列表、新增、编辑、删除、设默认已接真实 BFF；无 token 或接口失败时页面展示空态或错误提示，不展示本地样例地址。
- 省市区联动和地图定位尚未接入。
- 地址保存当前使用省/市/区输入态，后续需要补行政区选择器或地图定位选点。

## 飞书同步

- 已同步到公司知识库「H5 页面清单与开发进度」：<https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre>
- 同步结果：success。
- 飞书 revision：12。
- 同步时间：2026-06-12 18:01。
