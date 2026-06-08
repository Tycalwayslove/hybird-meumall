# 2026-06-05 H5 本地 dev 图片 basePath 验证

## 问题

本地访问：

```text
http://localhost:3109/hybird/promotion/benefits?level=v3
```

权益中心图片在浏览器中可能不展示。

## 根因

- 服务端 HTML 中图片地址正确，形如 `/hybird/assets/promotion/equity/equity-bg-v3.png`。
- 图片文件通过 `/hybird/assets/...` 能返回 200。
- 裸 `/assets/...` 在当前 basePath 下返回 404。
- 原根目录 `dev:h5` 和 `dev-all.sh` 只设置 `H5_BASE_PATH=/hybird`，没有设置 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`。
- 权益中心是客户端组件，hydrate 或切换等级后会重新执行 `localAssetUrl()`；浏览器端无法可靠读取非公开 `H5_BASE_PATH`，导致资源地址可能退回裸 `/assets/...`。

## 修复

- 根目录 `package.json` 的 `dev:h5` 增加 `NEXT_PUBLIC_H5_BASE_PATH=/hybird`。
- `scripts/root/dev-all.sh` 启动 H5 时增加 `NEXT_PUBLIC_H5_BASE_PATH="${H5_BASE_PATH}"`。
- `next.config.ts` 优先读取 `process.env.NEXT_PUBLIC_H5_BASE_PATH`，再 fallback 到 `process.env.H5_BASE_PATH`。
- `asset-url.test.ts` 增加 `next.config.ts` 防回归断言。

## 验证

```bash
pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts
pnpm typecheck
H5_BASE_PATH=/hybird NEXT_PUBLIC_H5_BASE_PATH=/hybird pnpm exec next dev -H localhost -p 3109
curl -sS -I 'http://localhost:3109/hybird/promotion/benefits?level=v3'
curl -sS 'http://localhost:3109/hybird/promotion/benefits?level=v3' | rg 'src="/assets|url\\(/assets'
curl -sS -I http://localhost:3109/hybird/assets/promotion/equity/equity-bg-v3.png
curl -sS -I http://localhost:3109/assets/promotion/equity/equity-bg-v3.png
```

结果：

- `vitest`：通过，2 files / 20 tests。
- `typecheck`：通过。
- `/hybird/promotion/benefits?level=v3`：返回 200。
- 页面 HTML 中未发现裸 `src="/assets` 或 `url(/assets`。
- `/hybird/assets/promotion/equity/equity-bg-v3.png`：返回 200。
- `/assets/promotion/equity/equity-bg-v3.png`：返回 404，符合 basePath 预期。

## 后续注意

手动启动 H5 dev server 时必须同步设置：

```bash
H5_BASE_PATH=/hybird NEXT_PUBLIC_H5_BASE_PATH=/hybird pnpm exec next dev -H localhost -p 3109
```

优先使用根目录：

```bash
pnpm run dev:h5
```
