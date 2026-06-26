# 2026-06-26 搜索历史单条删除

## 范围

- `/search` 搜索首页的搜索历史标签支持单条删除。
- 顶部垃圾桶按钮仍保留“清空全部历史”语义。
- 搜索历史仍只使用浏览器 localStorage `meumall.search.history`，不接后端接口。

## 实现

- `src/features/search/search-history.ts`
  - 新增 `removeSearchHistoryKeyword(storage, keyword)`。
  - 删除指定关键词后保留其它历史；最后一条被删除时移除 storage key。
- `src/features/search/components/SearchScreen.tsx`
  - 搜索历史标签右侧新增单条删除按钮。
  - 删除单条历史时同步更新 localStorage 和当前页面状态。
- `src/features/search/components/SearchScreen.module.css`
  - 新增历史标签组合样式和单条删除按钮样式。

## 验证

- `pnpm exec vitest run src/features/search/search-history.test.ts src/features/search/search.test.tsx`：通过，2 files / 33 tests。
- `pnpm exec vitest run src/features/search`：通过，5 files / 46 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 规则提示。

## 文档

- 更新 `docs/05_API_SPEC.md`、`docs/08_CHANGELOG.md`、`.ai/PROJECT_STATE.md`、`.ai/TODO.md`、`.ai/CHANGE_SUMMARY.md`。
- 更新根级契约 `.ai-workspace/contracts/api/h5-search-hot-keywords-contract.md`。

## 时间

- 验证时间：2026-06-26 10:52:50 CST。
