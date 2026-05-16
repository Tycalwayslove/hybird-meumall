# 验证：正式发版入口

## 日期

2026-05-16

## 范围

- hybird-meumall `ai:register-release` candidate 注册脚本。
- server-meumall release 注册、列表、发布 active、灰度和回滚 API。
- admin-meumall 正式发版操作台客户端和构建。
- GitHub Actions SSR release workflow 的 candidate 注册步骤。

## 命令

```bash
cd /Users/mac/company_code/server-meumall
. .venv/bin/activate && pytest

cd /Users/mac/company_code/admin-meumall
pnpm test && pnpm build

cd /Users/mac/company_code/hybird-meumall
pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm run ai:check-workflow --strict
git diff --check
```

## 本地 HTTP Smoke

```bash
cd /Users/mac/company_code/server-meumall
. .venv/bin/activate
DATABASE_PATH=/tmp/meumall-release-smoke.sqlite python -m uvicorn app.main:app --host 127.0.0.1 --port 4100
```

```bash
cd /Users/mac/company_code/hybird-meumall
pnpm run ai:register-release --version 2026.05.16-smoke --environment prod --service-base-url http://127.0.0.1:3109 --base-path /hybird --rollback-version 2026.05.15-001 --rollout-percentage 0 --routes /,/category,/cart,/profile --server-url http://127.0.0.1:4100 --execute
```

随后用 HTTP 调用验证：

- `POST /api/releases/{id}/promote` 后 active manifest `stableVersion` 为 `2026.05.16-smoke`。
- `POST /api/releases/{id}/gray` 后 active manifest 保持 stable 不变，`grayVersion` 为 `2026.05.16-smoke-gray`，`grayRules.percentage` 为 `35`。
- `POST /api/releases/{id}/rollback` 后 active manifest `stableVersion` 回到 `2026.05.15-001`，并将异常版本加入 `blacklistVersions`。

## 结果

- server-meumall：10 tests passed。
- admin-meumall：6 tests passed，Vite build passed。
- hybird-meumall：脚本测试 5 tests passed，应用测试 58 tests passed，typecheck/lint/workflow check passed。
- 本地 release 注册、发布、灰度和回滚 smoke passed。

## 备注

- 真实 CI 中需要配置 `H5_RELEASE_SERVER_URL` secret；`register_release=true` 时未配置该 secret 会主动失败。
- 正式生产仍需补 server-meumall 鉴权、审批流、审计日志和发布窗口控制。
