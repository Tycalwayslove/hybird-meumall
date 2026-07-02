# 2026-07-02 活动中心状态分页与历史活动验证

## 范围

- `/promotion/activities`
- `/promotion/activities/history`
- `/api/bff/promotion/activities`
- Java `/p/app/distribution/incentive/page`

## 变更点

- 活动中心首屏分别请求 `displayStates=[1,2,3,4]` 和 `displayStates=[0]`，展示进行中和已暂停活动。
- 历史活动页请求 `displayStates=[6]`，且不展示底部“历史活动”入口。
- 列表支持骨架屏、空态和加载更多。
- `createPromotionApi.getActivities` 统一支持 `displayStates` 数组参数。
- 活动详情 mapper 对 `rewards`、`reward.details`、`alreadyRewardIds` 和富文本规则字段做防御，避免真实接口返回非数组/非字符串时点击活动进入详情触发 JS 异常。
- 活动详情暂时只请求 `/p/app/distribution/incentive/detail/{id}`，不再聚合 `/p/app/distribution/incentive/reward/detail/{id}`；后续领奖逻辑明确后再恢复奖励详情调用。未拿到奖励记录时隐藏“我的奖励”区块。
- 活动详情 `banner` 支持相对路径拼接 `JAVA_OSS_ASSET_BASE_URL`，例如 `/banner/sale.jpg` 会映射为 OSS 完整地址。
- 活动详情顶部不再展示活动标题和 `ruleSummary` 规则摘要。
- 活动详情主按钮按 `displayState` 映射：`0/1/3` 不展示按钮，`2` 展示“去带货”，`4` 展示“去领奖”，`5` 展示“查看奖励”。
- 活动详情导航栏右侧入口从“奖励记录”改为“活动规则”，点击进入 `/promotion/activities/[id]/rules`，规则页展示清洗后的 `ruleContent` 富文本。
- H5 本地 dev 启动脚本显式使用 `next dev --webpack`，规避 Next 16 默认 Turbopack 在 `/promotion/activities/[id]` 动态 App Router 页生成的 ESM 模板内调用 `require('path')`，导致页面服务端渲染报 `ReferenceError: require is not defined`。

## 验证命令

- `pnpm exec vitest run src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts`：通过，3 files / 34 tests。
- `pnpm typecheck`：通过。
- `pnpm exec eslint 'src/app/promotion/activities/[slug]/rules/page.tsx' src/features/promotion/components/PromotionActivityDetailScreen.tsx src/features/promotion/components/PromotionActivityRulesScreen.tsx src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/rule-content.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/promotion-service.test.ts`：通过，0 errors，1 warning；warning 为详情页既有 `<img>` 规则提示。
- `pnpm exec eslint src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/components/PromotionActivityDetailScreen.tsx src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/promotion-service.test.ts`：通过，0 errors，1 warning；warning 为详情页既有 `<img>` 规则提示。
- `pnpm exec eslint src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/components/PromotionActivitiesScreen.tsx src/app/promotion/activities/page.tsx src/app/promotion/activities/history/page.tsx src/app/api/bff/promotion/activities/route.ts src/features/promotion/api.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts src/features/promotion/api.test.ts src/features/promotion/promotion-service.test.ts`：通过，0 errors。
- `pnpm exec eslint src/features/promotion/server/promotion-incentive-activities-real-service.ts src/features/promotion/promotion-incentive-activities-real-service.test.ts`：通过，0 errors。
- `pnpm run ai:check-docs-sync --strict`：通过。
- `git diff --check`：通过。
- `pnpm test:dev-script`（根目录）：通过。
- `curl -sS -D /tmp/activity101-after.headers http://localhost:3109/hybird/promotion/activities/101`：通过，页面返回 `HTTP/1.1 200 OK`，无 token 时展示“活动详情加载失败 / Unauthorized”，未再出现 `require is not defined`。
- `curl -sS -D /tmp/activity101-bff-after.headers http://localhost:3109/hybird/api/bff/promotion/activities/101`：通过，BFF 按预期返回 `HTTP/1.1 401 Unauthorized` 和可恢复错误 JSON。

## 结论

功能、文档同步和 diff 空白检查均已通过。

## 飞书同步

- 目标：`新款app开发资料 / 前端知识库 / 02 H5 页面清单与开发进度`
- 链接：<https://v05ctaei9gn.feishu.cn/wiki/WgaqwTRRUitnRNkCtNPcOcDnnre>
- 结果：已更新活动中心和活动详情表格行，`最近仓库更新` 改为 `2026-07-02`。
- 验证：`docs +fetch` 返回 `revision_id=65`，可见 `displayStates=[1,2,3,4]`、`/promotion/activities/history`、`/promotion/activities/[id]` 只请求详情接口，以及详情页不展示标题/`ruleSummary`、按钮按 `displayState` 映射；飞书表格详情行备注已可检索 `/promotion/activities/[id]/rules`。
- 备注：尝试在文档末尾追加同步记录时，`lark-cli docs +update --command append` 和 `block_insert_after --block-id -1` 均返回 `result=failed`、`Block ID transform failed`；未影响页面清单表格更新。
