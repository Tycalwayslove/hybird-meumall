# 验证：搜索首页热门词真实接口

## 日期

2026-06-24

## 范围

- `/api/bff/search/hot-keywords` -> Java `/search/hotSearch?type=1`
- `/search` 热门搜索词骨架、成功、空数据和失败口径
- 搜索历史 localStorage 写入、去重、上限和删除

## 命令

```bash
pnpm test src/features/search/search-history.test.ts src/features/search/search-real-api.test.ts src/features/search/search.test.tsx
pnpm typecheck
pnpm lint
curl -s http://localhost:3109/hybird/search
```

## 结果

- 搜索相关测试通过，3 files / 15 tests。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。
- 本地 SSR smoke：`/hybird/search` 首屏包含热门词骨架，不包含 mock 热词“保健品”，搜索历史展示本地空态。

## 备注

本次只接入搜索首页热门搜索词和本地搜索历史；搜索结果商品和完整热榜商品仍待后续真实接口联调。
