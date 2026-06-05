# 2026-06-05 H5 本地静态资源 basePath 验证

## 背景

线上 H5 运行在 `/h5-v/<version>` basePath 下，业务组件直接写 `/assets/...` 会导致图片请求落到域名根路径，绕过当前版本目录。本轮验证用于确认推广模块新增和既有本地图片均通过 `localAssetUrl()` 输出版本前缀。

## 验证命令

```bash
rg 'src="/assets|href="/assets|url\(/assets|heroBackgroundSrc' -n src/features/promotion src/lib/assets AGENTS.md
pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts
pnpm typecheck
pnpm lint
```

## 结果

- `rg`：业务源码未发现裸本地资源引用，剩余命中为 `AGENTS.md` / `PAGE_DEVELOPMENT_GUIDE.md` 的禁止规则和测试断言。
- `pnpm exec vitest run src/features/promotion/promotion-service.test.ts src/lib/assets/asset-url.test.ts`：通过，2 files / 17 tests。
- `pnpm typecheck`：通过。
- `pnpm lint`：通过，0 errors，4 warnings。warning 均为 Next 对 `<img>` 的性能提示，来源于当前本地切图渲染方式。

## 验收结论

- 活动中心 icon、活动详情 hero 背景、奖励记录背景和奖励记录 icon 已通过资源 key 渲染。
- 在 `NEXT_PUBLIC_H5_BASE_PATH=/h5-v/v1.0.9` 场景下，渲染 HTML 输出 `/h5-v/v1.0.9/assets/...`。
- 新增页面必须继续遵守 `AGENTS.md` 的静态资源约束。
