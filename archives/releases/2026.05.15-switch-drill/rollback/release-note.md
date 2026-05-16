# Release 2026.05.15-002

## 摘要

- 本文件由本地 release-prepare 脚本生成，尚未发布。

## 渠道

- stable

## 灰度

- 类型：percentage
- 比例：1

## 路由

| Route | Delivery | Notes |
| --- | --- | --- |
| / | remote |  |
| /category | remote |  |
| /cart | remote |  |
| /profile | remote |  |

## SSR 产物

- Runtime：.next/standalone/server.js
- Static：.next/static
- Public：public

## Manifest 草案

- manifest.draft.json

## 验证

- pending

## 回滚方案

- 回滚目标：2026.05.15-001

## 风险

- 未接真实 SSR 部署平台。
- 未发布 manifest。
## 2026-05-15 - 回滚草案

### 原因

- local switch drill rollback

### 版本变化

- 原 stable version：2026.05.15-001
- 回滚目标版本：2026.05.15-001

### 约束

- 仅修改 manifest 草案，未重新构建。
