# 2026-06-27 推广排行榜真实接口联调验证

## 范围

- `/promotion/ranking/sales`
- `/promotion/ranking/amount`
- `/promotion/ranking/incentive`
- `/api/bff/promotion/rankings/sales`
- `/api/bff/promotion/rankings/amount`

## 验证结果

| 命令 | 结果 | 说明 |
| --- | --- | --- |
| `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/features/promotion/api.test.ts src/lib/http/h5-client.test.ts` | 通过 | 3 files / 26 tests |
| `pnpm typecheck` | 通过 | TypeScript 无错误 |

## 覆盖点

- 销量榜请求 Java `/p/distribution/rank/list?period=<n>&rankType=1`。
- 销售额榜请求 Java `/p/distribution/rank/list?period=<n>&rankType=2`。
- `period=day/week/month` 映射为 `1/2/3`，可选 `statPeriod` 透传。
- Java `rankList` 映射为前三名领奖台和后续列表。
- Java `myRank` 映射到底部我的排名。
- 空榜展示空态，不回退 mock 榜单。
- 达人激励榜 `/promotion/ranking/incentive` 展示空态，不请求 `rankType=4`。
- 页面内切换 BFF 请求使用 `buildH5ApiPath()` 拼接 H5 basePath，避免版本路径下请求错位。
- 切换榜单和周期时只展示内容区骨架，不展示“加载中”文案。

## 待联调

- App WebView 写入有效 `mallToken` 后，验证 test 环境真实返回。
- 后端确认销售额榜 `score` 单位和后续是否单独接排行榜战报分享口径。
