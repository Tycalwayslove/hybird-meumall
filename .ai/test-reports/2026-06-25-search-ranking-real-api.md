# 2026-06-25 搜索热榜真实接口联调

## 范围

- `/api/bff/search/ranking` 聚合 Java `/search/rankTabs` 和 `/search/rank/{rankType}`。
- `/search` 下方热榜标签和商品列表改为真实 BFF 数据源；标签接口传 `categoryBoardCount=4`，商品展示截前三条。
- `/search/ranking` 完整热榜页复用同一套真实 BFF 和标签切换逻辑；标签接口不传 `categoryBoardCount`，商品列表完整展示。
- `/search` 热榜区域铺满剩余视口高度，展示热榜背景色。
- `/search` 离开到完整榜单、热榜商品详情或搜索结果商品详情时使用 replace 式跳转，避免 App 返回/滑动返回停回搜索页。
- 不涉及搜索结果页商品搜索接口。

## 验证

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/search
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
```

- `pnpm exec vitest run src/features/search`：通过，4 files / 20 tests。
- `pnpm test`：通过，55 files / 288 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- `pnpm run build`：通过，路由表包含 `/api/bff/search/ranking`、`/search` 和 `/search/ranking`。
- 补充验证：`pnpm exec vitest run src/features/search/search.test.tsx src/features/search/search-ranking-real-api.test.ts` 通过，2 files / 21 tests；覆盖热榜商品为空时使用通用 `EmptyState`、当前已选标签再次点击不会触发重复刷新、`/search` 首页传 `categoryBoardCount=4`、完整榜单不传该参数、热榜区域铺满剩余高度、搜索离开跳转使用 replace。
- 补充验证：`pnpm typecheck && pnpm lint` 通过；lint 仍仅有 promotion 模块既有 4 条 `<img>` warning。
- `pnpm run ai:check-docs-sync --strict`：通过，共 15 个文件。
- HTTP smoke：
  - `/hybird/search`：200。
  - `/hybird/search/ranking`：200。
  - `/hybird/api/bff/search/ranking?categoryBoardCount=4`：200，返回真实 `products` 数据。
  - `/hybird/api/bff/search/ranking`：200，返回真实 `products` 数据。

## 说明

- 搜索热榜首屏展示骨架屏，不再展示本地 mock 热榜商品。
- Java 返回空标签或空商品时使用设计系统通用 `EmptyState` 展示空态；接口失败展示“热榜加载失败”并提供重新加载。
- 当前已选热榜标签带 `aria-disabled="true"`，点击时不会重新请求当前标签数据。
- 搜索首页热榜标签限制为 4 个，商品只展示前三条；点击“查看完整榜单”进入 `/search/ranking` 后标签接口不带数量限制，商品完整展示。
- 点击“查看完整榜单”会携带当前标签参数：喵呜热榜带 `rankType=1`，品类热榜带 `rankType=2&categoryId=<categoryId>`；完整榜单页按该参数默认选中对应标签。
- 完整榜单页内切换标签只更新组件 state 和 BFF 请求，不操作路由、不追加 history，避免返回链路异常。
- 搜索页热榜商品为空时复用通用 `EmptyState`，但空态容器背景透明，不使用白底卡片。
- 点击完整榜单、热榜商品或搜索结果商品时，H5 通过 `window.location.replace(buildClientHref(...))` 离开搜索页；普通修饰键点击仍保留浏览器默认行为。
- 本地 shell PATH 缺少 `curl/head/tr`，smoke 使用 `/usr/bin/curl`、`/usr/bin/head` 和 `/usr/bin/tr` 执行。

## 飞书同步

- 目标页面：`https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre`
- 仓库事实源：`.ai-workspace/product/page-inventory.md`
- `lark-cli docs +update --as user`：失败，`token_missing`，需要重新执行 `lark-cli auth login` 授权 `docx:document:write_only` 和 `docx:document:readonly`。
- `lark-cli docs +update --as bot`：返回外层 `ok=true`，但内部 `result=failed`，`4030004 No permission to operate on this document`，Bot 身份缺少目标文档查看/编辑权限。
- 2026-06-25 补充同步：因热榜参数、布局规则和搜索离开跳转规则更新，再次尝试同步页面清单；user 仍返回 `token_missing`，bot 仍返回 `4030004 No permission`，未能写入飞书 revision。
- 2026-06-25 补充验证：`pnpm exec vitest run src/features/search/search.test.tsx` 通过，1 file / 21 tests；`pnpm exec vitest run src/features/search` 通过，5 files / 37 tests；`pnpm typecheck` 通过。
- 2026-06-25 末次验证：
  - `pnpm exec vitest run src/features/search/search.test.tsx src/features/search`：通过，5 files / 37 tests。
  - `pnpm test`：通过，56 files / 300 tests。
  - `pnpm typecheck`：通过。
  - `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
  - `pnpm run build`：通过，构建路由包含 `/search`、`/search/ranking` 和 `/api/bff/search/ranking`。
  - `pnpm run ai:check-docs-sync --strict`：通过，共 15 个文件。
- 2026-06-25 末次飞书同步：
  - 用户补齐 docx 授权后，`lark-cli docs +update --as user` 同步成功。
  - 飞书 revision：`14`。
  - 关键词校验命中：`完整榜单携带当前热榜标签`、`页内切换标签只更新 state`。
- `lark-cli` 提示当前 `1.0.48`，最新 `1.0.57`。
