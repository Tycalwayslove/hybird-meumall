# 2026-06-04 推广二级页 Design System 迁移验证

## 范围

- 活动中心 `/promotion/activities`
- 榜单中心 `/promotion/rank-center`
- 达人销量榜 `/promotion/ranking/sales`
- 达人销售额榜 `/promotion/ranking/amount`
- 达人权益中心 `/promotion/benefits`
- 推广模块通用 Shell、空态、错误态和加载态

## 验证命令

| 命令 | 结果 |
| --- | --- |
| `rg -n "bg-\\[#[0-9A-Fa-f]\|text-\\[#[0-9A-Fa-f]\|border-\\[#[0-9A-Fa-f]\|from-\\[#[0-9A-Fa-f]\|to-\\[#[0-9A-Fa-f]" src/features/promotion/components src/features/promotion/pages src/design-system` | 通过，未发现直接十六进制颜色 class |
| `pnpm test src/features/promotion/promotion-service.test.ts src/design-system/tokens/design-tokens.test.ts` | 通过，2 files / 7 tests |
| `pnpm test` | 通过，21 files / 96 tests |
| `pnpm lint` | 通过 |
| `pnpm typecheck` | 通过 |
| `pnpm build` | 通过 |
| `curl` smoke：`/promotion/activities`、`/promotion/rank-center`、`/promotion/ranking/sales`、`/promotion/ranking/amount`、`/promotion/benefits` | 均返回 200 |

## 说明

- 第一次 smoke 命令使用了 `path` 作为 zsh 变量名，导致 PATH 被覆盖，`curl` 查找失败；改用 `route` 变量后重跑通过。
- 本轮不涉及线上发布、不修改 manifest、不改变后端接口契约。
