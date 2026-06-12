# 2026-06-12 原生页 Bridge Route 直出

## 范围

- `openNativePage("settings")` Bridge payload 为：

```json
{ "module": "router", "action": "navigate", "payload": { "route": "settings" } }
```

- 其它原生页也直接使用页面名作为 `payload.route`，例如 `openNativePage("address", { "source": "mine" })` 会发送：

```json
{ "module": "router", "action": "navigate", "payload": { "route": "address", "params": { "source": "mine" } } }
```

- 不再发送 `route: "native_page"` 或 `params.name`。
- 更新 Native Bridge 规范、根级 Bridge 契约、原生路由对接说明、项目状态和变更摘要。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/lib/navigation/hybrid-navigation.test.ts src/lib/bridge/protocol-bridge.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
pnpm lint
```

## 当前结果

- TDD 红灯确认：扩展 `hybrid-navigation` 测试后，非 settings 原生页旧实现发出 `route: "native_page"` + `params.name=<name>`，测试失败。
- `pnpm exec vitest run src/lib/navigation/hybrid-navigation.test.ts src/lib/bridge/protocol-bridge.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx`：通过，3 files / 12 tests。
- `pnpm test`：通过，44 files / 225 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。

## Lint Warning 说明

`pnpm lint` 剩余 4 条 warning 均来自 promotion 模块既有 `<img>` 使用：

- `src/features/promotion/components/PromotionActivitiesScreen.tsx`
- `src/features/promotion/components/PromotionActivityDetailScreen.tsx`
- `src/features/promotion/components/PromotionRewardRecordsScreen.tsx`

## 未覆盖事项

- 未执行真实 App 原生页跳转联调；联调时可点击我的页设置入口，确认原生收到 `router/navigate route=settings`。后续若接入地址管理、登录等原生页，应确认对应页面名 route 可被原生消费。
