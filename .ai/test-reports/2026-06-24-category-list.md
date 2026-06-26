# 验证：商品分类页真实分类列表

## 日期

2026-06-24

## 范围

- `/api/bff/category/list` -> Java `/category/list?parentId=-1&shopId=0&depth=3`
- `/category` 首屏骨架、真实分类树、空态和失败态口径
- 分类 leaf 跳转 `/search?categoryId=<categoryId>`

## 命令

```bash
pnpm test src/features/category/category-real-api.test.ts src/app/category/page.test.tsx
pnpm typecheck
pnpm lint
curl -s http://localhost:3109/hybird/category
```

## 结果

- 分类相关测试通过，2 files / 3 tests。
- `pnpm typecheck` 通过。
- `pnpm lint` 通过，0 errors，4 warnings；warning 均为既有 promotion 页面 `<img>` 规则提示。
- 本地 SSR smoke：`/hybird/category` 首屏包含分类骨架，不包含 mock“一级分类/二级分类/三级分类”。

## 备注

本次只接入商品分类树；分类结果商品列表仍通过后续搜索/列表接口联调。
