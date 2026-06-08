# 2026-06-05 推广排行榜最新版 Figma 验证报告

## 背景

- 需求：完善达人销量榜和达人销售额榜。
- 设计来源：
  - 达人销量榜：Figma `270:5973`
  - 达人销售额榜：Figma `277:6570`
- 本轮不下载 Figma 临时图片资源；领奖台背景和皇冠使用用户提供的本地 PNG，并通过 `localAssetUrl()` 解析版本 basePath。

## 变更范围

- `src/features/promotion/components/PromotionRankingScreen.tsx`
- `src/features/promotion/mock/rankings.ts`
- `src/app/promotion/ranking/amount/page.tsx`
- `src/design-system/tokens/colors.ts`
- `src/styles/globals.css`
- `src/design-system/tokens/design-tokens.test.ts`
- `src/features/promotion/promotion-service.test.ts`
- `public/assets/promotion/ranking/`

## 验证命令

```bash
pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts src/design-system/tokens/design-tokens.test.ts
pnpm typecheck
pnpm lint
pnpm build
```

## 验证结果

- 目标测试通过：3 files / 22 tests。
- TypeScript 检查通过。
- Lint 通过；存在 4 条历史 `<img>` warning，无 error。
- 生产构建通过。
- CDP 移动端 375x812 smoke 通过：
  - `/hybird/promotion/ranking/sales`
  - `/hybird/promotion/ranking/amount`
  - `innerWidth`、`clientWidth`、`scrollWidth`、`bodyScrollWidth` 均为 375。
  - 领奖台卡片边界为 7-127、127.5-247.5、247-367，右侧保留 8px，不存在横向溢出。
  - 销售额榜默认 active 为“达人销售额榜 / 周榜”。

## 备注

- 当前榜单头像仍使用 H5 mock 渐变头像；后续真实头像应由后端或 CMS 返回远程 URL。
- H5 版本标识会在本地和线上页面右上角展示，视觉对比 Figma 时需要意识到这是项目调试/版本识别能力，不属于 Figma 页面主体。
