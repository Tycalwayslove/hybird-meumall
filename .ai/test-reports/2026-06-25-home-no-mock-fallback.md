# 2026-06-25 首页移除本地 mock fallback

## 范围

- 首页客户端请求 `/api/bff/home` 失败时不再回退 `homeExperienceData`。
- 首页 BFF mapper 缺失 banner、分类或推荐商品时返回空业务数据，不再用本地静态样例补齐。
- 首页“限时秒杀”和“推广带货”入口卡已改为 H5 固定 UI，分别固定跳转 `/seckill` 和 `/promotion/products`，不再由首页聚合接口或配置模块控制。
- 首页聚合数据按 Apifox 最新 schema 读取 `navList` 作为分类区来源，不再拼接 `hotCategory + categoryTop8`。
- banner 或分类接口数据为空时展示骨架屏，不展示本地 mock banner 或 mock 分类。
- 保留 logo、消息、更多、推荐标题、秒杀/推广入口背景等 UI 静态资源 key；这些不是业务数据兜底。
- 首页失败时展示错误态，真实接口空业务模块时展示空业务态；固定活动入口随页面 UI 保留。

## 验证

```bash
cd /Users/mac/person_code/meu-mall/hybird-meumall
pnpm exec vitest run src/features/home/home-real-api.test.ts src/features/home/home.test.tsx
pnpm exec vitest run src/features/home
pnpm test
pnpm typecheck
pnpm lint
pnpm run build
pnpm run ai:check-docs-sync --strict
```

- `pnpm exec vitest run src/features/home/home-real-api.test.ts src/features/home/home.test.tsx`：通过，2 files / 27 tests。
- `pnpm exec vitest run src/features/home`：通过，4 files / 35 tests。
- `pnpm test`：通过，56 files / 307 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings；warning 均为 promotion 模块既有 `<img>` 提示。
- `pnpm run build`：通过，路由表包含 `/`、`/api/bff/home`、`/api/bff/home/recommend-products`、`/api/bff/home/for-you-products`。
- `pnpm run ai:check-docs-sync --strict`：通过，共 15 个文件。

## 说明

- 这次只改 H5，不跑 iOS。
- 首页正式联调数据必须以 Java BFF 返回为准；接口 500、401 或业务失败不展示本地 mock 业务数据。
- “限时秒杀/推广带货”是固定页面入口，不是 Java 首页聚合业务数据；对应商品列表仍进入 `/seckill` 和 `/promotion/products` 后请求各自真实 BFF。

## 飞书同步

- 目标页面：`https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre`
- 仓库事实源：`.ai-workspace/product/page-inventory.md`
- `lark-cli docs +update --as bot`：返回外层 `ok=true`，但内部 `result=failed`，`4030004 No permission to operate on this document`，revision 仍为 `12`。
- 2026-06-25 16:43 再次同步：
  - `--as user`：失败，`need_user_authorization`，缺少 `docx:document:write_only` / `docx:document:readonly` 授权。
  - `--as bot`：外层 `ok=true`，内部 `result=failed`，`4030004 No permission to operate on this document`，revision 仍为 `12`。
- 结论：本地知识库事实源已更新，飞书同步被 Bot 文档权限阻塞，待给 Bot 目标文档编辑权限后重试。
- 2026-06-25 19:35 再次同步：
  - `lark-cli docs +update --api-version v2 --as user --doc <页面清单> --command overwrite --doc-format markdown --content @.ai-workspace/product/page-inventory.md --json`：success。
  - 飞书 revision：28。
  - 关键词校验：`固定 UI`、`不靠首页配置` 均命中。
