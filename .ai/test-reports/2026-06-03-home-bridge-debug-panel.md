# 验证：首页 Bridge 调试面板

## 日期

2026-06-03

## 范围

验证 H5 首页 Bridge 调试面板和统一信封 runtime。

## 命令

```bash
pnpm test src/lib/bridge/protocol-bridge.test.ts
pnpm typecheck
pnpm build
pnpm run dev:h5 # 根目录执行，用于本地打开 /hybird
curl -I http://localhost:3109/hybird
```

## 结果

- 已先运行 `pnpm test src/lib/bridge/protocol-bridge.test.ts`，确认缺少 `protocol-bridge` 模块导致失败。
- 新增实现后，`src/lib/bridge/protocol-bridge.test.ts` 通过，覆盖 router/event 信封发送和 RPC resolve。
- `pnpm typecheck` 通过。
- `pnpm build` 通过。
- 本地 H5 dev server `http://localhost:3109/hybird` 返回 200。

## 限制

- 当前环境没有可用 Playwright，本次未生成浏览器截图。
- 线上测试 H5 尚未发布本次变更；首页调试面板当前只在本地 dev/build 中验证。
