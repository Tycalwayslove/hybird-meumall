# 2026-06-04 推广首页达人背景与汇总卡背景资源验证

## 范围

- V1-V5 推广首页达人背景图：`talent-hero-bg-v*.png`
- V1-V5 汇总卡背景图：`talent-summary-card-v*.png`
- `local-assets.ts` 本地资源 key 注册
- `TalentHero` 和 `TalentSummaryCard` 背景图引用

## 验证命令

| 命令 | 结果 |
| --- | --- |
| `file public/assets/promotion/talent-badges/talent-hero-bg-v*.png public/assets/promotion/talent-badges/talent-summary-card-v*.png` | hero 背景均为 1125x798 RGBA PNG，summary card 背景均为 1053x342 RGBA PNG |
| `pnpm test src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts` | 通过，2 files / 9 tests |
| `pnpm typecheck` | 通过 |
| `pnpm lint` | 通过 |
| `pnpm build` | 通过 |
| `curl` smoke：10 张新增图片资源 | 均返回 200 |
| `/promotion?level=v4` HTML 检查 | 已引用 `talent-hero-bg-v4.png` 和 `talent-summary-card-v4.png` |

## 说明

- 页面背景图和汇总卡背景图通过 `localAssetUrl()` 解析，支持 H5 basePath 和后续 CDN 前缀。
- 原等级渐变仍保留在 inline background fallback 中，用于图片加载失败或资源未命中时兜底。
- 本轮不涉及线上发布、不修改 manifest、不改变后端或原生契约。
