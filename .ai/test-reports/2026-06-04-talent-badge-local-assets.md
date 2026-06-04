# 2026-06-04 达人徽章本地图片资源验证

## 范围

- V1-V5 达人徽章 PNG 放入 `public/assets/promotion/talent-badges/`。
- 新增 `src/lib/assets/local-assets.ts` 作为本地稳定资源 registry。
- `TalentBadge` 使用 `theme.badgeAssetKey` 读取本地图片资源。
- 更新静态资源规范和项目状态文档。

## 验证命令

| 命令 | 结果 |
| --- | --- |
| `file public/assets/promotion/talent-badges/*.png` | 5 张图片均为 348x348 RGBA PNG |
| `pnpm test src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts` | 通过，2 files / 9 tests |
| `pnpm typecheck` | 通过 |
| `pnpm lint` | 通过 |

## 说明

- `TalentBadge` 使用原生 `<img>`，因为 `localAssetUrl()` 未来可能返回版本 basePath 或外部 CDN 地址；`next/image` 需要额外 remote 配置，不适合当前统一资源 helper。
- 本轮不发布线上，不修改 manifest，不改变后端或原生契约。
