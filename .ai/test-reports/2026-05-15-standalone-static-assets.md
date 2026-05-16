# 验证：standalone SSR 静态资源

## 日期

2026-05-15

## 范围

- 修复本地 standalone SSR 服务返回 HTML 后，`/hybird/_next/static/*` CSS/JS 资源 404 的问题。
- 确认 `.next/static` 和 `public` 已复制到 `.next/standalone` 运行目录。

## 命令

```bash
pnpm run ai:prepare-standalone-assets
curl -I http://127.0.0.1:3109/hybird/_next/static/chunks/0fhdp5vz98u_y.css
curl -I http://127.0.0.1:3109/hybird/category
curl -sS http://127.0.0.1:3109/hybird/category \
  | rg -o '/hybird/_next/static/[^" ]+' \
  | head -n 10
pnpm run ai:check-workflow --strict
git diff --check
```

## 结果

- CSS chunk `0fhdp5vz98u_y.css` 返回 `200 OK`，缓存头为 `public, max-age=31536000, immutable`。
- `/hybird/category` 返回 `200 OK`。
- 页面引用的前 10 个 `_next/static` CSS/JS 资源均返回 `200`。
- AI 工作流检查通过。
- `git diff --check` 通过。

## 备注

- Next.js standalone 输出不会自动复制 `.next/static` 和 `public` 到 `.next/standalone`。直接运行 `.next/standalone/server.js` 前需要执行 `pnpm run ai:prepare-standalone-assets`，或在部署流水线中做等价复制。
