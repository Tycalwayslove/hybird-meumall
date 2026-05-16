# 验证：SSR 切流与回滚演练

## 日期

2026-05-15

## 范围

- 生成稳定、灰度和回滚三份 manifest 草案。
- 使用本地 SSR 服务验证健康检查和核心路由。
- 使用 `ai:resolve-manifest` 验证稳定用户、灰度用户和回滚后的版本选择。

## 命令

```bash
H5_BASE_PATH=/hybird pnpm build
pnpm run ai:release-prepare --version 2026.05.15-001 --channel stable --rollback-version 2026.05.14-001 --rollout-percentage 0 --routes /,/category,/cart,/profile --service-base-url http://127.0.0.1:3109 --base-path /hybird --output-dir archives/releases/2026.05.15-switch-drill/stable
pnpm run ai:release-prepare --version 2026.05.15-002 --channel stable --rollback-version 2026.05.15-001 --rollout-percentage 1 --routes /,/category,/cart,/profile --service-base-url http://127.0.0.1:3109 --base-path /hybird --output-dir archives/releases/2026.05.15-switch-drill/gray
pnpm run ai:rollback --manifest archives/releases/2026.05.15-switch-drill/rollback/manifest.draft.json --target-version 2026.05.15-001 --reason "local switch drill rollback" --note archives/releases/2026.05.15-switch-drill/rollback/release-note.md
pnpm run ai:prepare-ssr-release --version 2026.05.15-switch-drill --environment prod --service-base-url http://127.0.0.1:3109 --base-path /hybird --output archives/releases/2026.05.15-switch-drill/ssr-release-plan.json
PORT=3109 HOSTNAME=127.0.0.1 pnpm start
pnpm run ai:smoke-ssr-release --plan archives/releases/2026.05.15-switch-drill/ssr-release-plan.json --output archives/releases/2026.05.15-switch-drill/ssr-smoke-report.json
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/stable/manifest.draft.json --route /category --user-id demo-gray
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/gray/manifest.draft.json --route /category --user-id demo-gray
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/gray/manifest.draft.json --route /category --user-id demo-stable
pnpm run ai:resolve-manifest --manifest archives/releases/2026.05.15-switch-drill/rollback/manifest.draft.json --route /category --user-id demo-gray --current-version 2026.05.15-002
```

## 结果

- SSR build 通过，路由为动态 SSR。
- SSR smoke 检查通过 5 个 URL。
- stable manifest：`demo-gray` 命中 `2026.05.15-001`。
- gray manifest：`demo-gray` 命中 `2026.05.15-002`，`demo-stable` 留在 `2026.05.15-001`。
- rollback manifest：`demo-gray` 携带当前异常版本 `2026.05.15-002` 时切回 `2026.05.15-001`。

## 备注

- 本地演练服务运行在 `http://127.0.0.1:3109/hybird`。
- 当前页面视觉不展示 H5 版本，版本命中结果通过 `ai:resolve-manifest` 查看。
