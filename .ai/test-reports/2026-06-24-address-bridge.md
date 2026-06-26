# 2026-06-24 地址 Bridge 接入验证

## 范围

- H5 Bridge typed RPC 新增 `address.getDefault`、`address.getList`、`address.getInfo`、`address.save`、`address.setDefault`、`address.delete`。
- H5 Bridge typed RPC 预留 `address.chooseLocation`；当前只发起 Bridge 调用、输出本地调试日志，App 后续提供真实定位。
- 新增 `createHybridAddressApi()`，地址能力优先走 App Bridge，失败时回退 H5 BFF。
- 商品详情配送行展示 Bridge 默认地址，并带 `addrId` 请求 `/api/bff/product-detail`。
- 订单确认无 `addressId` 时先通过 Bridge 获取默认地址，再请求 `/api/bff/order-confirm`。
- `/address`、`/address/edit` 地址管理页使用 Hybrid Address API。
- `/address/edit` 省市区从空输入改为 `/api/bff/address/regions` -> Java `/p/area/listByPid` 真实接口级联；接口未返回时不展示本地选项。
- `/address/edit?addrId=<addrId>` 编辑地址回显时，会先读取地址详情，再按 `provinceId -> cityId -> areaId` 依次请求真实省市区接口，补齐 select options 后再回显；接口未匹配时不合成本地选项。
- App debug Bridge receiver 已移除内置地址样例，避免返回与后端不一致的调试收货地址；本轮验收只覆盖 H5。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/lib/bridge/protocol-bridge.test.ts src/features/mine-secondary/address-hybrid-api.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/product/product-detail.test.tsx src/features/product/product-real-flow.test.tsx src/features/product/order-confirm.test.tsx
pnpm exec vitest run src/features/mine-secondary/address-region-hydration.test.ts src/features/mine-secondary/address-real-service.test.ts src/features/mine-secondary/address-pages.test.tsx src/features/mine-secondary/address-hybrid-api.test.ts
pnpm typecheck
pnpm lint
pnpm test
pnpm run build
pnpm run ai:check-docs-sync --strict
```

## 结果

- H5 定向测试：6 files / 33 tests 通过。
- 地址定位预留、省市区真实接口级联和移除本地地址/区域兜底后，H5 定向测试：4 files / 14 tests 通过。
- 编辑地址省市区回显修正后，地址相关测试：4 files / 12 tests 通过。
- TypeScript：通过。
- ESLint：0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- H5 全量测试：54 files / 276 tests 通过。
- Next build：通过；路由表包含 `/product/[id]`、`/order-confirm`、`/address`、`/address/edit` 和 `/api/bff/address/*`。
- 本轮用户明确只验 H5；iOS 构建/测试不作为本次完成标准。

## 知识库同步

- 页面清单目标：`https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre`
- Bridge / 路由对接说明目标：`https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf`
- 本地事实源已更新：
  - `.ai-workspace/product/page-inventory.md`
  - `.ai-workspace/integration-briefs/BRIEF-2026-0605-h5-native-route-map.md`
  - `.ai-workspace/contracts/native-bridge/meumall-bridge-protocol.md`
  - `hybird-meumall/docs/02_NATIVE_BRIDGE_SPEC.md`
  - `hybird-meumall/docs/05_API_SPEC.md`
- 飞书同步结果：阻塞，未完成。

### 阻塞原因

- `lark-cli docs +update --as user` 返回 `token_missing`：当前 user 身份缺少 keychain token，需要重新执行 `lark-cli auth login`。
- `lark-cli docs +update --as bot` 能调用接口，但目标页面返回 `4030004`：Bot 身份缺少目标文档查看/编辑权限。

### 恢复动作

1. 重新授权 user：`lark-cli auth login`，或给 Bot 身份授予两个飞书知识库页面编辑权限。
2. 重新同步：
   - 页面清单：`.ai-workspace/product/page-inventory.md` -> `https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre`
   - Bridge 对接说明：`.ai-workspace/integration-briefs/BRIEF-2026-0605-h5-native-route-map.md` -> `https://v05ctaei9gn.feishu.cn/wiki/OJk1wa43PiR9lTkYs2YcW8llnmf`
3. 同步后补写 revision，并把 `TASK-2026-0624-016-h5-address-bridge.md` 状态从 `blocked` 推进到 `verified`。
