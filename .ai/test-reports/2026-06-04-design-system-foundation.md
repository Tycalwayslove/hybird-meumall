# 2026-06-04 H5 Design System 基础验证

## 范围

- Figma 色彩 token 落地到 `src/design-system/tokens`。
- Tailwind 语义 token、扫描范围和默认 light 主题变量更新。
- 推广首页拆分为页面编排、业务组件和达人主题配置。
- 设计体系说明、主题规范、编码规则和 ADR 更新。

## 验证命令

| 命令 | 结果 |
| --- | --- |
| `pnpm test src/lib/theme/__tests__/tokens.test.ts src/features/promotion/promotion-service.test.ts` | 通过，2 files / 6 tests |
| `pnpm test src/server/http/backend-client.test.ts` | 通过，1 file / 2 tests |
| `pnpm test` | 通过，21 files / 96 tests |
| `pnpm typecheck` | 通过 |
| `pnpm lint` | 通过 |
| `pnpm build` | 通过 |
| `rg` 检查推广首页和 design-system 的直接十六进制颜色 class | 未发现 |
| `curl -I http://localhost:3112/promotion` | 200 OK |

## 说明

- `pnpm typecheck` 首次与 `pnpm build` 并行执行时，遇到 `.next/types` 生成时机冲突；构建完成后单独重跑已通过。
- 本轮只将推广首页作为 design-system 样板页；活动中心、榜单中心、榜单详情和权益中心后续仍需继续迁移。
