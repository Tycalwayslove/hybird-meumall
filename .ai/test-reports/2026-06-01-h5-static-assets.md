# H5 静态资源体系验证记录

## 任务

为 H5 生产化首页改造建立静态资源目录、引用 helper、manifest 字段和发布脚本参数。

## 验证日期

2026-06-01

## 覆盖范围

- `public/assets` 目录规范。
- `assetUrl()` 公共资源路径解析。
- manifest `assets.publicAssetBaseUrl` schema 校验。
- `release-prepare`、`update-manifest`、`register-release` 的 `--public-asset-base-url` 参数。
- 发布规范、决策记录和变更记录。

## 自动验证

- `pnpm test`：通过，11 个测试文件，64 个测试。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过。
- `pnpm build`：通过。
- `pnpm exec vitest run --config scripts/ai/vitest.config.ts scripts/ai/release-manifest.test.ts`：通过。
- `pnpm run ai:check-workflow`：通过。

## 发布脚本 smoke

执行：

```bash
pnpm run ai:release-prepare \
  --version 2026.06.01-assets-smoke \
  --channel stable \
  --rollback-version 2026.05.31-001 \
  --rollout-percentage 0 \
  --routes "/,/promotion,/mine" \
  --service-base-url "https://h5.example.com" \
  --base-path "/hybird" \
  --public-asset-base-url "https://cdn.example.com/meumall/h5/2026.06.01-assets-smoke" \
  --output-dir /tmp/meumall-assets-release-smoke
```

结果：

- 成功生成 `/tmp/meumall-assets-release-smoke/manifest.draft.json`。
- `manifest.draft.json` 的 `assets.publicAssetBaseUrl` 为 `https://cdn.example.com/meumall/h5/2026.06.01-assets-smoke`。
- `/`、`/promotion`、`/mine` 路由进入 manifest 草案。

## 结论

H5 内置静态资源现在有统一目录和引用入口；生产可通过 `publicAssetBaseUrl` 切到 CDN；原生离线包可以复用 `public/assets` 和 `.next/static` 作为缓存/兜底资源。
