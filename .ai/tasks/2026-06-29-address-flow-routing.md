# 任务：地址模块路由选择流优化

## 状态

verified

## 目标

优化商品详情、订单确认和地址模块之间的路由跳转关系，解决选择、修改、新增地址后来源页状态丢失，以及 H5 导航栏返回和 App 手势返回历史栈不一致的问题。

## 范围

- 包含：
  - `/address` 管理态和选择态上下文统一。
  - `/address/edit` 新增/编辑页保留地址流上下文。
  - 商品详情配送行进入地址选择并按选中 `addrId` 重拉商品详情。
  - 订单确认地址卡进入地址选择并按选中 `addrId` 重拉订单确认。
  - 地址选择流文档和项目状态同步。
- 不包含：
  - 新增 Native Bridge 方法。
  - 改造 App 原生手势实现。
  - 自提、同城、地图选点和完整区域树。

## 上下文

- 相关文档：
  - `docs/02_NATIVE_BRIDGE_SPEC.md`
  - `docs/05_API_SPEC.md`
  - `.ai/PROJECT_STATE.md`
  - `.ai-workspace/product/page-inventory.md`
- 相关文件：
  - `src/features/mine-secondary/address-flow.ts`
  - `src/features/mine-secondary/components/AddressScreens.tsx`
  - `src/features/product/components/ProductDetailScreen.tsx`
  - `src/features/product/components/OrderConfirmScreen.tsx`

## 验收标准

- [x] 订单确认地址卡进入 `/address?select=1&from=order-confirm&flowId=...`。
- [x] 商品详情配送行进入 `/address?select=1&from=product-detail&flowId=...`。
- [x] 地址新增/编辑页保留选择态上下文。
- [x] 选择地址后通过一次性 `sessionStorage` 结果和 `history.back()` 返回来源页。
- [x] 来源页消费地址结果后更新 URL 并重新请求业务接口。
- [x] 文档同步地址选择流和 App 手势返回预期。

## 验证

- 命令：

```bash
pnpm exec vitest run src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts src/features/product/product-detail.test.tsx src/features/product/order-confirm.test.tsx src/features/product/product-real-flow.test.tsx
pnpm typecheck
pnpm exec eslint src/features/mine-secondary/address-flow.ts src/features/mine-secondary/address-flow.test.ts src/features/mine-secondary/components/AddressScreens.tsx src/app/address/page.tsx src/app/address/edit/page.tsx src/features/product/components/ProductDetailScreen.tsx src/features/product/components/OrderConfirmScreen.tsx 'src/app/product/[id]/page.tsx'
```

- 结果：通过。

## 备注

本次不要求原生 App 增加新 Bridge 能力；App 继续按 `router/navigate route=back` 处理导航栏返回，系统手势返回依赖 WebView history。

飞书同步：

- H5 页面清单与开发进度：<https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre>，revision_id=39。
- H5 与原生 App 路由跳转对接说明：<https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf>，revision_id=88。

## 标签

- H5
- 地址
- 路由

## 风险和假设

- 外部 App/WebView 手势返回行为仍需由外部运行环境保证，H5 只维护 history 和 fallback。
