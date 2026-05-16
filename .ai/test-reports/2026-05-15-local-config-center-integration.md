# 验证：本地配置中心闭环

## 日期

2026-05-15

## 范围

- `server-meumall` FastAPI + SQLite manifest 配置中心。
- `admin-meumall` 配置发布后台。
- `hybird-meumall` 通过 server active manifest endpoint 获取配置。

## 命令

```bash
cd /Users/mac/company_code/server-meumall
. .venv/bin/activate && pytest

cd /Users/mac/company_code/admin-meumall
pnpm test
pnpm build

cd /Users/mac/company_code/hybird-meumall
pnpm exec vitest run src/lib/manifest/server-fetcher.test.ts
pnpm typecheck
pnpm lint
```

## 端到端 Smoke

```bash
GET http://127.0.0.1:4100/api/health
GET http://127.0.0.1:4100/api/h5/manifest/active?environment=prod
POST http://127.0.0.1:4100/api/configs
POST http://127.0.0.1:4100/api/configs/{id}/publish
GET http://127.0.0.1:5173/
HEAD http://127.0.0.1:3109/hybird/category
```

## 结果

- `server-meumall` pytest 通过：3 passed。
- `admin-meumall` Vitest 通过：3 passed；生产构建通过。
- `hybird-meumall` manifest fetcher 测试通过：4 passed；typecheck 和 lint 通过。
- 临时 SQLite 数据库 HTTP smoke 通过，发布后的 active manifest 命中 `2026.05.15-002`。
- 本地服务联调通过：
  - server：`http://127.0.0.1:4100`
  - admin：`http://127.0.0.1:5173`
  - hybird SSR：`http://127.0.0.1:3109/hybird/category`

## 备注

- 当前 server 使用 SQLite，适合本地和早期验证。生产化仍需补权限、审批、审计日志和数据库迁移策略。
