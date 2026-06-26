# 2026-06-25 搜索结果商品真实接口联调

## 范围

- 新增 `/api/bff/search/products`，接入 Java `/p/app/prod/page`。
- 搜索结果页支持 `keyword/orderBy/categoryId`。
- 首页分类入口 `/search?categoryId=<id>` 无关键词也进入结果页，并限定后续分类筛选为当前类目子分类。
- 排序状态只保留销量和价格，两个条件互斥，同一条件点击切换升序/降序并高亮箭头。
- 分类筛选递归保留 Java `children/categories` 子孙树，点击后逐级展示所有已返回子孙类目，接口不返回子级时不展示本地兜底。
- 筛选区优化为“综合筛选”壳层、当前筛选摘要、销量/价格分段按钮和分级类目标题；排序/分类切换不修改 URL。
- 分类面板展开时展示蒙层并锁定页面滚动；点击分类项只更新待确认选中态，点击“确认”才请求接口，点击“重置”清空分类并重新请求。
- 搜索框、热门搜索、搜索历史入口 `/search?q=<keyword>` 不带 `categoryId`，按全局搜索处理。
- 不带分类入口时，分类筛选请求 `/category/list?parentId=0&shopId=0` 获取全局分类树。
- 商品结果有下一页时，底部哨兵进入视口自动加载下一页，不再展示“加载更多”按钮。
- 搜索结果页内再次搜索或清空关键词时不重置排序和分类筛选 state。
- 搜索输入框只保留 H5 自定义清空按钮，不使用浏览器原生 `type=search` 清除按钮。
- 搜索结果页首屏只展示骨架屏，不渲染本地 mock 商品或分类。
- 商品空数组使用设计系统通用 `EmptyState`，接口失败展示错误态，不拼接本地 mock 商品或分类。

## 验证

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/search/search-products-real-api.test.ts src/features/search/search.test.tsx
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
pnpm run ai:check-docs-sync --strict
```

- `pnpm exec vitest run src/features/search/search.test.tsx`：通过，1 file / 24 tests。
- `pnpm exec vitest run src/features/search`：通过，5 files / 41 tests。
- `pnpm test`：通过，56 files / 304 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- `pnpm run build`：通过，路由表包含 `/api/bff/search/products`、`/search`。
- `pnpm run ai:check-docs-sync --strict`：通过，共 15 个文件。
- HTTP smoke：
  - `/hybird/search?categoryId=110`：200。
  - `/hybird/api/bff/search/products?current=1&size=10&keyword=牛奶`：401，符合本地无 `mallToken` 的预期鉴权失败，路由非 404。

## 说明

- BFF 会把 `orderBy` 限制在 Java 白名单字段：`soldNum`、`price`、`createTime`。
- 带 `categoryId` 的入口会调用 `/category/list?parentId=<scopeCategoryId>&shopId=0` 获取子孙分类筛选项。
- 不带 `categoryId` 的入口会调用 `/category/list?parentId=0&shopId=0` 获取全局分类树。
- 点击分类筛选项后继续调用 `/category/list?parentId=<clickedCategoryId>&shopId=0` 获取当前类目的所有子孙类目。
- 如果 Java 响应已经包含 `children/categories` 子孙树，BFF 会递归保留，H5 点击父类目后直接展示其所有已返回子孙层级。
- 搜索结果页分类筛选场景默认不传 `depth`；分类页主页面的 `depth=3` 逻辑不受影响。
- 搜索结果商品有下一页时，由底部哨兵自动触发下一页请求并追加商品。
- 搜索结果页内提交新关键词或清空关键词时只更新本页 state，并通过 `history.replaceState` 同步 URL，不重新挂载页面。
- 商品详情跳转仍通过 `window.location.replace(buildClientHref(...))` 离开搜索页，保持 App 返回/滑动返回语义。

## 飞书同步

- 目标页面：`https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre`
- 仓库事实源：`.ai-workspace/product/page-inventory.md`
- `lark-cli docs +fetch --as user`：失败，`token_missing`，当前用户缺 `docx:document:readonly` 授权。
- `lark-cli docs +update --as bot`：返回外层 `ok=true`，但内部 `result=failed`，`4030004 No permission to operate on this document`，Bot 身份缺少目标文档查看/编辑权限。
- 2026-06-25 排序/分类筛选规则更新后再次尝试 `lark-cli docs +update --as bot`：仍返回内部 `result=failed`，`4030004 No permission to operate on this document`。
- 2026-06-25 移除搜索结果 mock 首屏兜底、分类接口改为 `/category/list` 后再次尝试 `lark-cli docs +update --as bot`：仍返回内部 `result=failed`，`4030004 No permission to operate on this document`，返回 revision 仍为 `12`。
- 2026-06-25 补充调整：搜索结果页分类筛选调用 `/category/list` 时默认不传 `depth`；`pnpm exec vitest run src/features/search/search-products-real-api.test.ts` 通过，1 file / 4 tests；`pnpm exec vitest run src/features/search` 通过，5 files / 37 tests；`pnpm typecheck` 通过。
- 2026-06-25 末次验证：`pnpm test` 通过，56 files / 304 tests；`pnpm lint` 通过，0 errors，4 warnings；`pnpm run build` 通过；`pnpm run ai:check-docs-sync --strict` 通过。
- 2026-06-25 飞书同步：用户补齐 docx 授权后，页面清单同步成功，revision `16`；关键词校验命中“默认不传 `depth` 获取所有子孙类目”。
- 2026-06-25 补充调整：递归保留 Java `children/categories` 子孙树并优化筛选 UI；`pnpm exec vitest run src/features/search/search-products-real-api.test.ts src/features/search/search.test.tsx` 通过，2 files / 27 tests；`pnpm exec vitest run src/features/search` 通过，5 files / 39 tests；`pnpm typecheck` 通过。
- 2026-06-25 补充调整：分类筛选面板新增蒙层、滚动锁定、确认和重置；点击类目不再立即请求接口；`pnpm exec vitest run src/features/search/search.test.tsx` 通过，1 file / 24 tests；`pnpm exec vitest run src/features/search` 通过，5 files / 41 tests；`pnpm typecheck` 通过。
- 2026-06-25 补充调整：无分类入口时分类查询改为 `parentId=0`；搜索结果分页改为底部哨兵自动加载下一页；`pnpm exec vitest run src/features/search/search-products-real-api.test.ts src/features/search/search.test.tsx` 通过，2 files / 30 tests。
- 2026-06-25 本次验证：`pnpm test` 通过，56 files / 305 tests；`pnpm typecheck` 通过；`pnpm lint` 通过，0 errors，4 warnings；`pnpm run build` 通过；`pnpm run ai:check-docs-sync --strict` 通过。
- 2026-06-25 补充调整：搜索结果页内再次搜索或清空关键词不再重置排序/分类筛选；输入框去掉浏览器原生 search 清除按钮；`pnpm exec vitest run src/features/search/search-products-real-api.test.ts src/features/search/search.test.tsx` 通过，2 files / 32 tests。
- 2026-06-25 本次验证：`pnpm test` 通过，56 files / 307 tests；`pnpm typecheck` 通过；`pnpm lint` 通过，0 errors，4 warnings；`pnpm run build` 通过；`pnpm run ai:check-docs-sync --strict` 通过。
- 2026-06-25 飞书同步：页面清单同步成功，revision `18`；关键词校验命中 `children/categories` 和“分类筛选递归展示”。
- 2026-06-25 飞书同步：页面清单同步成功，revision `20`；关键词校验命中“确认/重置”和“滚动锁定”。
- 2026-06-25 飞书同步：页面清单同步成功，revision `24`；关键词校验命中 `parentId=0` 和“自动加载下一页”。
- 2026-06-25 飞书同步：页面清单同步成功，revision `26`；关键词校验命中“不重置排序”和“自定义清空按钮”。
- `lark-cli` 提示当前 `1.0.48`，最新 `1.0.57`。
