# 验证：我的页达人等级图片徽章

## 日期

2026-06-12

## 范围

- `/mine` 用户昵称后的达人等级展示。
- `mine.levelBadge.v1-v5` 本地资源注册和 basePath 解析。
- 本地 dev server 下 `/hybird/mine` SSR 输出和图片资源可访问性。

## 命令

```bash
cd hybird-meumall
pnpm exec vitest run src/lib/assets/asset-url.test.ts
pnpm typecheck
curl -sS -I http://localhost:3109/hybird/mine
curl -sS http://localhost:3109/hybird/mine | rg -n "level-badge|V3黄金达人|mine/level-badges"
curl -sS -I http://localhost:3109/hybird/assets/mine/level-badges/level-badge-v3.png
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless --disable-gpu --no-first-run --no-default-browser-check --user-data-dir=/tmp/meumall-chrome-profile --window-size=390,844 --screenshot=/tmp/meumall-mine-level-badge.png http://localhost:3109/hybird/mine
```

## 结果

- `pnpm exec vitest run src/lib/assets/asset-url.test.ts`：通过，1 file / 7 tests。
- `pnpm typecheck`：通过。
- `/hybird/mine`：HTTP 200。
- `/hybird/mine` HTML 包含 `/hybird/assets/mine/level-badges/level-badge-v3.png`，并保留 `alt="V3黄金达人"`。
- `/hybird/assets/mine/level-badges/level-badge-v3.png`：HTTP 200，`Content-Type: image/png`。
- Chrome headless 截图已生成到 `/tmp/meumall-mine-level-badge.png`，390x844 视口下昵称后的 V3 图片横条可见。

## 备注

- 当前 H5 项目未安装 Playwright，截图验证改用本机 Chrome headless。
- 本次未修改商品详情、订单确认、BFF 或首页实现文件。
