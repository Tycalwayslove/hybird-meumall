# 2026-06-05 H5 客户端静态资源 basePath 验证

## 背景

权益中心是客户端组件，左右切换等级时会重新计算背景图、徽章、箭头和权益 icon 的 URL。线上 H5 运行在 `/h5-v/<version>` basePath 下，如果客户端 bundle 没有内联 `NEXT_PUBLIC_H5_BASE_PATH`，切换后可能退回裸 `/assets/...`，导致图片 404。

## 变更验证

1. 先新增 `asset-url.test.ts` 防回归测试，断言 `src/lib/assets/asset-url.ts` 不允许出现动态 `process.env[` 读取。
   - 修复前：`pnpm exec vitest run src/lib/assets/asset-url.test.ts` 失败，命中 `process.env[key]`。
   - 修复后：同命令通过，1 file / 6 tests。

2. 回归推广模块静态资源测试。
   - 命令：`pnpm exec vitest run src/lib/assets/asset-url.test.ts src/features/promotion/promotion-service.test.ts`
   - 结果：通过，2 files / 18 tests。

3. 使用版本 basePath 生产构建。
   - 命令：`rm -rf .next && H5_BASE_PATH=/h5-v/v-check NEXT_PUBLIC_H5_BASE_PATH=/h5-v/v-check pnpm build`
   - 结果：通过。

4. 构建产物检查。
   - 命令：`rg 'process\.env\[' -n .next/static .next/server .next/standalone`
   - 结果：无命中。
   - 产物片段确认：客户端 chunk 中 `assetUrl()` 已内联为 `e.basePath ?? "/h5-v/v-check"`。

5. HTTP HTML smoke。
   - 命令：`PORT=3109 HOSTNAME=127.0.0.1 node .next/standalone/server.js`
   - 请求：`http://127.0.0.1:3109/h5-v/v-check/promotion/benefits?level=v2`
   - 结果：HTML 中 `src="/assets/`、`href="/assets/`、`url(/assets/` 均为 0；`/h5-v/v-check/assets/promotion` 出现 19 次。
   - 备注：本地直接运行 `.next/standalone/server.js` 时，`.next/standalone` 默认没有 `public` 目录，单独请求图片文件会 404；线上 Dockerfile 已执行 `COPY --from=builder /app/hybird-meumall/public ./public`，容器内会包含 `public/assets`。

6. 工程检查。
   - `pnpm typecheck`：通过。
   - `pnpm lint`：通过，仍有 4 条历史 `<img>` 性能 warning，无 error。

## 结论

本次修复解决的是客户端 bundle 的资源 basePath 内联问题。服务端首屏和客户端切换后都会通过同一个 `assetUrl()` 路径规则拼接 `/h5-v/<version>/assets/...`。线上需要发布新 H5 版本后才会生效。
