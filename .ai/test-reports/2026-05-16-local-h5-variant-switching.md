# 验证：本地 H5 多版本切换

## 日期

2026-05-16

## 范围

- H5 blue、green、rose 三份本地 SSR 服务。
- server-meumall 中三份 manifest 配置。
- admin 发布 active manifest 后 iOS WebView 可刷新配置查看效果。

## 命令

```bash
pnpm typecheck
pnpm lint
H5_BASE_PATH=/hybird pnpm build
pnpm run ai:prepare-standalone-assets

curl http://127.0.0.1:3109/hybird/category
curl http://127.0.0.1:3110/hybird/category
curl http://127.0.0.1:3111/hybird/category
```

## 结果

- `3109` 返回 `data-release-variant="blue"` 和 `data-release-label="BLUE 2026.05.16"`。
- `3110` 返回 `data-release-variant="green"` 和 `data-release-label="GREEN 2026.05.16"`。
- `3111` 返回 `data-release-variant="rose"` 和 `data-release-label="ROSE 2026.05.16"`。
- `server-meumall` 已写入 `H5 BLUE/GREEN/ROSE 2026.05.16` 三份配置。
- 发布 smoke 已验证 active 从 green 切换成功，并恢复为 blue。
- iOS `Info.plist`、entitlements 校验通过，`git diff --check` 通过。

## 备注

- 当前地址使用 `127.0.0.1`，适合 iOS Simulator。真机需要换成 Mac 的局域网 IP。
