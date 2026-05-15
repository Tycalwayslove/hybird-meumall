# 验证：SSR-only 发布与回滚

## 日期

2026-05-15

## 范围

- manifest 资源模型收敛为 SSR 服务入口。
- release/manifest/rollback 脚本改为 SSR-only。
- 新增 SSR release plan、SSR smoke 和健康检查接口。
- 默认配置面移除 OSS/SSG 发布入口和 OSS 发布脚本。

## 命令

```bash
pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts scripts/ai/ssr-release.test.ts
pnpm test
pnpm typecheck
pnpm lint
pnpm run ai:check-workflow --strict
git diff --check
rm -rf .next out archives/releases/2026.05.15-ssr-only-check
H5_BASE_PATH=/hybird pnpm build
test -f .next/standalone/server.js
test -d .next/static
test ! -d out
pnpm run ai:release-prepare --version 2026.05.15-ssr-only-check --channel stable --rollback-version 2026.05.14-001 --rollout-percentage 0 --routes /,/category,/cart,/profile --service-base-url http://127.0.0.1:3107 --base-path /hybird --output-dir archives/releases/2026.05.15-ssr-only-check
pnpm run ai:prepare-ssr-release --version 2026.05.15-ssr-only-check --environment prod --service-base-url http://127.0.0.1:3107 --base-path /hybird --output archives/releases/2026.05.15-ssr-only-check/ssr-release-plan.json
PORT=3107 HOSTNAME=127.0.0.1 pnpm start
pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.15-ssr-only-check/ssr-release-plan.json --output archives/releases/2026.05.15-ssr-only-check/ssr-smoke-report.json
```

## 结果

- 脚本 Vitest 2 个测试文件、6 个测试通过。
- 应用 Vitest 9 个测试文件、54 个测试通过。
- TypeScript、ESLint、AI workflow strict check 和 diff whitespace check 均通过。
- `H5_BASE_PATH=/hybird pnpm build` 通过，路由均为 `ƒ (Dynamic) server-rendered on demand`。
- `.next/standalone/server.js` 和 `.next/static` 已生成。
- `out/` 未生成。
- SSR manifest 草案和 `ssr-release-plan.json` 已生成。
- 本地 standalone 服务可启动，SSR smoke 检查 5 个 URL 通过。

## 备注

- 临时校验版本为 `2026.05.15-ssr-only-check`。
- 本次不发布 active manifest，不访问真实外部部署平台。
