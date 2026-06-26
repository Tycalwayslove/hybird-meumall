# 2026-06-26 首页 navType 与分类跳转口径

## 范围

- 首页 Java `/p/app/home/index` 的 `navList.navType` 路由分流。
- 商品分类页 leaf 点击与首页 `navType=2` 保持同一类目搜索口径。

## 规则

- `navType=1`：进入 `/search/ranking`。
  - 若 Java 同时返回 `rankType/categoryId`，H5 进入 `/search/ranking?rankType=<rankType>&categoryId=<categoryId>`，用于完整热榜页默认选中对应标签。
  - 普通喵呜热榜 `rankType=1` 且无 `categoryId` 时保持 `/search/ranking`。
- `navType=2`：进入 `/search?categoryId=<categoryId>`。
- `navType=3`：进入 `/category`。
- `/category` 商品分类 leaf 点击进入 `/search?categoryId=<categoryId>`，与 `navType=2` 一致。

## 验证

- `pnpm exec vitest run src/features/home/home-real-api.test.ts --testNamePattern "routes home navType"`：先失败，确认旧实现丢失 `rankType/categoryId`。
- `pnpm exec vitest run src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，2 files / 28 tests。
- `pnpm exec vitest run src/features/category/category-real-api.test.ts src/app/category/page.test.tsx`：通过，2 files / 3 tests。
- `pnpm exec vitest run src/features/home/home-real-api.test.ts src/features/home/home.test.tsx src/features/category/category-real-api.test.ts src/app/category/page.test.tsx src/features/search/search.test.tsx`：通过，5 files / 59 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。
- `pnpm run ai:check-docs-sync --strict`：通过，共 15 个文件。

## 飞书同步

- 同步页面：[H5 页面清单与开发进度](https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre)
- 同步方式：`lark-cli docs +update --api-version v2 --as user --command overwrite --doc-format markdown`
- 同步结果：success。
- 飞书 revision：34。
- 关键词校验：
  - `navType=1` 命中首页路由说明。
  - `leaf 点击与首页` 命中商品分类页说明。

## 时间

- 验证时间：2026-06-26 17:00:39 CST。
