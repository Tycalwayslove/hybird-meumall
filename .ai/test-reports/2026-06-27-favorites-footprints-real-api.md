# 验证：我的收藏和我的足迹真实接口迁移

## 日期

2026-06-27

## 范围

- H5 BFF service mapper。
- 浏览器端 feature API adapter。
- `/favorites/products` 和 `/footprints` 页面 loading/mock 移除回归。
- 本地 SSR 页面可访问性冒烟。

## 命令

```bash
pnpm exec vitest run src/features/mine-secondary/collections-real-service.test.ts src/features/mine-secondary/collections-api.test.ts src/features/mine-secondary/mine-secondary-pages.test.tsx
pnpm typecheck
git diff --check
curl -I http://localhost:3109/hybird/favorites/products
curl -I http://localhost:3109/hybird/footprints
```

## 结果

- Vitest 通过，3 files / 12 tests。
- TypeScript typecheck 通过。
- `git diff --check` 通过。
- `/hybird/favorites/products` 返回 200 OK。
- `/hybird/footprints` 返回 200 OK。

## 备注

- 未在 App WebView 内使用真实 `mallToken` 验证 Java 真实数据和删除动作；该项保留在 `.ai/TODO.md`。
