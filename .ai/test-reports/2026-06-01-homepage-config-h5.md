# 首页配置 H5 验证记录

日期：2026-06-01

范围：`hybird-meumall` 首页配置消费、骨架屏、缓存、兜底和模块渲染。

## 验证命令

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm test -- src/features/home/home.test.tsx
pnpm test
pnpm typecheck
pnpm lint
pnpm build
```

## 结果

- `pnpm test -- src/features/home/home.test.tsx`：Vitest 当前执行 12 files / 72 tests，全部通过。
- `pnpm test`：12 files / 72 tests，全部通过。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。

## smoke

- 启动 `server-meumall` 于 `http://127.0.0.1:4100`。
- 发布 `configVersion=2026.06.01-smoke` 的首页配置。
- 打开 `http://localhost:3000/`，页面展示接口下发的 `Smoke 首页配置`、`配置分类` 和 `配置活动`。
- 验证过程中发现 H5 跨域被服务端 CORS 拦截，已在后端补充 `localhost:3000`、`127.0.0.1:3000`、`localhost:3109`、`127.0.0.1:3109`。
